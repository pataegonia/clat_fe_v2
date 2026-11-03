import { useCallback } from 'react'

import { lessonService } from '@/services/lesson'
import useDisclosure from './useDisclosure'
import { useToastStore } from '@/stores/toastStore'
import { useLessonLoad } from './lesson/useLessonLoad'
import { useLessonDirtySave } from './lesson/useLessonDirtySave'
import { useLessonAdhocItems } from './lesson/useLessonAdhocItems'
import { useLessonProgress } from './lesson/useLessonProgress'
import { useLessonAttendanceRefresh } from './lesson/useLessonAttendanceRefresh'
import { useLessonAttendanceExtras } from './lesson/useLessonAttendanceExtras'
import { createEmptyLessonStudent } from './lesson/initializeLessonFromDetail'

export default function useLessonDetail(lessonId: number) {
  const alimtalkSendModal = useDisclosure()
  const addToast = useToastStore((s) => s.addToast)

  const {
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
    hasUnsavedChanges,
    isAutoSaving,
    getDirtySnapshot,
    isBusy,
    confirmScheduleEdit,
    scheduleEditOpen,
    acceptScheduleEdit,
    rejectScheduleEdit,
  } = useLessonDirtySave(lessonId)

  const {
    lesson,
    setLesson,
    commonValues,
    setCommonValues,
    students,
    setStudents,
    isLoading,
    error,
    refetch,
    triggerReload,
  } = useLessonLoad(lessonId, {
    clearDirty,
    clearAllDebounceTimers,
    getDirtySnapshot,
    isBusy,
  })

  bindFormState({
    lesson,
    setLesson,
    commonValues,
    setCommonValues,
    students,
    setStudents,
  })

  const refetchAfterAttendanceEnd = useLessonAttendanceRefresh({
    lessonId,
    setLesson,
    setStudents,
    triggerReload,
  })

  const { inputCount } = useLessonProgress(students, lesson?.items)

  const {
    addAdhocItem,
    removeAdhocItem,
    excludeTemplateItem,
    updateLessonItemOrder,
    setItemPartial,
  } = useLessonAdhocItems({
    lessonId,
    setLesson,
    setCommonValues,
    setStudents,
    forgetDirtyItem,
  })

  const { addAttendanceOption, removeAttendanceOption } = useLessonAttendanceExtras({
    lessonId,
    setLesson,
    setStudents,
  })

  const addAdhocItemGuarded = useCallback<typeof addAdhocItem>(
    async (body) => {
      if (!(await confirmScheduleEdit())) return
      return addAdhocItem(body)
    },
    [addAdhocItem, confirmScheduleEdit],
  )

  const removeAdhocItemGuarded = useCallback(
    async (itemId: number) => {
      if (!(await confirmScheduleEdit())) return
      return removeAdhocItem(itemId)
    },
    [confirmScheduleEdit, removeAdhocItem],
  )

  const excludeTemplateItemGuarded = useCallback(
    async (templateItemId: number) => {
      if (!(await confirmScheduleEdit())) return
      return excludeTemplateItem(templateItemId)
    },
    [confirmScheduleEdit, excludeTemplateItem],
  )

  const updateLessonItemOrderGuarded = useCallback<typeof updateLessonItemOrder>(
    async (items) => {
      if (!(await confirmScheduleEdit())) return
      return updateLessonItemOrder(items)
    },
    [confirmScheduleEdit, updateLessonItemOrder],
  )

  const setItemPartialGuarded = useCallback<typeof setItemPartial>(
    async (item, isPartial) => {
      if (!(await confirmScheduleEdit())) return
      return setItemPartial(item, isPartial)
    },
    [confirmScheduleEdit, setItemPartial],
  )

  const addAttendanceOptionGuarded = useCallback(
    async (label: string) => {
      if (!(await confirmScheduleEdit())) return
      return addAttendanceOption(label)
    },
    [addAttendanceOption, confirmScheduleEdit],
  )

  const removeAttendanceOptionGuarded = useCallback(
    async (optionId: number, label: string) => {
      if (!(await confirmScheduleEdit())) return
      return removeAttendanceOption(optionId, label)
    },
    [confirmScheduleEdit, removeAttendanceOption],
  )

  const addStudentsToLesson = useCallback(
    async (studentIds: number[]) => {
      if (!(await confirmScheduleEdit())) return
      if (!lesson) return
      try {
        const result = await lessonService.addLessonStudents(lessonId, studentIds)
        if (result.students.length === 0) {
          addToast({ variant: 'success', message: '이미 이 수업에 있는 학생이에요.' })
          return
        }
        setStudents((prev) => {
          const existing = new Set(prev.map((s) => s.id))
          const added = result.students
            .filter((s) => !existing.has(s.student_id))
            .map((s) => createEmptyLessonStudent(s.student_id, s.student_name, lesson.items))
          return [...prev, ...added].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
        })
        setLesson((prev) => {
          if (!prev) return prev
          const addedIds = new Set(result.students.map((s) => s.student_id))
          const existingGuest = new Set((prev.guest_students ?? []).map((g) => g.student_id))
          const newGuests = result.students.filter((s) => !existingGuest.has(s.student_id))
          return {
            ...prev,
            excluded_student_ids: (prev.excluded_student_ids ?? []).filter(
              (id) => !addedIds.has(id),
            ),
            roster_student_ids: [
              ...new Set([...(prev.roster_student_ids ?? []), ...addedIds]),
            ],
            guest_students: [...(prev.guest_students ?? []), ...newGuests],
          }
        })
        addToast({
          variant: 'success',
          message:
            result.added_count === 1
              ? '학생이 이 수업 입력에 추가됐어요.'
              : `학생 ${result.added_count}명이 이 수업 입력에 추가됐어요.`,
        })
      } catch {
        addToast({ variant: 'error', message: '학생 추가에 실패했어요.' })
      }
    },
    [addToast, confirmScheduleEdit, lesson, lessonId, setLesson, setStudents],
  )

  const removeStudentFromLesson = useCallback(
    async (studentId: number) => {
      if (!(await confirmScheduleEdit())) return
      forgetDirtyStudent(studentId)
      try {
        const result = await lessonService.removeLessonStudent(lessonId, studentId)
        setStudents((prev) => prev.filter((s) => s.id !== studentId))
        setLesson((prev) => {
          if (!prev) return prev
          const excluded = new Set(prev.excluded_student_ids ?? [])
          excluded.add(studentId)
          return {
            ...prev,
            excluded_student_ids: [...excluded],
            roster_student_ids: (prev.roster_student_ids ?? []).filter((id) => id !== studentId),
            guest_students: (prev.guest_students ?? []).filter((g) => g.student_id !== studentId),
          }
        })
        addToast({
          variant: 'success',
          message: `'${result.student_name}' 학생을 이 수업에서만 뺐어요.`,
        })
      } catch {
        addToast({ variant: 'error', message: '학생을 빼지 못했어요.' })
      }
    },
    [addToast, confirmScheduleEdit, forgetDirtyStudent, lessonId, setLesson, setStudents],
  )

  const openAlimtalkSendModal = useCallback(async () => {
    const ok = await ensureSavedForAlimtalk()
    if (ok) alimtalkSendModal.open()
  }, [ensureSavedForAlimtalk, alimtalkSendModal])

  return {
    lesson,
    setLesson,
    error,
    commonValues,
    updateCommonValue,
    students,
    updateStudents,
    flushPendingStudentCellSave,
    alimtalkSendModal,
    openAlimtalkSendModal,
    inputCount,
    isLoading,
    hasUnsavedChanges,
    isAutoSaving,
    saveDirtyChanges,
    ensureSavedForAlimtalk,
    confirmScheduleEdit,
    scheduleEditOpen,
    acceptScheduleEdit,
    rejectScheduleEdit,
    refetch,
    refetchAfterAttendanceEnd,
    addAdhocItem: addAdhocItemGuarded,
    removeAdhocItem: removeAdhocItemGuarded,
    excludeTemplateItem: excludeTemplateItemGuarded,
    updateLessonItemOrder: updateLessonItemOrderGuarded,
    setItemPartial: setItemPartialGuarded,
    addStudentsToLesson,
    removeStudentFromLesson,
    addAttendanceOption: addAttendanceOptionGuarded,
    removeAttendanceOption: removeAttendanceOptionGuarded,
  }
}
