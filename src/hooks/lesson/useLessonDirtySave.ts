import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'

import type { LessonStudent } from '@/types/lessonStudent'
import { lessonService, type LessonDetail } from '@/services/lesson'
import { useToastStore } from '@/stores/toastStore'
import {
  getLessonItemType,
  isImmediateSaveItemType,
  TEXT_INPUT_DEBOUNCE_MS,
} from '@/lib/lessonAutoSave'
import {
  buildLessonUpdateBodyForTargets,
  buildPartialLessonUpdateBody,
  findChangedStudentCells,
  parseStudentCellKey,
  studentCellKey,
} from '@/lib/lessonPartialSave'
import { itemRef, type ItemSource } from '@/lib/lessonItemRef'
import { queryKeys } from '@/lib/queryKeys'

type SetState<T> = Dispatch<SetStateAction<T>>

export type LessonDirtyFormBinding = {
  lesson: LessonDetail | null
  setLesson: SetState<LessonDetail | null>
  commonValues: Record<string, string>
  setCommonValues: SetState<Record<string, string>>
  students: LessonStudent[]
  setStudents: SetState<LessonStudent[]>
}

const SCHEDULE_CANCELLED_MESSAGE =
  '내용이 바뀌어 예약 발송을 취소했어요. 다시 예약해 주세요.'

function applySavedLesson(
  saved: LessonDetail,
  setLesson: SetState<LessonDetail | null>,
  addToast: (toast: { variant: 'warning'; message: string }) => void,
  queryClient: QueryClient,
) {
  if (saved.send_schedule_cancelled) {
    addToast({ variant: 'warning', message: SCHEDULE_CANCELLED_MESSAGE })
    void queryClient.invalidateQueries({ queryKey: queryKeys.lessons.sendSchedules })
  }
  setLesson((prev) => {
    if (!prev) return prev
    return {
      ...prev,
      status: 'SAVED',
      updated_at: saved.updated_at ?? prev.updated_at,
      send_schedule: saved.send_schedule === undefined ? prev.send_schedule : saved.send_schedule,
      send_schedule_cancel_notice:
        saved.send_schedule_cancel_notice === undefined
          ? prev.send_schedule_cancel_notice
          : saved.send_schedule_cancel_notice,
    }
  })
}

function clearDirtyFromBody(
  body: NonNullable<ReturnType<typeof buildLessonUpdateBodyForTargets>>,
  clearCommon: (ids: string[]) => void,
  clearCells: (keys: string[]) => void,
) {
  if (body.common_data?.length) {
    clearCommon(
      body.common_data.map((c) => {
        if (c.adhoc_item_id != null) return itemRef('adhoc', c.adhoc_item_id)
        return itemRef('template', c.template_item_id!)
      }),
    )
  }
  if (body.student_data?.length) {
    const keys: string[] = []
    for (const s of body.student_data) {
      for (const item of s.items) {
        const source = item.source ?? (item.adhoc_item_id != null ? 'adhoc' : 'template')
        const id = item.adhoc_item_id ?? item.template_item_id!
        keys.push(studentCellKey(s.student_id, source, id))
      }
    }
    clearCells(keys)
  }
}

export type StudentCellChange = {
  studentId: number
  source: ItemSource
  itemId: number
  isCompleted: boolean | null
  /**
   * AI 제안 적용: 저장 직전에 칸이 비어 있을 때만 쓴다.
   * 그사이 선생님이 적은 값은 바꾸지 않는다(§2, §10).
   */
  onlyIfBlank?: boolean
}

export type CellSaveOutcome =
  /**
   * settled = changes the table and the server now hold:
   * written by this call, or already equal before it
   */
  | { status: 'success'; settled: StudentCellChange[] }
  | { status: 'failed' }
  | { status: 'cancelled' }

function changeKey(change: StudentCellChange): string {
  return studentCellKey(change.studentId, change.source, change.itemId)
}

/** 칸 값(is_completed)만 바꾼 새 표. 숙제 열 메모(value)는 그대로다. */
function applyCellChanges(rows: LessonStudent[], changes: StudentCellChange[]): LessonStudent[] {
  const byKey = new Map(changes.map((change) => [changeKey(change), change]))
  return rows.map((row) => {
    if (!row.items.some((item) => byKey.has(studentCellKey(row.id, item.source, item.item_id)))) {
      return row
    }
    return {
      ...row,
      items: row.items.map((item) => {
        const change = byKey.get(studentCellKey(row.id, item.source, item.item_id))
        return change ? { ...item, is_completed: change.isCompleted } : item
      }),
    }
  })
}

/** 저장 실패: 이 호출이 넣은 값이 아직 그대로인 칸만 이전 값으로 돌린다. */
function revertCellChanges(
  rows: LessonStudent[],
  changes: StudentCellChange[],
  previous: Map<string, boolean | null | undefined>,
): LessonStudent[] {
  const byKey = new Map(changes.map((change) => [changeKey(change), change]))
  return rows.map((row) => {
    if (!row.items.some((item) => byKey.has(studentCellKey(row.id, item.source, item.item_id)))) {
      return row
    }
    return {
      ...row,
      items: row.items.map((item) => {
        const key = studentCellKey(row.id, item.source, item.item_id)
        const change = byKey.get(key)
        if (!change || (item.is_completed ?? null) !== change.isCompleted) return item
        return { ...item, is_completed: previous.get(key) }
      }),
    }
  })
}

/**
 * Dirty tracking, debounced autosave, and explicit save for lesson detail.
 * Call bindFormState(...) each render after useLessonLoad.
 */
export function useLessonDirtySave(lessonId: number) {
  const [dirtyCommonIds, setDirtyCommonIds] = useState<Set<string>>(() => new Set())
  const [dirtyStudentCells, setDirtyStudentCells] = useState<Set<string>>(() => new Set())
  const [autoSavingCount, setAutoSavingCount] = useState(0)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const dirtyStudentCellsRef = useRef(dirtyStudentCells)
  dirtyStudentCellsRef.current = dirtyStudentCells
  const dirtyCommonIdsRef = useRef(dirtyCommonIds)
  dirtyCommonIdsRef.current = dirtyCommonIds
  const autoSavingCountRef = useRef(autoSavingCount)
  autoSavingCountRef.current = autoSavingCount

  const lessonRef = useRef<LessonDetail | null>(null)
  const commonValuesRef = useRef<Record<string, string>>({})
  const studentsRef = useRef<LessonStudent[]>([])
  const setLessonRef = useRef<SetState<LessonDetail | null>>(() => {})
  const setCommonValuesRef = useRef<SetState<Record<string, string>>>(() => {})
  const setStudentsRef = useRef<SetState<LessonStudent[]>>(() => {})
  const scheduleEditAllowedRef = useRef(false)
  const scheduleGateRef = useRef<{
    promise: Promise<boolean>
    resolve: (ok: boolean) => void
  } | null>(null)
  const baselineCommonRef = useRef<Record<string, string>>({})
  const baselineStudentsRef = useRef<LessonStudent[]>([])
  const [scheduleEditOpen, setScheduleEditOpen] = useState(false)

  const bindFormState = (form: LessonDirtyFormBinding) => {
    lessonRef.current = form.lesson
    commonValuesRef.current = form.commonValues
    studentsRef.current = form.students
    setLessonRef.current = form.setLesson
    setCommonValuesRef.current = form.setCommonValues
    setStudentsRef.current = form.setStudents
    if (!form.lesson?.send_schedule) scheduleEditAllowedRef.current = false
    if (
      dirtyCommonIdsRef.current.size === 0 &&
      dirtyStudentCellsRef.current.size === 0 &&
      !scheduleGateRef.current
    ) {
      baselineCommonRef.current = form.commonValues
      baselineStudentsRef.current = form.students
    }
  }

  const clearDirty = useCallback(() => {
    setDirtyCommonIds(new Set())
    setDirtyStudentCells(new Set())
  }, [])

  const clearDebounceTimer = useCallback((timerKey: string) => {
    const existing = debounceTimersRef.current.get(timerKey)
    if (existing) {
      clearTimeout(existing)
      debounceTimersRef.current.delete(timerKey)
    }
  }, [])

  const clearAllDebounceTimers = useCallback(() => {
    for (const timer of debounceTimersRef.current.values()) {
      clearTimeout(timer)
    }
    debounceTimersRef.current.clear()
  }, [])

  useEffect(() => {
    return () => clearAllDebounceTimers()
  }, [clearAllDebounceTimers])

  const markStudentCellsDirty = useCallback((keys: Iterable<string>) => {
    setDirtyStudentCells((prev) => {
      const next = new Set(prev)
      for (const key of keys) next.add(key)
      return next
    })
  }, [])

  const removeDirtyCommon = useCallback((ids: string[]) => {
    setDirtyCommonIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.delete(id)
      return next
    })
  }, [])

  const removeDirtyCells = useCallback((keys: string[]) => {
    setDirtyStudentCells((prev) => {
      const next = new Set(prev)
      for (const key of keys) next.delete(key)
      return next
    })
  }, [])

  const forgetDirtyStudent = useCallback(
    (studentId: number) => {
      const prefix = `cell:${studentId}:`
      for (const key of [...debounceTimersRef.current.keys()]) {
        if (key.startsWith(prefix)) clearDebounceTimer(key)
      }
      setDirtyStudentCells((prev) => {
        const next = new Set(prev)
        for (const key of prev) {
          if (parseStudentCellKey(key).studentId === studentId) next.delete(key)
        }
        return next
      })
    },
    [clearDebounceTimer],
  )

  const forgetDirtyItem = useCallback((source: 'template' | 'adhoc', itemId: number) => {
    const ref = itemRef(source, itemId)
    setDirtyCommonIds((prev) => {
      const next = new Set(prev)
      next.delete(ref)
      return next
    })
    setDirtyStudentCells((prev) => {
      const next = new Set(prev)
      for (const key of prev) {
        const parsed = parseStudentCellKey(key)
        if (parsed.source === source && parsed.itemId === itemId) next.delete(key)
      }
      return next
    })
  }, [])

  const confirmScheduleEdit = useCallback((): Promise<boolean> => {
    const lesson = lessonRef.current
    if (!lesson?.send_schedule || scheduleEditAllowedRef.current) return Promise.resolve(true)
    if (scheduleGateRef.current) return scheduleGateRef.current.promise
    let resolve: (ok: boolean) => void = () => {}
    const promise = new Promise<boolean>((res) => {
      resolve = res
    })
    scheduleGateRef.current = { promise, resolve }
    setScheduleEditOpen(true)
    return promise
  }, [])

  const acceptScheduleEdit = useCallback(() => {
    scheduleEditAllowedRef.current = true
    setScheduleEditOpen(false)
    const gate = scheduleGateRef.current
    scheduleGateRef.current = null
    gate?.resolve(true)
  }, [])

  const rejectScheduleEdit = useCallback(() => {
    clearAllDebounceTimers()
    setCommonValuesRef.current(baselineCommonRef.current)
    setStudentsRef.current(baselineStudentsRef.current)
    setDirtyCommonIds(new Set())
    setDirtyStudentCells(new Set())
    setScheduleEditOpen(false)
    const gate = scheduleGateRef.current
    scheduleGateRef.current = null
    gate?.resolve(false)
  }, [clearAllDebounceTimers])

  const persistTargets = useCallback(
    async (options: {
      commonIds?: string[]
      studentCells?: string[]
      silent?: boolean
    }): Promise<boolean> => {
      const currentLesson = lessonRef.current
      if (!currentLesson) return false

      const commonIds = options.commonIds ?? []
      const studentCells = options.studentCells ?? []
      if (commonIds.length === 0 && studentCells.length === 0) return true

      const allowed = await confirmScheduleEdit()
      if (!allowed) return false

      const body = buildLessonUpdateBodyForTargets({
        commonIds,
        studentCells,
        commonValues: commonValuesRef.current,
        students: studentsRef.current,
        lessonItems: currentLesson.items,
        status: 'SAVED',
      })

      if (!body) return false

      setAutoSavingCount((c) => c + 1)
      try {
        const saved = await lessonService.updateLesson(lessonId, body)
        clearDirtyFromBody(body, removeDirtyCommon, removeDirtyCells)
        applySavedLesson(saved, setLessonRef.current, addToast, queryClient)
        return true
      } catch {
        if (!options.silent) {
          addToast({ variant: 'error', message: '저장에 실패했어요.' })
        } else {
          addToast({
            variant: 'error',
            message: '자동 저장에 실패했어요. 저장 버튼을 눌러 주세요.',
          })
        }
        return false
      } finally {
        setAutoSavingCount((c) => Math.max(0, c - 1))
      }
    },
    [lessonId, addToast, confirmScheduleEdit, queryClient, removeDirtyCommon, removeDirtyCells],
  )

  const scheduleDebouncedSave = useCallback(
    (timerKey: string, run: () => void) => {
      clearDebounceTimer(timerKey)
      const timer = setTimeout(() => {
        debounceTimersRef.current.delete(timerKey)
        run()
      }, TEXT_INPUT_DEBOUNCE_MS)
      debounceTimersRef.current.set(timerKey, timer)
    },
    [clearDebounceTimer],
  )

  const scheduleAutoSaveStudentCells = useCallback(
    (cellKeys: string[]) => {
      const items = lessonRef.current?.items ?? []
      const completeBatches = new Map<string, string[]>()

      for (const key of cellKeys) {
        const { source, itemId } = parseStudentCellKey(key)
        const itemType = getLessonItemType(items, source, itemId)

        if (itemType === 'COMPLETE') {
          const batchKey = `${source}:${itemId}`
          const batch = completeBatches.get(batchKey) ?? []
          batch.push(key)
          completeBatches.set(batchKey, batch)
          continue
        }

        if (isImmediateSaveItemType(itemType)) {
          clearDebounceTimer(`cell:${key}`)
          void persistTargets({ studentCells: [key], silent: true })
        } else {
          scheduleDebouncedSave(`cell:${key}`, () => {
            void persistTargets({ studentCells: [key], silent: true })
          })
        }
      }

      for (const [batchKey, keys] of completeBatches) {
        if (keys.length > 1) {
          scheduleDebouncedSave(`complete-col:${batchKey}`, () => {
            void persistTargets({ studentCells: keys, silent: true })
          })
        } else {
          clearDebounceTimer(`cell:${keys[0]}`)
          void persistTargets({ studentCells: keys, silent: true })
        }
      }
    },
    [clearDebounceTimer, persistTargets, scheduleDebouncedSave],
  )

  const updateCommonValue = useCallback(
    (ref: string, value: string) => {
      setCommonValuesRef.current((prev) => ({ ...prev, [ref]: value }))
      setDirtyCommonIds((prev) => {
        const next = new Set(prev)
        next.add(ref)
        return next
      })
      scheduleDebouncedSave(`common:${ref}`, () => {
        void persistTargets({ commonIds: [ref], silent: true })
      })
    },
    [persistTargets, scheduleDebouncedSave],
  )

  const updateStudents = useCallback(
    (next: LessonStudent[] | ((prev: LessonStudent[]) => LessonStudent[])) => {
      setStudentsRef.current((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        const attendanceItem = lessonRef.current?.items.find((i) => i.item_type === 'ATTENDANCE')
        const changedCells = findChangedStudentCells(prev, resolved, attendanceItem)
        if (changedCells.length > 0) {
          markStudentCellsDirty(changedCells)
          queueMicrotask(() => scheduleAutoSaveStudentCells(changedCells))
        }
        return resolved
      })
    },
    [markStudentCellsDirty, scheduleAutoSaveStudentCells],
  )

  const flushPendingStudentCellSave = useCallback(
    (studentId: number, source: 'template' | 'adhoc', itemId: number) => {
      const key = studentCellKey(studentId, source, itemId)
      clearDebounceTimer(`cell:${key}`)
      if (!dirtyStudentCellsRef.current.has(key)) return
      void persistTargets({ studentCells: [key], silent: true })
    },
    [clearDebounceTimer, persistTargets],
  )

  const saveDirtyChanges = useCallback(async (): Promise<boolean> => {
    const lesson = lessonRef.current
    if (!lesson) return false

    clearAllDebounceTimers()

    const body = buildPartialLessonUpdateBody({
      dirtyCommonIds,
      dirtyStudentCells,
      commonValues: commonValuesRef.current,
      students: studentsRef.current,
      lessonItems: lesson.items,
      status: 'SAVED',
    })

    if (!body) {
      addToast({ variant: 'warning', message: '저장할 변경 내용이 없어요.' })
      return true
    }

    const allowed = await confirmScheduleEdit()
    if (!allowed) return false

    setAutoSavingCount((c) => c + 1)
    try {
      const saved = await lessonService.updateLesson(lessonId, body)
      clearDirtyFromBody(body, removeDirtyCommon, removeDirtyCells)
      applySavedLesson(saved, setLessonRef.current, addToast, queryClient)
      addToast({ variant: 'success', message: '저장됐어요.' })
      return true
    } catch {
      addToast({ variant: 'error', message: '저장에 실패했어요.' })
      return false
    } finally {
      setAutoSavingCount((c) => Math.max(0, c - 1))
    }
  }, [
    lessonId,
    dirtyCommonIds,
    dirtyStudentCells,
    addToast,
    confirmScheduleEdit,
    queryClient,
    clearAllDebounceTimers,
    removeDirtyCommon,
    removeDirtyCells,
  ])

  /** 알림톡 발송 전: 미저장 변경 반영 + DRAFT면 SAVED로 전환 */
  const ensureSavedForAlimtalk = useCallback(async (): Promise<boolean> => {
    const lesson = lessonRef.current
    if (!lesson) return false

    clearAllDebounceTimers()

    const body = buildPartialLessonUpdateBody({
      dirtyCommonIds,
      dirtyStudentCells,
      commonValues: commonValuesRef.current,
      students: studentsRef.current,
      lessonItems: lesson.items,
      status: 'SAVED',
    })

    if (body) {
      const allowed = await confirmScheduleEdit()
      if (!allowed) return false
    }

    setAutoSavingCount((c) => c + 1)
    try {
      if (body) {
        const saved = await lessonService.updateLesson(lessonId, body)
        clearDirtyFromBody(body, removeDirtyCommon, removeDirtyCells)
        applySavedLesson(saved, setLessonRef.current, addToast, queryClient)
      } else if (lesson.status === 'DRAFT') {
        await lessonService.saveLesson(lessonId)
      }
      setLessonRef.current((prev) => (prev ? { ...prev, status: 'SAVED' } : prev))
      return true
    } catch {
      addToast({
        variant: 'error',
        message: '수업 저장에 실패했어요. 저장 후 알림톡을 보내 주세요.',
      })
      return false
    } finally {
      setAutoSavingCount((c) => Math.max(0, c - 1))
    }
  }, [
    lessonId,
    dirtyCommonIds,
    dirtyStudentCells,
    addToast,
    confirmScheduleEdit,
    queryClient,
    clearAllDebounceTimers,
    removeDirtyCommon,
    removeDirtyCells,
  ])

  /**
   * 바꿀 숙제 칸들을 바로 저장하고 결과를 돌려준다(사진 숙제 AI 확인 §10).
   * 기존 자동 저장은 그대로다.
   * - 예약 확인 창을 먼저 거친다(취소 → 'cancelled', 표는 기존 rejectScheduleEdit가 되돌린다).
   * - 칸은 확인 창을 지난 뒤의 표 상태로 다시 본다.
   *   onlyIfBlank 변경은 그때 칸에 값이 있으면 빠진다.
   * - 칸 값이 이미 같으면 보내지 않고 settled에 넣는다. 처리 기록은 settled에 든 것만 남긴다.
   * - 실패하면 이 함수가 바꾼 칸만 되돌리고 'failed'(토스트는 부른 쪽이 띄운다).
   */
  const saveStudentCellsNow = useCallback(
    async (changes: StudentCellChange[]): Promise<CellSaveOutcome> => {
      if (!lessonRef.current) return { status: 'failed' }
      if (!(await confirmScheduleEdit())) return { status: 'cancelled' }

      // 확인 창이 열린 동안에도 5초 확인이 저장 안 한 칸에 서버 값을 넣으므로 표는 여기서 읽는다.
      const lesson = lessonRef.current
      if (!lesson) return { status: 'failed' }
      const current = studentsRef.current
      const rowsById = new Map(current.map((row) => [row.id, row]))

      const already: StudentCellChange[] = []
      const pending: StudentCellChange[] = []
      const previous = new Map<string, boolean | null | undefined>()
      const seen = new Set<string>()
      for (const change of changes) {
        const key = changeKey(change)
        if (seen.has(key)) continue
        seen.add(key)
        const cell = rowsById
          .get(change.studentId)
          ?.items.find((item) => item.source === change.source && item.item_id === change.itemId)
        if (!cell) continue
        const now = cell.is_completed ?? null
        if (now === change.isCompleted) {
          already.push(change)
          continue
        }
        // onlyIfBlank인데 칸에 값이 있으면 선생님이 적은 값이다. 바꾸지 않는다.
        if (change.onlyIfBlank && now !== null) continue
        pending.push(change)
        previous.set(key, cell.is_completed)
      }
      if (pending.length === 0) return { status: 'success', settled: already }

      const keys = pending.map(changeKey)
      const wasDirty = new Set(keys.filter((key) => dirtyStudentCellsRef.current.has(key)))
      // ref는 렌더 때만 새로 들어오므로 본문은 여기서 만든 표로 짓는다.
      const nextRows = applyCellChanges(current, pending)
      setStudentsRef.current((prev) => applyCellChanges(prev, pending))
      // 저장하는 동안 5초 확인이 이 칸들을 서버 값으로 덮지 않게 한다.
      markStudentCellsDirty(keys)

      const rollback = () => {
        setStudentsRef.current((prev) => revertCellChanges(prev, pending, previous))
        removeDirtyCells(keys.filter((key) => !wasDirty.has(key)))
      }

      const body = buildLessonUpdateBodyForTargets({
        commonIds: [],
        studentCells: keys,
        commonValues: commonValuesRef.current,
        students: nextRows,
        lessonItems: lesson.items,
        status: 'SAVED',
      })
      if (!body) {
        rollback()
        return { status: 'failed' }
      }

      setAutoSavingCount((c) => c + 1)
      try {
        const saved = await lessonService.updateLesson(lessonId, body)
        clearDirtyFromBody(body, removeDirtyCommon, removeDirtyCells)
        applySavedLesson(saved, setLessonRef.current, addToast, queryClient)
        return { status: 'success', settled: [...already, ...pending] }
      } catch {
        rollback()
        return { status: 'failed' }
      } finally {
        setAutoSavingCount((c) => Math.max(0, c - 1))
      }
    },
    [
      lessonId,
      addToast,
      confirmScheduleEdit,
      queryClient,
      markStudentCellsDirty,
      removeDirtyCommon,
      removeDirtyCells,
    ],
  )

  const hasUnsavedChanges = dirtyCommonIds.size > 0 || dirtyStudentCells.size > 0

  const getDirtySnapshot = useCallback(
    () => ({
      cells: dirtyStudentCellsRef.current,
      common: dirtyCommonIdsRef.current,
    }),
    [],
  )

  const isBusy = useCallback(() => autoSavingCountRef.current > 0, [])

  return {
    bindFormState,
    clearDirty,
    clearAllDebounceTimers,
    forgetDirtyItem,
    forgetDirtyStudent,
    updateCommonValue,
    updateStudents,
    flushPendingStudentCellSave,
    saveDirtyChanges,
    ensureSavedForAlimtalk,
    saveStudentCellsNow,
    hasUnsavedChanges,
    isAutoSaving: autoSavingCount > 0,
    getDirtySnapshot,
    isBusy,
    confirmScheduleEdit,
    scheduleEditOpen,
    acceptScheduleEdit,
    rejectScheduleEdit,
  }
}
