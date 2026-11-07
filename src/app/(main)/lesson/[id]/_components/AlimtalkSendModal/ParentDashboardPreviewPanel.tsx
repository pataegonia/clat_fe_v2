'use client'

import { useEffect, useRef, useState } from 'react'
import Text from '@/components/common/Text'
import useToast from '@/hooks/useToast'
import { lessonService, type ParentPreviewResult } from '@/services/lesson'
import type { ParentDashboardData } from '@/services/parentDashboard'
import ParentDashboardView from '@/app/parent/_components/ParentDashboardView'
import * as parentStyles from '@/app/parent/[token]/parentDashboard.css'
import FeedbackReviewNotice from './FeedbackReviewNotice'
import * as styles from './AlimtalkSendModal.css'

function toDashboardData(preview: ParentPreviewResult): ParentDashboardData {
  return {
    student_name: preview.student_name,
    class_name: preview.class_name,
    academy_name: preview.academy_name,
    lesson_date: preview.lesson_date,
    lesson_summary: preview.lesson_summary,
    ai_feedback: preview.ai_feedback,
    ai_feedback_status: preview.ai_feedback_status,
    show_ai_label: preview.show_ai_label,
    incomplete_items: preview.incomplete_items ?? [],
    recent_lessons: preview.recent_lessons ?? [],
  }
}

interface ParentDashboardPreviewPanelProps {
  lessonId: number
  studentId: number
  preview: ParentPreviewResult | null
  loading: boolean
  regenerating: boolean
  onRegenerate: () => void
  onSaved: (preview: ParentPreviewResult) => void
}

export default function ParentDashboardPreviewPanel({
  lessonId,
  studentId,
  preview,
  loading,
  regenerating,
  onRegenerate,
  onSaved,
}: ParentDashboardPreviewPanelProps) {
  const { success, error } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)
  const savingRef = useRef(false)
  const [editing, setEditing] = useState(false)
  const [memoOpen, setMemoOpen] = useState(false)
  const [note, setNote] = useState('')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const mode = preview?.feedback_mode ?? 'AUTO'
  const showRegenerate = Boolean(
    preview &&
      !editing &&
      mode !== 'MANUAL' &&
      (preview.stale || preview.ai_feedback_status !== 'pending'),
  )

  useEffect(() => {
    setEditing(false)
    setMemoOpen(false)
    setNote(preview?.teacher_note ?? '')
    setText(preview?.ai_feedback ?? '')
  }, [preview?.student_id])

  useEffect(() => {
    if (editing) return
    setText(preview?.ai_feedback ?? '')
  }, [editing, preview?.ai_feedback])

  useEffect(() => {
    if (memoOpen) return
    setNote(preview?.teacher_note ?? '')
  }, [memoOpen, preview?.teacher_note])

  const saveText = async () => {
    if (!preview || savingRef.current) return
    if (text === (preview.ai_feedback ?? '')) {
      setEditing(false)
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const saved = await lessonService.saveParentPreview(lessonId, studentId, {
        ai_feedback: text,
      })
      setEditing(false)
      onSaved(saved)
      success('피드백을 저장했어요.')
    } catch {
      error('피드백을 저장하지 못했어요.')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  const saveTextRef = useRef(saveText)
  saveTextRef.current = saveText

  useEffect(() => {
    if (!editing) return
    const onPointerDown = (event: PointerEvent) => {
      const root = editorRef.current
      const target = event.target
      if (root && target instanceof Node && root.contains(target)) return
      void saveTextRef.current()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [editing])

  const saveNote = async () => {
    if (!preview) return
    if (note.trim() === (preview.teacher_note ?? '').trim()) {
      setMemoOpen(false)
      return
    }
    setSaving(true)
    try {
      const saved = await lessonService.saveParentPreview(lessonId, studentId, {
        teacher_note: note,
      })
      setMemoOpen(false)
      onSaved(saved)
      success(note.trim() ? '메모를 다듬고 있어요.' : '메모를 저장했어요.')
    } catch {
      error('메모를 저장하지 못했어요.')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !preview) {
    return (
      <Text variant="bodyMd" color="gray500">
        불러오는 중…
      </Text>
    )
  }

  if (!preview) {
    return (
      <Text variant="bodyMd" color="gray500">
        학생을 선택하면 학부모가 볼 화면이 나와요.
      </Text>
    )
  }

  return (
    <div>
      {preview.stale ? (
        <div className={styles.staleBanner}>
          <Text variant="titleSm" color="gray900">
            수업 입력이 바뀌었어요
          </Text>
          <Text variant="bodyMd" color="gray700">
            학부모가 볼 피드백을 다시 만들 수 있어요. 고친 글은 그대로 남아요.
          </Text>
        </div>
      ) : (
        // 수업 입력이 바뀌었으면 지난 기록으로 한 검수라 보여 주지 않는다.
        <FeedbackReviewNotice review={preview.review} />
      )}
      <ParentDashboardView
        data={toDashboardData(preview)}
        embed
        onEditFeedback={editing ? undefined : () => setEditing(true)}
        feedbackExtra={
          <div className={parentStyles.feedbackActions}>
            {preview.edited_at ? (
              <span className={parentStyles.textActionMuted}>수정함</span>
            ) : null}
            {mode === 'ASSIST' ? (
              <button
                type="button"
                className={parentStyles.textAction}
                onClick={() => setMemoOpen((open) => !open)}
              >
                작성하기
              </button>
            ) : null}
            {showRegenerate ? (
              <button
                type="button"
                className={parentStyles.textAction}
                onClick={onRegenerate}
                disabled={regenerating}
              >
                {regenerating ? '다시 만드는 중' : '다시 만들기'}
              </button>
            ) : null}
          </div>
        }
        memoEditor={
          memoOpen ? (
            <div className={parentStyles.memoPopover}>
              <textarea
                className={parentStyles.memoField}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="전하고 싶은 말을 편하게 적어요."
                aria-label="선생님 메모"
              />
              <div className={parentStyles.memoActions}>
                <button
                  type="button"
                  className={parentStyles.textActionMuted}
                  onClick={() => setMemoOpen(false)}
                  disabled={saving}
                >
                  닫기
                </button>
                <button
                  type="button"
                  className={parentStyles.textAction}
                  onClick={() => void saveNote()}
                  disabled={saving}
                >
                  {saving ? '저장 중' : '다듬기'}
                </button>
              </div>
            </div>
          ) : null
        }
        feedbackBody={
          editing ? (
            <div className={parentStyles.feedbackField} ref={editorRef}>
              <textarea
                className={parentStyles.feedbackTextarea}
                value={text}
                onChange={(event) => setText(event.target.value)}
                aria-label="선생님 피드백"
                autoFocus
              />
              <div className={parentStyles.memoActions}>
                <button
                  type="button"
                  className={parentStyles.textActionMuted}
                  onClick={() => {
                    setText(preview.ai_feedback ?? '')
                    setEditing(false)
                  }}
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={parentStyles.textAction}
                  onClick={() => void saveText()}
                  disabled={saving}
                >
                  {saving ? '저장 중' : '저장'}
                </button>
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  )
}
