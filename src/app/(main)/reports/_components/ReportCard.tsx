'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import Chip from '@/components/common/Chip'
import Button from '@/components/common/Button'
import Text from '@/components/common/Text'
import ConfirmModal from '@/components/common/ConfirmModal'
import { ReportNumbers, ReportSummaryView } from '@/components/report/ReportView'
import { FeedbackReviewIssues } from '@/app/(main)/lesson/[id]/_components/AlimtalkSendModal/FeedbackReviewNotice'
import { useToastStore } from '@/stores/toastStore'
import {
  reportNotificationNote,
  reportService,
  type ReportStatus,
  type ReportSummary,
  type TeacherReport,
} from '@/services/reports'
import * as styles from '../reports.css'

const STATUS_CHIP: Record<ReportStatus, { variant: 'inProgress' | 'active' | 'done' | 'ended'; label: string }> = {
  DRAFT: { variant: 'inProgress', label: '만드는 중' },
  READY: { variant: 'active', label: '확인 필요' },
  APPROVED: { variant: 'done', label: '승인됨' },
  PUBLISHED: { variant: 'done', label: '공개됨' },
  FAILED: { variant: 'ended', label: '만들지 못함' },
}

const EMPTY_SUMMARY: ReportSummary = { strengths: '', improvements: '', next_goals: '' }
const FIELDS: Array<{ key: keyof ReportSummary; label: string }> = [
  { key: 'strengths', label: '잘한 점' },
  { key: 'improvements', label: '보완할 점' },
  { key: 'next_goals', label: '다음 목표' },
]

interface ReportCardProps {
  report: TeacherReport
  selectable: boolean
  selected: boolean
  onToggle: () => void
  onChanged: () => void
}

export default function ReportCard({ report, selectable, selected, onToggle, onChanged }: ReportCardProps) {
  const addToast = useToastStore((s) => s.addToast)
  const [editing, setEditing] = useState(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)
  const [draft, setDraft] = useState<ReportSummary>(report.summary ?? EMPTY_SUMMARY)
  /** 다시 만들면 잃는 것이 있으면(고친 글, 학부모 공개) 먼저 묻는다 */
  const regenerateLoses =
    report.summary_source === 'TEACHER' || report.status === 'PUBLISHED' || report.status === 'APPROVED'
  const monthly = report.period_type === 'MONTHLY'
  const chip = STATUS_CHIP[report.status]
  const fail = (message: string) => addToast({ variant: 'error', message })

  const save = useMutation({
    mutationFn: () => reportService.updateSummary(report.id, draft),
    onSuccess: () => {
      setEditing(false)
      onChanged()
      addToast({ variant: 'success', message: '총평을 고쳤어요.' })
    },
    onError: () => fail('총평을 저장하지 못했어요.'),
  })
  const regenerate = useMutation({
    mutationFn: () => reportService.regenerate(report.id),
    onSuccess: () => {
      onChanged()
      addToast({ variant: 'success', message: '총평을 다시 만들고 있어요. 공개는 다시 승인할 때까지 내려 둬요.' })
    },
    onError: () => fail('다시 만들지 못했어요.'),
  })
  const publish = useMutation({
    mutationFn: () => reportService.publish([report.id]),
    onSuccess: (result) => {
      onChanged()
      addToast({
        variant: 'success',
        message: `${report.student_name} 학생 보고서를 학부모에게 공개했어요.${reportNotificationNote(result.notification)}`,
      })
    },
    onError: () => fail('공개하지 못했어요.'),
  })
  const busy = save.isPending || regenerate.isPending || publish.isPending
  const canEditFields = FIELDS.every(({ key }) => draft[key].trim())

  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        {selectable ? (
          <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`${report.student_name} 선택`} />
        ) : null}
        <Link href={`/students/${report.student_id}`} className={styles.studentName}>
          {report.student_name}
        </Link>
        <Chip variant={chip.variant} label={chip.label} />
        {report.summary_source === 'TEACHER' ? (
          <Text variant="labelSm" color="gray500">
            선생님이 고침
          </Text>
        ) : null}
      </div>

      <ReportNumbers snapshot={report.snapshot} />

      {monthly ? (
        <div className={styles.summaryBox}>
          {report.status === 'DRAFT' ? (
            <Text variant="bodyMd" color="gray500">
              AI가 총평을 쓰고 있어요…
            </Text>
          ) : null}
          {report.status === 'FAILED' && !report.summary && !editing ? (
            <Text variant="bodyMd" color="gray700">
              총평을 만들지 못했어요. 다시 만들거나 직접 써 주세요.
            </Text>
          ) : null}
          {editing ? (
            <div className={styles.editForm}>
              {FIELDS.map(({ key, label }) => (
                <label key={key} className={styles.field}>
                  <Text variant="titleSm" color="gray700">
                    {label}
                  </Text>
                  <textarea
                    className={styles.textarea}
                    value={draft[key]}
                    maxLength={400}
                    onChange={(event) => setDraft((prev) => ({ ...prev, [key]: event.target.value }))}
                  />
                </label>
              ))}
            </div>
          ) : report.summary ? (
            <ReportSummaryView summary={report.summary} />
          ) : null}
          {!editing && report.review?.status === 'flagged' ? (
            <div className={styles.reviewBox}>
              <Text variant="titleSm" color="gray900">
                기록과 맞지 않을 수 있는 문장이 있어요
              </Text>
              <FeedbackReviewIssues issues={report.review.issues} />
            </div>
          ) : null}
          {!editing && report.review?.status === 'unchecked' ? (
            <Text variant="labelSm" color="gray500">
              AI 검수를 하지 못했어요. 공개 전에 한 번 읽어 봐 주세요.
            </Text>
          ) : null}
          <div className={styles.actions}>
            {editing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={busy}>
                  취소
                </Button>
                <Button variant="primary" size="sm" onClick={() => save.mutate()} disabled={busy || !canEditFields}>
                  저장
                </Button>
              </>
            ) : (
              <>
                {report.status !== 'DRAFT' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraft(report.summary ?? EMPTY_SUMMARY)
                      setEditing(true)
                    }}
                    disabled={busy}
                  >
                    {report.summary ? '고치기' : '직접 쓰기'}
                  </Button>
                ) : null}
                {report.status !== 'DRAFT' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => (regenerateLoses ? setConfirmRegenerate(true) : regenerate.mutate())}
                    disabled={busy}
                  >
                    다시 만들기
                  </Button>
                ) : null}
                {report.status === 'READY' || report.status === 'APPROVED' ? (
                  <Button variant="outlined" size="sm" onClick={() => publish.mutate()} disabled={busy}>
                    공개
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
      <ConfirmModal
        isOpen={confirmRegenerate}
        onClose={() => setConfirmRegenerate(false)}
        onConfirm={() => {
          setConfirmRegenerate(false)
          regenerate.mutate()
        }}
        title="총평을 다시 만들까요?"
        descriptions={[
          ...(report.summary_source === 'TEACHER' ? ['선생님이 고친 총평이 지워져요.'] : []),
          ...(report.status === 'PUBLISHED' ? ['다시 공개할 때까지 학부모에게 보이지 않아요.'] : []),
          '숫자도 지금 기록으로 새로 계산해요.',
        ]}
        confirmLabel="다시 만들기"
        cancelLabel="취소"
      />
    </li>
  )
}
