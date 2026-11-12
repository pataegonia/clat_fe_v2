import { useCallback, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { LessonDetail } from '@/services/lesson'
import type { LessonStudent } from '@/types/lessonStudent'
import type { HwLessonView, HwResolveAction, HwSubmissionView } from '@/types/homeworkPhoto'
import { homeworkPhotoService } from '@/services/homeworkPhoto'
import { studentService } from '@/services/student'
import { useToastStore } from '@/stores/toastStore'
import { useHomeworkPhotoTrial } from '@/hooks/useHomeworkPhotoTrial'
import { hwKeys } from '@/lib/homeworkPhoto/queryKeys'
import {
  deriveRows,
  homeworkColumnId,
  suggestionChanges,
  summarize,
  type HwRowView,
  type HwSuggestionChange,
} from '@/lib/homeworkPhoto/rowState'
import type { CellSaveOutcome, StudentCellChange } from './useLessonDirtySave'

/** 학생 제출은 수업 기록을 바꾸지 않아 5초 확인이 모른다. 표를 연 동안 따로 다시 받는다(§10). */
const POLL_MS = 15_000
const STALE_MS = 5_000
/** 처리 API(T11)가 한 번에 받는 건수 */
const RESOLVE_BATCH_MAX = 100

const APPLY_FAILED_MESSAGE = 'AI 제안을 적용하지 못했어요.'
const SAVE_FAILED_MESSAGE = '저장에 실패했어요.'
const ACTION_FAILED_MESSAGE = '처리하지 못했어요.'
/** 다른 수업으로 옮기기가 안 될 때(서버 HOMEWORK_PHOTO_INVALID_TARGET) */
const MOVE_INVALID_TARGET_MESSAGE =
  '그 반·날짜로 옮길 수 없어요. 그 반 학생이 아니거나 그 날짜에 이미 낸 숙제가 있어요.'

function actionFailedMessage(action: HwResolveAction, code: string | null): string {
  return action.type === 'MOVE' && code === 'HOMEWORK_PHOTO_INVALID_TARGET'
    ? MOVE_INVALID_TARGET_MESSAGE
    : ACTION_FAILED_MESSAGE
}

export type SendPromptDecision = 'proceed' | 'abort'

type UseLessonHomeworkPhotosParams = {
  lessonId: number
  lesson: LessonDetail | null
  students: LessonStudent[]
  saveStudentCellsNow: (changes: StudentCellChange[]) => Promise<CellSaveOutcome>
}

/** 적용 기록: 이 저장으로 칸에 들어갔거나 이미 같았던(settled) 칸의 제출만 남긴다. */
function appliedActions(
  items: HwSuggestionChange[],
  settled: StudentCellChange[]
): HwResolveAction[] {
  const settledStudents = new Set(settled.map((change) => change.studentId))
  return items
    .filter((item) => settledStudents.has(item.change.studentId))
    .map(
      (item): HwResolveAction => ({
        type: 'APPLIED',
        submission_id: item.submissionId,
        value: item.change.isCompleted === true,
      })
    )
}

/**
 * 수업 표의 사진 숙제 AI 확인: 제안·확인 필요 받기(15초마다), 표 위 숫자, AI 제안 적용,
 * 숙제 칸 버튼의 처리 기록, 옆 창 처리, 보내기 창 앞 질문.
 * 제안은 표 상태(students)에 넣지 않는다. 넣으면 바뀐 칸으로 보고 바로 저장하기 때문이다(§10).
 */
export function useLessonHomeworkPhotos({
  lessonId,
  lesson,
  students,
  saveStudentCellsNow,
}: UseLessonHomeworkPhotosParams) {
  const trial = useHomeworkPhotoTrial()
  const enabled = trial.enabled && Number.isInteger(lessonId) && lessonId > 0
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  const query = useQuery({
    queryKey: hwKeys.lesson(lessonId),
    queryFn: () => homeworkPhotoService.getLesson(lessonId),
    enabled,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    staleTime: STALE_MS,
  })

  // await 뒤에 도는 코드는 렌더 때 값이 아니라 이 ref로 지금 표를 본다(bindFormState와 같다).
  const latestRef = useRef({ lesson, students })
  latestRef.current = { lesson, students }
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled
  const saveRef = useRef(saveStudentCellsNow)
  saveRef.current = saveStudentCellsNow
  const refetchRef = useRef(query.refetch)
  refetchRef.current = query.refetch

  const view = enabled ? (query.data ?? null) : null
  const columnItemId = view && lesson ? homeworkColumnId(view, lesson.items) : null
  const rows = useMemo(
    () =>
      view ? deriveRows(view, students, lessonId, columnItemId) : new Map<number, HwRowView>(),
    [view, students, lessonId, columnItemId]
  )
  const summary = useMemo(() => summarize(rows, students), [rows, students])

  const [applying, setApplying] = useState(false)
  const applyingRef = useRef(false)
  const [sendPrompt, setSendPrompt] = useState<{ count: number } | null>(null)
  const sendPromptAnswerRef = useRef<((apply: boolean) => void) | null>(null)
  const promptingRef = useRef(false)

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: hwKeys.lesson(lessonId) }),
    [queryClient, lessonId]
  )

  const recordApplied = useCallback(
    async (items: HwSuggestionChange[], settled: StudentCellChange[]) => {
      const actions = appliedActions(items, settled)
      for (let i = 0; i < actions.length; i += RESOLVE_BATCH_MAX) {
        try {
          await homeworkPhotoService.resolve(lessonId, actions.slice(i, i + RESOLVE_BATCH_MAX))
        } catch {
          // 기록이 빠져도 상태는 맞다: 칸 값이 판정과 같으면 사진만 붙은 것으로 본다(§10).
        }
      }
    },
    [lessonId]
  )

  /** AI 제안 적용: 제안이 보이는 빈 칸만 저장하고, 저장된(settled) 칸만 적용으로 기록한다. */
  const applySuggestions = async () => {
    if (columnItemId === null || applyingRef.current) return
    const items = suggestionChanges(rows, columnItemId)
    if (items.length === 0) return
    applyingRef.current = true
    setApplying(true)
    try {
      const result = await saveStudentCellsNow(items.map((item) => item.change))
      if (result.status === 'failed') {
        addToast({ variant: 'error', message: APPLY_FAILED_MESSAGE })
      }
      if (result.status !== 'success') return
      await recordApplied(items, result.settled)
      await refresh()
    } finally {
      applyingRef.current = false
      setApplying(false)
    }
  }

  /**
   * 이 수업 대상 제출이 있는 학생의 숙제 칸 버튼(옆 창의 완료·미완료도 같다).
   * 저장이 성공한 뒤에만, 제안이나 확인 필요가 있던 칸이면 적용함(제안과 같음)·체크함(다름)을
   * 남긴다. 다시 눌러 비우면(value null) 기록하지 않는다.
   * 넘어온 확인 필요는 이 버튼으로 끝나지 않는다(§10 처리).
   */
  const onCellChange = async (studentId: number, value: boolean | null) => {
    if (columnItemId === null) return
    const before = rows.get(studentId)
    const result = await saveStudentCellsNow([
      { studentId, source: 'template', itemId: columnItemId, isCompleted: value },
    ])
    if (result.status === 'failed') addToast({ variant: 'error', message: SAVE_FAILED_MESSAGE })
    if (
      result.status === 'success' &&
      result.settled.length === 1 &&
      value !== null &&
      before?.ownSubmissionId &&
      (before.ownState === 'SUGGESTION' || before.ownState === 'REVIEW')
    ) {
      const type = before.suggestion === value ? 'APPLIED' : 'CHECKED'
      try {
        await homeworkPhotoService.resolve(lessonId, [
          { type, submission_id: before.ownSubmissionId, value },
        ])
      } catch {
        // 기록이 빠지면 그 칸은 다시 확인 필요로 보이고, 선생님이 확인함을 누르면 된다(§10).
      }
    }
    await refresh()
  }

  /** 옆 창 처리 한 건. 요청이 실패하거나 서버가 ok:false를 주면 토스트를 띄운다. */
  const resolveOne = async (action: HwResolveAction): Promise<boolean> => {
    let ok = false
    let code: string | null = null
    try {
      const { results } = await homeworkPhotoService.resolve(lessonId, [action])
      ok = results.length > 0 && results.every((result) => result.ok)
      code = results.find((result) => !result.ok)?.code ?? null
    } catch {
      ok = false
    }
    if (!ok) addToast({ variant: 'error', message: actionFailedMessage(action, code) })
    await refresh()
    return ok
  }

  /** AI 다시 확인 */
  const recheck = async (submissionId: string): Promise<boolean> => {
    let ok = true
    try {
      await homeworkPhotoService.recheck(submissionId)
    } catch {
      ok = false
      addToast({ variant: 'error', message: ACTION_FAILED_MESSAGE })
    }
    await refresh()
    return ok
  }

  /**
   * 지난 숙제로 완료: 기존 완료 처리 API로 그 지난 칸을 완료로 바꾼 뒤
   * 체크함(완료, 그 지난 수업)을 남긴다.
   */
  const completeLate = async (sub: HwSubmissionView): Promise<boolean> => {
    const rowId = sub.late?.lesson_student_data_id ?? null
    if (rowId === null) return false
    try {
      await studentService.completeItem(rowId)
    } catch {
      addToast({ variant: 'error', message: ACTION_FAILED_MESSAGE })
      await refresh()
      return false
    }
    const lessonRecordId = sub.late?.lesson_record_id ?? null
    return resolveOne({
      type: 'CHECKED',
      submission_id: sub.id,
      value: true,
      ...(lessonRecordId !== null ? { lesson_record_id: lessonRecordId } : {}),
    })
  }

  /** 보내기 창 앞 질문의 답: 적용 → true, 적용 안 함·바깥 누름 → false */
  const answerSendPrompt = useCallback((apply: boolean) => {
    const answer = sendPromptAnswerRef.current
    sendPromptAnswerRef.current = null
    setSendPrompt(null)
    answer?.(apply)
  }, [])

  const askSendPrompt = useCallback(
    (count: number) =>
      new Promise<boolean>((resolve) => {
        sendPromptAnswerRef.current = resolve
        setSendPrompt({ count })
      }),
    []
  )

  /**
   * 보내기 창을 열기 전(ensureSavedForAlimtalk보다 먼저): 제안을 다시 받아, 적용하지 않은 제안이
   * 있으면 "AI 제안 n명을 적용하고 보낼까요?"를 묻는다.
   * 적용 → 저장 성공이면 'proceed', 실패·예약 취소 확인에서 취소면 'abort'.
   * 적용 안 함·바깥 누름은 적용하지 않고 'proceed'(창을 연다, §17 "한 번 알릴 뿐").
   */
  const promptBeforeSend = useCallback(async (): Promise<SendPromptDecision> => {
    if (!enabledRef.current) return 'proceed'
    if (promptingRef.current) return 'abort'
    promptingRef.current = true
    try {
      const { data } = await refetchRef.current()
      const fresh = queryClient.getQueryData<HwLessonView>(hwKeys.lesson(lessonId)) ?? data
      // 렌더 때 rows는 다시 받기 전 것이다. 새 응답과 지금 표(latestRef)로 센다.
      const pendingSuggestions = (): HwSuggestionChange[] => {
        const current = latestRef.current
        if (!fresh?.enabled || !current.lesson) return []
        const column = homeworkColumnId(fresh, current.lesson.items)
        if (column === null) return []
        return suggestionChanges(deriveRows(fresh, current.students, lessonId, column), column)
      }
      const count = pendingSuggestions().length
      if (count === 0) return 'proceed'
      if (!(await askSendPrompt(count))) return 'proceed'
      // 묻는 동안 5초 확인이나 다른 탭이 칸을 바꿀 수 있어, 창이 닫힌 뒤 다시 센다.
      const items = pendingSuggestions()
      if (items.length === 0) return 'proceed'
      const result = await saveRef.current(items.map((item) => item.change))
      if (result.status === 'success') {
        await recordApplied(items, result.settled)
        void refresh()
        return 'proceed'
      }
      if (result.status === 'failed') {
        addToast({ variant: 'error', message: APPLY_FAILED_MESSAGE })
      }
      return 'abort'
    } finally {
      promptingRef.current = false
    }
  }, [addToast, askSendPrompt, lessonId, queryClient, recordApplied, refresh])

  return {
    /** 기능 체험을 켰다(제안을 받는다) */
    enabled,
    view,
    /** 이 표의 숙제 열(템플릿 항목 id). 없으면 null */
    columnItemId,
    rows,
    summary,
    suggestionCount: summary.complete + summary.incomplete,
    applying,
    applySuggestions,
    onCellChange,
    resolveOne,
    recheck,
    completeLate,
    refresh,
    promptBeforeSend,
    /** 보내기 창 앞 질문(열려 있으면 제안 수) */
    sendPrompt,
    answerSendPrompt,
  }
}

export type LessonHomeworkPhotos = ReturnType<typeof useLessonHomeworkPhotos>
