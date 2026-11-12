'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { format, parseISO } from 'date-fns'
import CloseIcon from '@/assets/icons/icon-close.svg'
import Button from '@/components/common/Button'
import Text from '@/components/common/Text'
import { useRegisterModal } from '@/components/common/Modal/useRegisterModal'
import type { LessonHomeworkPhotos } from '@/hooks/lesson/useLessonHomeworkPhotos'
import {
  HW_ACTION_LABELS,
  HW_CARRY_REASON_LABELS,
  HW_CELL_LABELS,
  HW_EXTRA_REASON_LABELS,
  HW_LESSON_LABELS,
  HW_SUMMARY_LABELS,
  photoBadgeText,
  reasonText,
} from '@/lib/homeworkPhoto/labels'
import type { HwRowView } from '@/lib/homeworkPhoto/rowState'
import type { HwResolveAction, HwSubmissionView } from '@/types/homeworkPhoto'
import PhotoViewer from './PhotoViewer'
import ReturnDialog from './ReturnDialog'
import MoveDialog from './MoveDialog'
import * as styles from './HomeworkPhotoSidePanel.css'

const HIDDEN_LABEL = '숨김'
const EMPTY_TEXT = '볼 제출이 없어요.'
/** 다른 수업에 적용·체크한 제출(옮긴 제출 등) */
const ORIGINAL_CELL_NOTICE = '원래 수업에 적용한 칸은 그대로예요.'
/** 적용·체크한 제출을 숨기거나 돌려보내거나 옮겼을 때(§10 처리) */
const APPLIED_CELL_NOTICE = '이미 적용한 칸은 그대로예요. 직접 고쳐 주세요.'

type ChipTone = 'suggest' | 'checking' | 'review' | 'applied' | 'teacher' | 'ended' | 'hidden'
type Chip = { text: string; tone: ChipTone }

type CardAction =
  | 'complete'
  | 'incomplete'
  | 'openTarget'
  | 'completeLate'
  | 'acknowledge'
  | 'recheck'
  | 'unhide'
  | 'return'
  | 'hide'
  | 'move'
type ActionButton = {
  action: CardAction
  label: string
  variant: 'primary' | 'secondary' | 'outlined'
}

function isAppliedOrChecked(sub: HwSubmissionView): boolean {
  return sub.resolution === 'APPLIED' || sub.resolution === 'CHECKED'
}

function dayText(date: string): string {
  const day = parseISO(date)
  return Number.isNaN(day.getTime()) ? date : format(day, 'M월 d일')
}

function timeText(iso: string): string | null {
  const time = parseISO(iso)
  return Number.isNaN(time.getTime()) ? null : format(time, 'M월 d일 HH:mm')
}

/** '11월 12일 수업 숙제 · p.42~43' */
function targetText(sub: HwSubmissionView): string {
  const label = `${dayText(sub.target_date)} 수업 숙제`
  return sub.range_text ? `${label} · ${sub.range_text}` : label
}

function endedText(sub: HwSubmissionView): string {
  if (sub.resolution === 'RETURNED') return HW_ACTION_LABELS.return
  if (sub.resolution === 'ACKNOWLEDGED') return HW_ACTION_LABELS.acknowledge
  return HIDDEN_LABEL
}

/** 이 수업 대상 제출은 표와 같은 상태로, 넘어온 것은 확인 필요로 보인다. */
function ownChip(sub: HwSubmissionView, row: HwRowView | null): Chip | null {
  switch (row?.ownState) {
    case 'SUGGESTION':
      return {
        text:
          sub.verdict === 'INCOMPLETE'
            ? HW_CELL_LABELS.suggestIncomplete
            : HW_CELL_LABELS.suggestComplete,
        tone: 'suggest',
      }
    case 'REVIEW':
      return { text: HW_LESSON_LABELS.review, tone: 'review' }
    case 'APPLIED':
      return { text: HW_SUMMARY_LABELS.applied, tone: 'applied' }
    case 'TEACHER':
      return { text: HW_SUMMARY_LABELS.teacher, tone: 'teacher' }
    case 'ENDED':
      return { text: endedText(sub), tone: 'ended' }
    default:
      return null
  }
}

function stateChips(sub: HwSubmissionView, own: boolean, row: HwRowView | null): Chip[] {
  const main = sub.checking
    ? { text: HW_LESSON_LABELS.checking, tone: 'checking' as const }
    : own
      ? ownChip(sub, row)
      : { text: HW_LESSON_LABELS.review, tone: 'review' as const }
  const moderation =
    sub.hidden === 'MODERATION'
      ? { text: HW_LESSON_LABELS.moderationHidden, tone: 'hidden' as const }
      : null
  return [main, moderation].filter((chip): chip is Chip => chip !== null)
}

/**
 * 확인 필요 이유(§8.10): 넘어온 까닭, 이 수업의 칸을 보고 정한 까닭, 제출에 저장된 이유,
 * 돌려보낸 이유
 */
function reasonLines(sub: HwSubmissionView, own: boolean, row: HwRowView | null): string[] {
  const carry = !own && sub.carry_reason ? HW_CARRY_REASON_LABELS[sub.carry_reason] : undefined
  const extra = own && row?.extraReason ? HW_EXTRA_REASON_LABELS[row.extraReason] : undefined
  const returned =
    sub.resolution === 'RETURNED' && sub.return_reason
      ? `${HW_ACTION_LABELS.return} · ${sub.return_reason}`
      : undefined
  return [
    carry,
    extra,
    ...sub.reasons.map((reason) => reasonText(reason, sub.photo_count)),
    returned,
  ].filter((line): line is string => Boolean(line))
}

/** 서버가 정한 actions 대로만 버튼을 보인다. 완료·미완료는 이 표에 숙제 칸이 있을 때만이다. */
function actionButtons(
  sub: HwSubmissionView,
  canCheck: boolean,
  cellValue: boolean | null
): ActionButton[] {
  const flags = sub.actions
  const buttons: ActionButton[] = []
  if (flags.check_here && canCheck) {
    buttons.push(
      {
        action: 'complete',
        label: HW_ACTION_LABELS.complete,
        variant: cellValue === true ? 'primary' : 'outlined',
      },
      {
        action: 'incomplete',
        label: HW_ACTION_LABELS.incomplete,
        variant: cellValue === false ? 'primary' : 'outlined',
      }
    )
  }
  if (flags.open_target && sub.target_lesson_id !== null) {
    buttons.push({ action: 'openTarget', label: HW_ACTION_LABELS.openTarget, variant: 'secondary' })
  }
  if (flags.complete_late) {
    buttons.push({
      action: 'completeLate',
      label: HW_ACTION_LABELS.completeLate,
      variant: 'secondary',
    })
  }
  if (flags.acknowledge) {
    buttons.push({
      action: 'acknowledge',
      label: HW_ACTION_LABELS.acknowledge,
      variant: 'secondary',
    })
  }
  if (flags.recheck) {
    buttons.push({ action: 'recheck', label: HW_ACTION_LABELS.recheck, variant: 'secondary' })
  }
  if (flags.unhide) {
    buttons.push({ action: 'unhide', label: HW_ACTION_LABELS.unhide, variant: 'secondary' })
  }
  if (flags.return) {
    buttons.push({ action: 'return', label: HW_ACTION_LABELS.return, variant: 'outlined' })
  }
  if (flags.hide) {
    buttons.push({ action: 'hide', label: HW_ACTION_LABELS.hide, variant: 'outlined' })
  }
  if (flags.move) {
    buttons.push({ action: 'move', label: HW_ACTION_LABELS.move, variant: 'outlined' })
  }
  return buttons
}

type SubmissionCardProps = {
  sub: HwSubmissionView
  /** 이 수업 대상 제출(아니면 넘어온 확인 필요) */
  own: boolean
  row: HwRowView | null
  /** 확인 필요 가운데 가장 늦게 낸 것 */
  latest: boolean
  cellValue: boolean | null
  canCheck: boolean
  busy: boolean
  onAction: (action: CardAction) => void
}

function SubmissionCard({
  sub,
  own,
  row,
  latest,
  cellValue,
  canCheck,
  busy,
  onAction,
}: SubmissionCardProps) {
  const chips = stateChips(sub, own, row)
  const lines = reasonLines(sub, own, row)
  const buttons = actionButtons(sub, canCheck, cellValue)
  const submittedAt = timeText(sub.submitted_at)
  const meta = [
    submittedAt ? `${submittedAt} 제출` : null,
    photoBadgeText(sub.photo_count, sub.completeness),
  ]
    .filter((part): part is string => part !== null)
    .join(' · ')
  // 넘어온 NOT_ON_ROSTER는 학생을 빼면서 그 칸도 지워졌으므로 알리지 않는다(§3.9 rule c).
  const showOriginalNotice =
    isAppliedOrChecked(sub) && !sub.resolved_here && sub.carry_reason !== 'NOT_ON_ROSTER'

  return (
    <section className={latest ? `${styles.card} ${styles.cardLatest}` : styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitleBlock}>
          <span className={styles.cardTitle}>{targetText(sub)}</span>
          <span className={styles.cardMeta}>{meta}</span>
        </div>
        {chips.length > 0 ? (
          <div className={styles.chipRow}>
            {chips.map((chip) => (
              <span key={chip.text} className={styles.chipRecipe({ tone: chip.tone })}>
                {chip.text}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {lines.length > 0 ? (
        <ul className={styles.reasonList}>
          {lines.map((line, i) => (
            <li key={i} className={styles.reasonItem}>
              {line}
            </li>
          ))}
        </ul>
      ) : null}
      {showOriginalNotice ? <p className={styles.cardNotice}>{ORIGINAL_CELL_NOTICE}</p> : null}
      <PhotoViewer photos={sub.photos} hidden={sub.hidden} />
      {buttons.length > 0 ? (
        <div className={styles.actions}>
          {buttons.map((button) => (
            <Button
              key={button.action}
              type="button"
              variant={button.variant}
              size="sm"
              disabled={busy}
              onClick={() => onAction(button.action)}
            >
              {button.label}
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  )
}

type HomeworkPhotoSidePanelProps = {
  /** 옆 창을 연 학생. null이면 닫혀 있다. */
  studentId: number | null
  studentName: string
  /** 그 학생의 숙제 칸 값(저장 전 값 포함). 완료·미완료 버튼에 지금 값을 보인다. */
  cellValue: boolean | null
  homework: LessonHomeworkPhotos
  onClose: () => void
  /** 대상 수업 열기 */
  onOpenTarget: (lessonId: number) => void
}

/**
 * 사진 숙제 옆 창(§4): 이 수업 대상 제출, 그다음 넘어온 확인 필요(늦게 낸 것부터).
 * 사진을 넘기며 크게 보고, 이유를 보고, 서버가 허락한 처리만 고른다.
 * 처리할 때마다 제안을 다시 받는다.
 */
export default function HomeworkPhotoSidePanel({
  studentId,
  studentName,
  cellValue,
  homework,
  onClose,
  onOpenTarget,
}: HomeworkPhotoSidePanelProps) {
  const isOpen = studentId !== null
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [returnTarget, setReturnTarget] = useState<HwSubmissionView | null>(null)
  const [moveTarget, setMoveTarget] = useState<HwSubmissionView | null>(null)
  useRegisterModal(isOpen || isClosing)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || studentId === null || (!isOpen && !isClosing)) return null

  const view = homework.view
  const entry = view?.students.find((student) => student.student_id === studentId) ?? null
  const byId = new Map((view?.submissions ?? []).map((sub) => [sub.id, sub]))
  const ownId = entry?.own_submission_id ?? null
  const own = ownId ? (byId.get(ownId) ?? null) : null
  const carried = (entry?.carried_submission_ids ?? [])
    .map((id) => byId.get(id))
    .filter((sub): sub is HwSubmissionView => sub !== undefined)
  const submissions = own ? [own, ...carried] : carried
  const row = homework.rows.get(studentId) ?? null
  const title = studentName ? `${studentName} 숙제 사진` : '숙제 사진'

  const handleClose = () => setIsClosing(true)

  const handleAnimationEnd = () => {
    if (!isClosing) return
    setIsClosing(false)
    onClose()
  }

  /** 처리 한 번에 하나만. 도는 동안 버튼을 막는다. */
  const run = async (task: () => Promise<boolean>): Promise<boolean> => {
    if (busyRef.current) return false
    busyRef.current = true
    setBusy(true)
    try {
      return await task()
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const resolve = (action: HwResolveAction) => run(() => homework.resolveOne(action))

  /** 숨기기·다시 내기 요청·옮기기: 이미 적용한 칸은 그대로 두고 옆 창에 알린다(§10 처리). */
  const resolveKeepingCell = async (sub: HwSubmissionView, action: HwResolveAction) => {
    const wasApplied = isAppliedOrChecked(sub)
    const ok = await resolve(action)
    if (ok && wasApplied) setNotice(APPLIED_CELL_NOTICE)
    return ok
  }

  const handleAction = (sub: HwSubmissionView, action: CardAction) => {
    switch (action) {
      case 'complete':
      case 'incomplete':
        void run(async () => {
          await homework.onCellChange(studentId, action === 'complete')
          return true
        })
        return
      case 'openTarget':
        if (sub.target_lesson_id !== null) onOpenTarget(sub.target_lesson_id)
        return
      case 'completeLate':
        void run(() => homework.completeLate(sub))
        return
      case 'acknowledge':
        void resolve({ type: 'ACKNOWLEDGED', submission_id: sub.id })
        return
      case 'recheck':
        void run(() => homework.recheck(sub.id))
        return
      case 'unhide':
        void resolve({ type: 'UNHIDE', submission_id: sub.id })
        return
      case 'hide':
        void resolveKeepingCell(sub, { type: 'HIDDEN', submission_id: sub.id })
        return
      case 'return':
        setReturnTarget(sub)
        return
      case 'move':
        setMoveTarget(sub)
        return
    }
  }

  const confirmReturn = async (sub: HwSubmissionView, reason: string) => {
    const ok = await resolveKeepingCell(sub, { type: 'RETURNED', submission_id: sub.id, reason })
    if (ok) setReturnTarget(null)
  }

  const confirmMove = async (sub: HwSubmissionView, classId: number, targetDate: string) => {
    const ok = await resolveKeepingCell(sub, {
      type: 'MOVE',
      submission_id: sub.id,
      class_id: classId,
      target_date: targetDate,
    })
    if (ok) setMoveTarget(null)
  }

  return createPortal(
    <div className={styles.backdrop} onClick={handleClose}>
      <div
        className={isClosing ? `${styles.drawer} ${styles.drawerClosing}` : styles.drawer}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.header}>
          <Text variant="headingMd" as="h2">
            {title}
          </Text>
          <button
            type="button"
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="닫기"
          >
            <CloseIcon width={24} height={24} />
          </button>
        </div>
        <div className={styles.body}>
          {notice ? (
            <p className={styles.panelNotice} role="status">
              {notice}
            </p>
          ) : null}
          {submissions.length === 0 ? (
            <p className={styles.empty}>{EMPTY_TEXT}</p>
          ) : (
            submissions.map((sub) => (
              <SubmissionCard
                key={sub.id}
                sub={sub}
                own={sub.id === ownId}
                row={row}
                latest={submissions.length > 1 && sub.id === row?.latestReviewId}
                cellValue={cellValue}
                canCheck={homework.columnItemId !== null}
                busy={busy}
                onAction={(action) => handleAction(sub, action)}
              />
            ))
          )}
        </div>
        {returnTarget ? (
          <ReturnDialog
            busy={busy}
            onCancel={() => setReturnTarget(null)}
            onConfirm={(reason) => void confirmReturn(returnTarget, reason)}
          />
        ) : null}
        {moveTarget ? (
          <MoveDialog
            submission={moveTarget}
            busy={busy}
            onCancel={() => setMoveTarget(null)}
            onConfirm={(classId, targetDate) => void confirmMove(moveTarget, classId, targetDate)}
          />
        ) : null}
      </div>
    </div>,
    document.body
  )
}
