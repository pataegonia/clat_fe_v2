'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import Chip from '@/components/common/Chip'
import CloseIcon from '@/assets/icons/icon-close.svg'
import ConfirmModal from '@/components/common/ConfirmModal'
import Modal from '@/components/common/Modal'
import LessonMessageOrderModal from '../LessonMessageOrderModal/LessonMessageOrderModal'
import ParentDashboardPreviewPanel from './ParentDashboardPreviewPanel'
import AlimtalkMessagePreview from './AlimtalkMessagePreview'
import useDisclosure from '@/hooks/useDisclosure'
import type { LessonItemDetail } from '@/services/lesson'
import type { LessonStudent } from '@/types/lessonStudent'
import { isAxiosError } from '@/lib/api/http'
import {
  lessonService,
  type LessonPreviewRow,
  type LessonSendChannel,
  type LessonSendSchedule,
  type ParentPreviewResult,
  type ParentPreviewStatusItem,
  type SendWarning,
} from '@/services/lesson'
import { useQueryClient } from '@tanstack/react-query'
import { invalidateLessonLists } from '@/lib/queryKeys'
import { reportTutorialAction, setTutorialGate } from '@/features/tutorial/tutorialEvents'
import { useToastStore } from '@/stores/toastStore'
import { useUserStore } from '@/stores/userStore'
import { pollBatchUntilSettled } from '@/services/alimtalk'
import { fillLessonAlimtalkFrameHeader } from '@/lib/lessonAlimtalkFrame'
import { useRegisterModal } from '@/components/common/Modal/useRegisterModal'
import { listParentPhones } from '@/lib/parentPhones'
import * as styles from './AlimtalkSendModal.css'

function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length < 10) return phone || '\u2014'
  const tail = d.slice(-4)
  return `${d.slice(0, 3)}-****-${tail}`
}

function hasPhone(value: string | null | undefined) {
  return Boolean(value && String(value).replace(/\D/g, '').length >= 8)
}

function parentAudienceLabel(row: LessonPreviewRow) {
  const phones = listParentPhones(row)
  if (phones.length === 0) return '학부모 번호 없음'
  return `학부모 ${phones.map(maskPhone).join(' · ')}`
}

function resolveSendChannel(
  sendToParent: boolean,
  sendToStudent: boolean,
): LessonSendChannel | null {
  if (sendToParent && sendToStudent) return 'BOTH'
  if (sendToParent) return 'PARENT'
  if (sendToStudent) return 'STUDENT'
  return null
}

function isRowSelectable(
  row: LessonPreviewRow,
  sendToParent: boolean,
  sendToStudent: boolean,
) {
  if (sendToParent && listParentPhones(row).some((phone) => hasPhone(phone))) return true
  if (sendToStudent && hasPhone(row.phone)) return true
  return false
}

const CHAR_LIMIT = 1000

function channelOver(
  row: LessonPreviewRow,
  sendToParent: boolean,
  sendToStudent: boolean,
) {
  const student =
    sendToStudent &&
    hasPhone(row.phone) &&
    typeof row.student_char_count === 'number' &&
    row.student_char_count > CHAR_LIMIT
  const parent =
    sendToParent &&
    listParentPhones(row).some((phone) => hasPhone(phone)) &&
    typeof row.parent_char_count === 'number' &&
    row.parent_char_count > CHAR_LIMIT
  return { student, parent }
}

function overRowLabel(
  row: LessonPreviewRow,
  sendToParent: boolean,
  sendToStudent: boolean,
): string | null {
  const hit = channelOver(row, sendToParent, sendToStudent)
  if (!hit.student && !hit.parent) return null
  if (sendToParent && sendToStudent && hit.student !== hit.parent) {
    return hit.parent ? '학부모 1,000자 초과' : '학생 1,000자 초과'
  }
  return '1,000자 초과'
}

function overSendLines(
  previewRows: LessonPreviewRow[],
  selectedIds: Set<number>,
  sendToParent: boolean,
  sendToStudent: boolean,
): string[] {
  const lines: string[] = []
  for (const row of previewRows) {
    if (!selectedIds.has(row.student_id)) continue
    const hit = channelOver(row, sendToParent, sendToStudent)
    if (!hit.student && !hit.parent) continue
    if (sendToParent && sendToStudent && hit.student !== hit.parent) {
      lines.push(`${row.student_name} · ${hit.parent ? '학부모' : '학생'}`)
    } else {
      lines.push(row.student_name)
    }
  }
  return lines
}

function linesFromTooLongError(error: unknown, bothChannels: boolean): string[] | null {
  const body = (
    error as {
      response?: {
        data?: {
          error?: {
            code?: string
            students?: Array<{
              student_id?: number
              student_name?: string
              channel?: string
            }>
          }
        }
      }
    }
  ).response?.data?.error
  if (body?.code !== 'MESSAGE_TOO_LONG') return null
  const students = Array.isArray(body.students) ? body.students : []
  const grouped = new Map<number, { name: string; student: boolean; parent: boolean }>()
  students.forEach((row, index) => {
    const id = typeof row.student_id === 'number' ? row.student_id : index
    const cur = grouped.get(id) ?? { name: row.student_name || '학생', student: false, parent: false }
    if (row.channel === 'STUDENT') cur.student = true
    if (row.channel === 'PARENT') cur.parent = true
    if (row.student_name) cur.name = row.student_name
    grouped.set(id, cur)
  })
  return [...grouped.values()].map((hit) => {
    if (bothChannels && hit.student !== hit.parent) {
      return `${hit.name} · ${hit.parent ? '학부모' : '학생'}`
    }
    return hit.name
  })
}

function channelAudienceLabel(sendToParent: boolean, sendToStudent: boolean) {
  if (sendToParent && sendToStudent) return '학생·학부모 번호'
  if (sendToParent) return '학부모 번호'
  if (sendToStudent) return '학생 번호'
  return '수신 대상'
}

function aiChip(item?: Pick<ParentPreviewStatusItem, 'status' | 'stale'>) {
  if (!item) return { variant: 'inProgress' as const, label: '대기' }
  if (item.stale) return { variant: 'inProgress' as const, label: '다시 만들기' }
  if (item.status === 'ready') return { variant: 'done' as const, label: '완료' }
  if (item.status === 'failed') return { variant: 'ended' as const, label: '실패' }
  return { variant: 'inProgress' as const, label: '작성 중' }
}

function isAiReady(item?: Pick<ParentPreviewStatusItem, 'status' | 'stale'>) {
  return Boolean(item && item.status === 'ready' && !item.stale)
}

function seoulWallClock(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  const hour = read('hour') === '24' ? '00' : read('hour')
  return { year: read('year'), month: read('month'), day: read('day'), hour, minute: read('minute') }
}

function seoulDatetimeLocal(date: Date): string {
  const clock = seoulWallClock(date)
  return `${clock.year}-${clock.month}-${clock.day}T${clock.hour}:${clock.minute}`
}

function formatScheduleLabel(iso: string): string {
  const clock = seoulWallClock(new Date(iso))
  return `${Number(clock.month)}월 ${Number(clock.day)}일 ${clock.hour}:${clock.minute}`
}

function apiErrorMessage(err: unknown): string | undefined {
  if (!isAxiosError(err)) return undefined
  return (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message
}

interface AlimtalkSendModalProps {
  isOpen: boolean
  onClose: () => void
  lessonId: number
  lesson: {
    class_name: string
    academy_name?: string
    lesson_date: string
    items: LessonItemDetail[]
  }
  commonValues: Record<string, string>
  students: LessonStudent[]
  sendSchedule: LessonSendSchedule | null
  onSendScheduleChange: (patch: {
    send_schedule: LessonSendSchedule | null
    updated_at: string
    send_schedule_cancel_notice?: boolean
  }) => void
  onSaveMessageOrder: (
    items: Array<{ source: 'template' | 'adhoc'; id: number }>,
  ) => Promise<void>
}

export default function AlimtalkSendModal({
  isOpen,
  onClose,
  lessonId,
  lesson,
  commonValues,
  students,
  sendSchedule,
  onSendScheduleChange,
  onSaveMessageOrder,
}: AlimtalkSendModalProps) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const teacherName = useUserStore((s) => s.user?.name) ?? '강사명'
  const messageOrderModal = useDisclosure()
  const [rows, setRows] = useState<LessonPreviewRow[]>([])
  const [commonWarnings, setCommonWarnings] = useState<SendWarning[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [focusId, setFocusId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number } | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  useRegisterModal(isOpen || isClosing)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pickingTime, setPickingTime] = useState(false)
  const [timeValue, setTimeValue] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [cancelScheduleOpen, setCancelScheduleOpen] = useState(false)
  const [lengthOpen, setLengthOpen] = useState(false)
  const [lengthNames, setLengthNames] = useState<string[]>([])
  const [emptySendOpen, setEmptySendOpen] = useState(false)
  const [emptySendCount, setEmptySendCount] = useState(0)
  const [feedbackMode, setFeedbackMode] = useState<'AUTO' | 'ASSIST' | 'MANUAL'>('AUTO')
  const [mounted, setMounted] = useState(false)
  const [sendToParent, setSendToParent] = useState(true)
  const [sendToStudent, setSendToStudent] = useState(true)
  const [previewTab, setPreviewTab] = useState<'message' | 'dashboard'>('message')
  const [aiStatusById, setAiStatusById] = useState<Record<number, ParentPreviewStatusItem>>({})
  const [trackedAiIds, setTrackedAiIds] = useState<Set<number>>(new Set())
  const [dashboardPreview, setDashboardPreview] = useState<ParentPreviewResult | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadPreview = useCallback(async () => {
    setLoading(true)
    try {
      const res = await lessonService.previewLesson(lessonId)
      const list = res.data ?? []
      setRows(list)
      setCommonWarnings(res.common_warnings ?? [])
      const ids = new Set(list.map((r) => r.student_id))
      setSelected(ids)
      setFocusId(list[0]?.student_id ?? null)
    } catch {
      addToast({
        variant: 'error',
        message:
          '\uBBF8\uB9AC\uBCF4\uAE30\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC800\uC7A5 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
      })
      setRows([])
      setCommonWarnings([])
      setSelected(new Set())
      setFocusId(null)
    } finally {
      setLoading(false)
    }
  }, [lessonId, addToast])

  useEffect(() => {
    setSelected((prev) => {
      const next = new Set<number>()
      for (const id of prev) {
        const row = rows.find((r) => r.student_id === id)
        if (row && isRowSelectable(row, sendToParent, sendToStudent)) next.add(id)
      }
      return next
    })
  }, [rows, sendToParent, sendToStudent])

  useEffect(() => {
    if (!isOpen) return
    setSendToParent(true)
    setSendToStudent(true)
    setPreviewTab('message')
    setAiStatusById({})
    setTrackedAiIds(new Set())
    setDashboardPreview(null)
    setFeedbackMode('AUTO')
    setEmptySendOpen(false)
    void loadPreview()
  }, [isOpen, loadPreview])

  useEffect(() => {
    if (!isOpen || rows.length === 0) return
    let cancelled = false
    void lessonService
      .getParentPreviewStatus(
        lessonId,
        rows.map((row) => row.student_id),
      )
      .then((res) => {
        if (!cancelled) setFeedbackMode(res.feedback_mode ?? 'AUTO')
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isOpen, lessonId, rows])

  const trackedAiKey = Array.from(trackedAiIds).sort((a, b) => a - b).join(',')

  useEffect(() => {
    if (!isOpen || previewTab !== 'dashboard' || focusId == null) return

    setTrackedAiIds((prev) => {
      if (prev.has(focusId)) return prev
      const next = new Set(prev)
      next.add(focusId)
      return next
    })

    void lessonService.enqueueParentPreview(lessonId, [focusId]).catch(() => {
      addToast({
        variant: 'error',
        message: '학부모 피드백 미리보기를 시작하지 못했어요.',
      })
    })
  }, [isOpen, previewTab, focusId, lessonId, addToast])

  useEffect(() => {
    if (!isOpen || trackedAiIds.size === 0) return
    const ids = Array.from(trackedAiIds)
    let cancelled = false

    const tick = async () => {
      try {
        const res = await lessonService.getParentPreviewStatus(lessonId, ids)
        if (cancelled) return
        const next: Record<number, ParentPreviewStatusItem> = {}
        for (const item of res.items) next[item.student_id] = item
        setAiStatusById((prev) => ({ ...prev, ...next }))
      } catch {
        /* 폴링 실패는 다음 주기에 재시도 */
      }
    }

    void tick()
    const timer = window.setInterval(() => {
      void tick()
    }, 3000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [isOpen, lessonId, trackedAiKey, trackedAiIds.size])

  useEffect(() => {
    if (!isOpen || previewTab !== 'dashboard' || focusId == null) return
    let cancelled = false
    setDashboardLoading(true)
    lessonService
      .getParentPreview(lessonId, focusId)
      .then((res) => {
        if (!cancelled) setDashboardPreview(res)
      })
      .catch(() => {
        if (!cancelled) setDashboardPreview(null)
      })
      .finally(() => {
        if (!cancelled) setDashboardLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    isOpen,
    previewTab,
    focusId,
    lessonId,
    aiStatusById[focusId ?? -1]?.status,
    aiStatusById[focusId ?? -1]?.stale,
  ])

  useEffect(() => {
    const mode = dashboardPreview?.feedback_mode ?? feedbackMode
    const ready =
      isOpen &&
      previewTab === 'dashboard' &&
      !dashboardLoading &&
      dashboardPreview != null &&
      !(mode === 'AUTO' && dashboardPreview.ai_feedback_status === 'pending')
    setTutorialGate('feedback', ready)
  }, [isOpen, previewTab, dashboardLoading, dashboardPreview, feedbackMode])

  useEffect(() => () => setTutorialGate('feedback', false), [])

  if (!mounted || (!isOpen && !isClosing)) return null

  const sendChannel = resolveSendChannel(sendToParent, sendToStudent)
  const selectableRows = rows.filter((r) =>
    isRowSelectable(r, sendToParent, sendToStudent),
  )
  const allSelected =
    selectableRows.length > 0 &&
    selectableRows.every((r) => selected.has(r.student_id))
  const selectedAiReadyCount = Array.from(selected).filter((id) =>
    isAiReady(aiStatusById[id]),
  ).length
  const viewedAiReadyCount = Array.from(trackedAiIds).filter((id) =>
    isAiReady(aiStatusById[id]),
  ).length

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
      setFocusId(null)
    } else {
      setSelected(new Set(selectableRows.map((r) => r.student_id)))
      setFocusId(selectableRows[0]?.student_id ?? null)
    }
  }

  const toggleOne = (id: number) => {
    const row = rows.find((r) => r.student_id === id)
    if (!row || !isRowSelectable(row, sendToParent, sendToStudent)) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const focused = rows.find((r) => r.student_id === focusId)
  const frameHeader = focused
    ? fillLessonAlimtalkFrameHeader({
        academyName: lesson.academy_name?.trim() || '학원명',
        teacherName,
        studentName: focused.student_name,
        lessonDate: lesson.lesson_date,
      })
    : ''

  const handleClose = () => {
    if (sending || scheduling) return
    setPickingTime(false)
    setIsClosing(true)
  }

  const openSchedulePicker = () => {
    setTimeValue(seoulDatetimeLocal(new Date()))
    setPickingTime(true)
  }

  const confirmSchedule = async () => {
    if (!sendChannel || selected.size === 0 || !timeValue) return
    setScheduling(true)
    try {
      const saved = await lessonService.createSendSchedule(
        lessonId,
        [...selected],
        sendChannel,
        `${timeValue}:00+09:00`,
      )
      onSendScheduleChange({
        send_schedule: saved.send_schedule,
        updated_at: saved.updated_at,
        send_schedule_cancel_notice: false,
      })
      invalidateLessonLists(queryClient)
      setPickingTime(false)
      addToast({
        variant: 'success',
        message: `${formatScheduleLabel(saved.send_schedule.scheduled_at)}에 예약했어요.`,
      })
    } catch (err) {
      addToast({
        variant: 'error',
        message: apiErrorMessage(err) ?? '문자 예약에 실패했어요.',
      })
    } finally {
      setScheduling(false)
    }
  }

  const confirmCancelSchedule = async () => {
    setCancelScheduleOpen(false)
    setScheduling(true)
    try {
      const saved = await lessonService.cancelSendSchedule(lessonId)
      onSendScheduleChange({
        send_schedule: null,
        updated_at: saved.updated_at,
      })
      invalidateLessonLists(queryClient)
      addToast({ variant: 'success', message: '예약을 취소했어요.' })
    } catch (err) {
      addToast({
        variant: 'error',
        message: apiErrorMessage(err) ?? '예약 취소에 실패했어요.',
      })
    } finally {
      setScheduling(false)
    }
  }

  const handleAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false)
      onClose()
    }
  }

  const requestSend = async () => {
    if (!sendChannel) {
      addToast({
        variant: 'warning',
        message: '학부모 또는 학생 중 받을 대상을 골라 주세요.',
      })
      return
    }
    if (selected.size === 0) {
      addToast({
        variant: 'warning',
        message:
          '\uBCF4\uB0BC \uD559\uC0DD\uC744 \uD55C \uBA85 \uC774\uC0C1 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
      })
      return
    }
    const overLines = overSendLines(rows, selected, sendToParent, sendToStudent)
    if (overLines.length > 0) {
      setLengthNames(overLines)
      setLengthOpen(true)
      return
    }
    const ids = Array.from(selected)
    try {
      const status = await lessonService.getParentPreviewStatus(lessonId, ids)
      const mode = status.feedback_mode ?? 'AUTO'
      setFeedbackMode(mode)
      const missing = status.items.filter((item) => item.unwritten).length
      if ((mode === 'ASSIST' || mode === 'MANUAL') && missing > 0) {
        setEmptySendCount(missing)
        setEmptySendOpen(true)
        return
      }
    } catch {
      addToast({
        variant: 'error',
        message: '피드백 작성 여부를 확인하지 못했어요.',
      })
      return
    }
    setConfirmOpen(true)
  }

  const handleRegenerate = async () => {
    if (focusId == null) return
    setRegenerating(true)
    try {
      setTrackedAiIds((prev) => {
        if (prev.has(focusId)) return prev
        const next = new Set(prev)
        next.add(focusId)
        return next
      })
      await lessonService.enqueueParentPreview(lessonId, [focusId], true)
      setAiStatusById((prev) => ({
        ...prev,
        [focusId]: {
          student_id: focusId,
          status: 'pending',
          stale: false,
        },
      }))
    } catch {
      addToast({
        variant: 'error',
        message: '피드백을 다시 만들지 못했어요.',
      })
    } finally {
      setRegenerating(false)
    }
  }

  const handleSend = async () => {
    setConfirmOpen(false)
    setEmptySendOpen(false)
    const ids = Array.from(selected)
    if (ids.length === 0 || !sendChannel) return
    setSending(true)
    setSendProgress(null)
    try {
      const queued = await lessonService.sendLesson(lessonId, ids, sendChannel)
      const mode = queued.delivery_mode === 'mock' ? '모의 전송' : '실제 발송'
      const result =
        queued.status === 'done'
          ? { success_count: 0, fail_count: 0, total_count: queued.total_count }
          : await pollBatchUntilSettled(queued.batch_id, (sent, total) => {
              setSendProgress({ sent, total })
            })
      addToast({
        variant: 'success',
        message: `보냈어요. (${mode} · 성공 ${result.success_count}건 / 실패 ${result.fail_count}건)`,
      })
      if (result.success_count > 0) {
        invalidateLessonLists(queryClient)
      }
      if (result.fail_count === 0 && (result.success_count > 0 || result.total_count > 0)) {
        reportTutorialAction('alimtalk-send')
      }
      setIsClosing(true)
    } catch (err) {
      const tooLong = linesFromTooLongError(err, sendToParent && sendToStudent)
      if (tooLong) {
        setLengthNames(tooLong)
        setLengthOpen(true)
        return
      }
      const apiMessage = isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } } | undefined)?.error
            ?.message
        : undefined
      const isTimeout =
        (err instanceof Error && err.message === 'BATCH_POLL_TIMEOUT') ||
        (isAxiosError(err) && (err.code === 'ECONNABORTED' || err.message.includes('timeout')))
      addToast({
        variant: 'error',
        message:
          apiMessage ??
          (isTimeout
            ? '알림톡 발송이 시간 초과되었어요. 잠시 후 발송 내역에서 결과를 확인해 주세요.'
            : '알림톡 발송에 실패했어요.'),
      })
    } finally {
      setSending(false)
      setSendProgress(null)
    }
  }

  return createPortal(
    <div className={styles.backdrop} onClick={handleClose}>
      <div
        className={`${styles.drawer}${isClosing ? ` ${styles.drawerClosing}` : ''}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className={styles.header}>
          <Text variant="headingMd" as="h2">
            {'\uC54C\uB9BC\uD1A1 \uBCF4\uB0B4\uAE30'}
          </Text>
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={messageOrderModal.open}
              disabled={sending}
            >
              {'\uBB38\uC790 \uC21C\uC11C'}
            </Button>
            <button
              type="button"
              onClick={handleClose}
              className={styles.closeButton}
              aria-label={'\uB2EB\uAE30'}
              disabled={sending}
            >
              <CloseIcon width={24} height={24} />
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.leftCol}>
            <div className={styles.leftHeader}>
              <Text variant="titleMd">{'\uBCF4\uB0BC \uD559\uC0DD'}</Text>
              <div className={styles.leftHint}>
                <Text variant="bodyMd" color="gray500">
                  {`체크한 학생에게 ${channelAudienceLabel(sendToParent, sendToStudent)}로 발송해요`}
                </Text>
              </div>
            </div>
            <div className={styles.channelBlock}>
              <Text variant="titleSm" color="gray700">
                수신 대상
              </Text>
              <div className={styles.channelRow} role="group" aria-label="수신 대상">
                <button
                  type="button"
                  className={`${styles.channelCheck}${sendToParent ? ` ${styles.channelCheckActive}` : ''}`}
                  aria-pressed={sendToParent}
                  onClick={() => setSendToParent((v) => !v)}
                  disabled={sending}
                >
                  학부모에게 보내기
                </button>
                <button
                  type="button"
                  className={`${styles.channelCheck}${sendToStudent ? ` ${styles.channelCheckActive}` : ''}`}
                  aria-pressed={sendToStudent}
                  onClick={() => setSendToStudent((v) => !v)}
                  disabled={sending}
                >
                  학생에게 보내기
                </button>
              </div>
            </div>
            <label className={styles.selectAllRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={allSelected}
                onChange={toggleAll}
                disabled={loading || rows.length === 0}
              />
              <Text variant="titleSm">{'\uC804\uCCB4 \uC120\uD0DD'}</Text>
            </label>
            <div className={styles.studentList}>
              {loading && (
                <div className={styles.listMessage}>
                  <Text variant="bodyMd" color="gray500">
                    {'\uBD88\uB7EC\uC624\uB294 \uC911\u2026'}
                  </Text>
                </div>
              )}
              {!loading && rows.length === 0 && (
                <div className={styles.listMessage}>
                  <Text variant="bodyMd" color="gray500">
                    {
                      '\uBBF8\uB9AC\uBCF4\uAE30\uD560 \uD559\uC0DD\uC774 \uC5C6\uC5B4\uC694. \uC218\uC5C5\uC744 \uC800\uC7A5\uD588\uB294\uC9C0 \uD655\uC778\uD574 \uC8FC\uC138\uC694.'
                    }
                  </Text>
                </div>
              )}
              {!loading &&
                rows.map((r) => {
                  const selectable = isRowSelectable(r, sendToParent, sendToStudent)
                  const checked = selected.has(r.student_id)
                  const isFocus = focusId === r.student_id
                  const limitLabel = overRowLabel(r, sendToParent, sendToStudent)
                  return (
                    <div
                      key={r.student_id}
                      role="button"
                      tabIndex={0}
                      className={`${styles.studentRow}${isFocus ? ` ${styles.studentRowFocused}` : ''}${
                        selectable ? '' : ` ${styles.studentRowDisabled}`
                      }`}
                      onClick={() => setFocusId(r.student_id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setFocusId(r.student_id)
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={checked}
                        disabled={!selectable}
                        onChange={() => toggleOne(r.student_id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className={styles.studentMeta}>
                        <div className={styles.studentNameRow}>
                          <div className={styles.studentName} title={r.student_name}>
                            {r.student_name}
                          </div>
                          {trackedAiIds.has(r.student_id) ? (
                            <Chip {...aiChip(aiStatusById[r.student_id])} />
                          ) : null}
                        </div>
                        <div
                          className={styles.phoneMuted}
                          title={`학생 ${maskPhone(r.phone)} · ${parentAudienceLabel(r)}`}
                        >
                          {`학생 ${maskPhone(r.phone)} · ${parentAudienceLabel(r)}`}
                        </div>
                        {limitLabel ? (
                          <Text as="p" variant="labelSm" color="error500" className={styles.overLimit}>
                            {limitLabel}
                          </Text>
                        ) : null}
                        {r.warnings && r.warnings.length > 0 ? (
                          <Text as="p" variant="labelSm" color="gray700" className={styles.warningCount}>
                            {`⚠ 확인할 내용 ${r.warnings.length}개`}
                          </Text>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.tabRow} role="tablist" aria-label="미리보기">
              <button
                type="button"
                role="tab"
                aria-selected={previewTab === 'message'}
                className={`${styles.tabButton}${previewTab === 'message' ? ` ${styles.tabButtonActive}` : ''}`}
                onClick={() => setPreviewTab('message')}
                data-tour="alimtalk-message-tab"
              >
                <Text variant="headingSm" color={previewTab === 'message' ? 'gray900' : 'gray500'}>
                  문자
                </Text>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={previewTab === 'dashboard'}
                className={`${styles.tabButton}${previewTab === 'dashboard' ? ` ${styles.tabButtonActive}` : ''}`}
                onClick={() => setPreviewTab('dashboard')}
                data-tour="alimtalk-dashboard-tab"
              >
                <Text variant="headingSm" color={previewTab === 'dashboard' ? 'gray900' : 'gray500'}>
                  대시보드
                </Text>
              </button>
            </div>
            {previewTab === 'dashboard' ? (
              focused ? (
                <ParentDashboardPreviewPanel
                  lessonId={lessonId}
                  studentId={focused.student_id}
                  preview={dashboardPreview}
                  loading={dashboardLoading}
                  regenerating={regenerating}
                  onRegenerate={() => void handleRegenerate()}
                  onSaved={(saved) => {
                    setDashboardPreview(saved)
                    if (saved.ai_feedback_status !== 'pending') return
                    setTrackedAiIds((prev) => {
                      if (prev.has(focused.student_id)) return prev
                      const next = new Set(prev)
                      next.add(focused.student_id)
                      return next
                    })
                    setAiStatusById((prev) => ({
                      ...prev,
                      [focused.student_id]: {
                        student_id: focused.student_id,
                        status: 'pending',
                        stale: false,
                      },
                    }))
                  }}
                />
              ) : (
                <Text variant="bodyMd" color="gray500">
                  왼쪽에서 학생을 선택하면 학부모가 볼 화면이 나와요.
                </Text>
              )
            ) : (
              <AlimtalkMessagePreview
                focused={focused}
                frameHeader={frameHeader}
                sendToParent={sendToParent}
                sendToStudent={sendToStudent}
                commonWarnings={commonWarnings}
              />
            )}
          </div>
        </div>

        {pickingTime && !sendSchedule && (
          <div className={styles.schedulePick}>
            <Text variant="bodyMd" color="gray500">
              한국 시간
            </Text>
            <input
              type="datetime-local"
              className={styles.scheduleInput}
              min={seoulDatetimeLocal(new Date())}
              value={timeValue}
              onChange={(event) => setTimeValue(event.target.value)}
            />
            <Button
              variant="outlined"
              size="md"
              onClick={() => void confirmSchedule()}
              disabled={scheduling || !timeValue || selected.size === 0 || !sendChannel}
            >
              {scheduling ? '예약하는 중…' : '이 시각에 예약'}
            </Button>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerHint}>
            <Text variant="bodyMd" color="gray500">
              {selected.size === 0
                ? '보낼 학생을 선택해 주세요.'
                : feedbackMode === 'AUTO'
                  ? viewedAiReadyCount > 0
                    ? `조회한 학생 중 AI ${viewedAiReadyCount}명은 바로 보여요. 나머지는 보낸 뒤 만들어져요.`
                    : `선택한 ${selected.size}명에게 바로 보낼 수 있어요. 대시보드에서 조회한 학생만 AI를 미리 만들어요.`
                  : `선택한 ${selected.size}명에게 바로 보낼 수 있어요. 피드백을 적지 않은 학생은 빈 칸으로 보내요.`}
            </Text>
          </div>
          <Button variant="ghost" size="md" onClick={handleClose} disabled={sending || scheduling}>
            {'\uCDE8\uC18C'}
          </Button>
          <Button
            variant="outlined"
            size="md"
            onClick={() => {
              if (sendSchedule) {
                setCancelScheduleOpen(true)
                return
              }
              if (pickingTime) {
                setPickingTime(false)
                return
              }
              openSchedulePicker()
            }}
            disabled={
              sending ||
              loading ||
              scheduling ||
              (!sendSchedule && (selected.size === 0 || !sendChannel))
            }
          >
            {sendSchedule ? `${formatScheduleLabel(sendSchedule.scheduled_at)} 예약 취소` : '문자 예약'}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => void requestSend()}
            disabled={sending || loading || selected.size === 0 || !sendChannel}
            data-tour="alimtalk-send-open"
          >
            {sending ? '\uBCF4\uB0B4\uB294 \uC911\u2026' : `${selected.size}명에게 알림톡 보내기`}
          </Button>
        </div>

        {sending && (
          <div className={styles.sendingOverlay} role="status" aria-live="polite">
            <div className={styles.sendingModal}>
              <Text variant="titleMd">
                {sendProgress
                  ? `보내는 중 ${sendProgress.sent}/${sendProgress.total}`
                  : '보내는 중…'}
              </Text>
              <div className={styles.loadingDots} aria-hidden>
                <span className={styles.loadingDot} />
                <span className={`${styles.loadingDot} ${styles.loadingDotDelay1}`} />
                <span className={`${styles.loadingDot} ${styles.loadingDotDelay2}`} />
              </div>
              <Text variant="bodyMd" color="gray500">
                {'\uC54C\uB9BC\uD1A1\uC744 \uBC1C\uC1A1\uD558\uACE0 \uC788\uC5B4\uC694. \uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694.'}
              </Text>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void handleSend()}
        title={'\uC54C\uB9BC\uD1A1\uC744 \uBCF4\uB0B4\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?'}
        descriptions={
          feedbackMode === 'AUTO'
            ? [
                `${selected.size}명의 ${channelAudienceLabel(sendToParent, sendToStudent)}로 알림톡이 발송됩니다.`,
                selectedAiReadyCount > 0
                  ? `미리 만든 피드백 ${selectedAiReadyCount}명은 바로 보여요. 나머지는 보낸 뒤 만들어져요.`
                  : '학부모 피드백은 보낸 뒤 대시보드에 만들어져요.',
              ]
            : [
                `${selected.size}명의 ${channelAudienceLabel(sendToParent, sendToStudent)}로 알림톡이 발송됩니다.`,
              ]
        }
        confirmLabel={'\uBC1C\uC1A1'}
        cancelLabel={'\uCDE8\uC18C'}
        confirmTour="alimtalk-send"
      />

      <Modal isOpen={lengthOpen} onClose={() => setLengthOpen(false)} size="sm">
        <div className={styles.lengthBody}>
          <Text variant="headingMd" as="h2" className={styles.lengthTitle}>
            1000자를 넘어가는 문자가 있어요
          </Text>
          {lengthNames.map((name, index) => (
            <Text key={`${name}-${index}`} variant="bodyLg" color="gray500">
              {name}
            </Text>
          ))}
        </div>
        <Button variant="primary" size="md" fullWidth onClick={() => setLengthOpen(false)}>
          확인
        </Button>
      </Modal>

      <ConfirmModal
        isOpen={cancelScheduleOpen}
        onClose={() => setCancelScheduleOpen(false)}
        onConfirm={() => void confirmCancelSchedule()}
        title="예약을 취소할까요?"
        descriptions={['예약 알림톡이 발송되지 않습니다. 다시 예약할 수 있어요.']}
        confirmLabel="예약 취소"
        cancelLabel="닫기"
        confirmVariant="danger"
      />

      <ConfirmModal
        isOpen={emptySendOpen}
        onClose={() => setEmptySendOpen(false)}
        onConfirm={() => void handleSend()}
        title="아직 작성 안 된 학생이 있어요"
        descriptions={[
          `${emptySendCount}명은 피드백을 적지 않았어요.`,
          '그 학생은 피드백 란이 비어 있는 채로 보내요.',
        ]}
        confirmLabel="무시하고 발송"
        cancelLabel="취소"
        confirmVariant="danger"
        confirmTour="alimtalk-send"
      />

      <LessonMessageOrderModal
        isOpen={messageOrderModal.isOpen}
        onClose={messageOrderModal.close}
        lesson={lesson}
        commonValues={commonValues}
        students={students}
        onSave={async (items) => {
          await onSaveMessageOrder(items)
          await loadPreview()
        }}
      />
    </div>,
    document.body,
  )
}
