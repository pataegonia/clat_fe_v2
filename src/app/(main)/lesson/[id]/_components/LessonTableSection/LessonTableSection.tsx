'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import UsersIcon from '@/assets/icons/icon-users.svg'
import TrashIcon from '@/assets/icons/icon-trash.svg'
import StudentNameSearchBar, {
  emptyStateIconStyle,
  emptyStateStyle,
} from '@/components/common/StudentNameSearchBar'
import type { LessonStudent, Attendance, CompletionStatus } from '@/types/lessonStudent'
import type { LessonItemDetail, CreateLessonAdhocItemBody } from '@/services/lesson'
import AddItemForm from '@/app/(main)/template/_components/AddItemForm/AddItemForm'
import Modal from '@/components/common/Modal'
import ConfirmModal from '@/components/common/ConfirmModal'
import EnrollStudentsModal from '@/components/student/EnrollStudentsModal/EnrollStudentsModal'
import useDisclosure from '@/hooks/useDisclosure'
import { lessonItemRef, matchesLessonItem } from '@/lib/lessonItemRef'
import type { ItemSource } from '@/lib/lessonItemRef'
import { isLessonStudentInputComplete } from '@/lib/lessonProgress'
import { isScoreUnanswered } from '@/lib/lessonScore'
import type { HwRowView } from '@/lib/homeworkPhoto/rowState'
import {
  tableStyle,
  tableWrapStyle,
  tdStyle,
  thCompactStyle,
  tdCompactStyle,
  nameCellStyle,
  nameCellRowStyle,
  removeStudentButtonStyle,
  studentRowStyle,
  nameStickyCellStyle,
  addColumnCellStyle,
  addColumnButtonStyle,
  completeRowTdStyle,
} from './LessonTable.css'
import {
  AttendanceCell,
  CompletionCell,
  HomeworkPhotoBadges,
  SelectCell,
  ScoreEarnedCell,
  TextInputCell,
} from './LessonTableCells'
import { DynamicColumnHeader } from './DynamicColumnHeader'
import { AttendanceColumnHeader } from './AttendanceColumnHeader'
import { reportTutorialAction } from '@/features/tutorial/tutorialEvents'
import { useTutorial } from '@/features/tutorial/TutorialProvider'
import {
  getScoreColumnMax,
  getTdClassName,
  isScoreItem,
  mapFormToAdhocBody,
} from './lessonTableUtils'

/** 사진 숙제 AI 확인(기능 체험을 켰을 때만 넘긴다) */
export type LessonTableHomework = {
  /** 숙제 열(템플릿 항목 id). 없으면 표시를 이름 칸에 둔다. */
  columnItemId: number | null
  rows: Map<number, HwRowView>
  /** 이 수업 대상 제출이 있는 학생의 숙제 칸 버튼(저장 결과를 보고 처리 기록을 남긴다) */
  onCellChange(studentId: number, value: boolean | null): void
  onOpenPanel(studentId: number): void
}

interface LessonTableSectionProps {
  students: LessonStudent[]
  templateItems: LessonItemDetail[]
  extraAttendanceOptions?: Array<{ id: number; label: string }>
  onChange: (students: LessonStudent[]) => void
  onCellBlur?: (studentId: number, source: ItemSource, itemId: number) => void
  onAddItem?: (body: CreateLessonAdhocItemBody) => void | Promise<void>
  onRemoveColumn?: (item: LessonItemDetail) => void
  onTogglePartial?: (item: LessonItemDetail, isPartial: boolean) => void
  onAddStudents?: (studentIds: number[]) => void | Promise<void>
  onRemoveStudent?: (studentId: number) => void | Promise<void>
  onAddAttendanceOption?: (label: string) => void
  onRemoveAttendanceOption?: (optionId: number, label: string) => void
  homework?: LessonTableHomework
}

export default function LessonTable({
  students,
  templateItems,
  extraAttendanceOptions = [],
  onChange,
  onCellBlur,
  onAddItem,
  onRemoveColumn,
  onTogglePartial,
  onAddStudents,
  onRemoveStudent,
  onAddAttendanceOption,
  onRemoveAttendanceOption,
  homework,
}: LessonTableSectionProps) {
  const tour = useTutorial()
  const tableRef = useRef<HTMLTableElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedStudentId, setFocusedStudentId] = useState<number | null>(null)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const addStudentsModal = useDisclosure()
  const [removeTarget, setRemoveTarget] = useState<LessonStudent | null>(null)

  const dynamicItems = useMemo(
    () => templateItems.filter((i) => !i.is_common && i.item_type !== 'ATTENDANCE'),
    [templateItems],
  )

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return students
    return students.filter((s) => s.name.toLowerCase().includes(query))
  }, [students, searchQuery])

  const partialItemRefs = useMemo(() => {
    const refs = new Set<string>()
    for (const item of templateItems) {
      if (item.is_partial) refs.add(lessonItemRef(item))
    }
    return refs
  }, [templateItems])

  const handleRowFocus = (studentId: number) => {
    setFocusedStudentId(studentId)
  }

  const handleTableBlur = (e: React.FocusEvent<HTMLTableElement>) => {
    if (tableRef.current?.contains(e.relatedTarget as Node)) return
    setFocusedStudentId(null)
  }

  const reportIfTutorialRowsReady = (nextStudents: LessonStudent[]) => {
    if (tour.status !== 'in_progress' || tour.step !== 5 || tour.studentId == null) return
    if (!nextStudents.some((row) => row.id === tour.studentId)) return
    const ready = nextStudents.every((row) => {
      if (!row.attendance) return false
      return dynamicItems.every((item) => {
        if (item.is_partial) return true
        const cell = row.items.find((entry) => matchesLessonItem(entry, item))
        if (!cell) return false
        if (item.item_type === 'COMPLETE') return cell.is_completed != null
        if (item.item_type === 'SCORE' || item.item_type === 'NUMBER') return !isScoreUnanswered(cell.value)
        return cell.value.trim() !== ''
      })
    })
    if (ready) reportTutorialAction('lesson-input', { studentId: tour.studentId })
  }

  const updateAttendance = (studentId: number, value: Attendance) => {
    const next = students.map((s) => (s.id === studentId ? { ...s, attendance: value } : s))
    onChange(next)
    reportIfTutorialRowsReady(next)
  }

  const updateItem = (
    studentId: number,
    item: LessonItemDetail,
    value: string,
    is_completed?: boolean | null,
  ) => {
    const next = students.map((s) => {
      if (s.id !== studentId) return s
      const items = s.items.map((row) =>
        matchesLessonItem(row, item)
          ? {
              ...row,
              value,
              is_completed: is_completed === undefined ? row.is_completed : is_completed,
            }
          : row,
      )
      return { ...s, items }
    })
    onChange(next)
    reportIfTutorialRowsReady(next)
  }

  const allAttend =
    filteredStudents.length > 0 && filteredStudents.every((s) => s.attendance === '출석')
  const handleAllAttend = (checked: boolean) => {
    const visibleIds = new Set(filteredStudents.map((s) => s.id))
    const next = students.map((s) =>
      visibleIds.has(s.id) ? { ...s, attendance: checked ? '출석' : null } : s,
    )
    onChange(next)
    reportIfTutorialRowsReady(next)
  }

  return (
    <div>
      <StudentNameSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        totalCount={students.length}
        filteredCount={filteredStudents.length}
        onAddStudent={onAddStudents ? addStudentsModal.open : undefined}
      />

      {filteredStudents.length === 0 ? (
        <div className={emptyStateStyle} role="status">
          <UsersIcon width={24} height={24} className={emptyStateIconStyle} aria-hidden />
          <span>검색 결과가 없어요.</span>
        </div>
      ) : (
        <div className={tableWrapStyle}>
          <table
            ref={tableRef}
            className={tableStyle}
            onBlur={handleTableBlur}
            data-tour="lesson-table"
          >
            <thead>
              <tr>
                <th className={`${thCompactStyle} ${nameStickyCellStyle}`}>학생</th>
                <AttendanceColumnHeader
                  extraOptions={extraAttendanceOptions}
                  allAttend={allAttend}
                  onToggleAllAttend={() => handleAllAttend(!allAttend)}
                  onAddOption={onAddAttendanceOption}
                  onRemoveOption={onRemoveAttendanceOption}
                />
                {dynamicItems.map((item) => (
                    <DynamicColumnHeader
                      key={lessonItemRef(item)}
                      item={item}
                      students={students}
                      onChange={onChange}
                      canRemove={onRemoveColumn != null}
                      onRemoveColumn={onRemoveColumn}
                      onTogglePartial={onTogglePartial}
                    />
                ))}
                {onAddItem ? (
                  <th className={addColumnCellStyle}>
                    <button
                      type="button"
                      className={addColumnButtonStyle}
                      aria-label="개별 항목 추가"
                      onClick={() => setIsAddFormOpen(true)}
                    >
                      +
                    </button>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const isComplete = isLessonStudentInputComplete(
                  student,
                  partialItemRefs,
                  templateItems,
                )
                const hwRow = homework?.rows.get(student.id)
                const openHwPanel = () => homework?.onOpenPanel(student.id)
                return (
                <tr key={student.id} className={studentRowStyle}>
                  <td className={`${getTdClassName(tdCompactStyle, student.id, focusedStudentId, isComplete)} ${nameStickyCellStyle}`}>
                    <div className={nameCellRowStyle}>
                      <Link href={`/students/${student.id}`} className={nameCellStyle}>
                        {student.name}
                      </Link>
                      {onRemoveStudent ? (
                        <button
                          type="button"
                          className={removeStudentButtonStyle}
                          aria-label={`${student.name} 학생을 이 수업에서 빼기`}
                          onClick={() => setRemoveTarget(student)}
                        >
                          <TrashIcon width={20} height={20} />
                        </button>
                      ) : null}
                    </div>
                    {hwRow && homework?.columnItemId == null ? (
                      <HomeworkPhotoBadges row={hwRow} onOpen={openHwPanel} />
                    ) : null}
                  </td>
                  <td
                    className={getTdClassName(tdStyle, student.id, focusedStudentId, isComplete)}
                    onMouseDown={() => handleRowFocus(student.id)}
                    onFocusCapture={() => handleRowFocus(student.id)}
                  >
                    <AttendanceCell
                      value={student.attendance}
                      extraLabels={extraAttendanceOptions.map((opt) => opt.label)}
                      onChange={(v) => updateAttendance(student.id, v)}
                      tourAnchor={
                        tour.step === 5 && tour.studentId === student.id ? 'lesson-attend' : undefined
                      }
                    />
                  </td>
                  {dynamicItems.map((item) => {
                    const studentItem = student.items.find((i) => matchesLessonItem(i, item))
                    const tdClass = getTdClassName(
                      tdStyle,
                      student.id,
                      focusedStudentId,
                      isComplete,
                    )
                    const focusHandlers = {
                      onMouseDown: () => handleRowFocus(student.id),
                      onFocusCapture: () => handleRowFocus(student.id),
                    }
                    const handleCellBlur = () =>
                      onCellBlur?.(student.id, item.source ?? 'template', item.id)
                    if (item.item_type === 'SELECT') {
                      return (
                        <td key={lessonItemRef(item)} className={tdClass} {...focusHandlers}>
                          <SelectCell
                            options={item.options ?? []}
                            value={studentItem?.value ?? ''}
                            onChange={(v) => updateItem(student.id, item, v)}
                          />
                        </td>
                      )
                    }

                    if (item.item_type === 'COMPLETE') {
                      const status: CompletionStatus =
                        studentItem?.is_completed === true
                          ? '완료'
                          : studentItem?.is_completed === false
                            ? '미완료'
                            : null
                      const isHomeworkColumn =
                        homework?.columnItemId != null &&
                        (item.source ?? 'template') === 'template' &&
                        item.id === homework.columnItemId
                      const hwCellRow = isHomeworkColumn ? hwRow : undefined
                      return (
                        <td key={lessonItemRef(item)} className={tdClass} {...focusHandlers}>
                          <CompletionCell
                            value={status}
                            suggestion={
                              hwCellRow?.suggestion == null
                                ? null
                                : hwCellRow.suggestion
                                  ? '완료'
                                  : '미완료'
                            }
                            aiMark={hwCellRow?.aiMark}
                            onChange={(v) => {
                              const next = v === '완료' ? true : v === '미완료' ? false : null
                              // 이 수업 대상 제출이 있으면 저장 결과를 보고 기록을 남긴다.
                              if (homework && hwCellRow?.routeClicks) {
                                homework.onCellChange(student.id, next)
                                return
                              }
                              updateItem(student.id, item, studentItem?.value ?? '', next)
                            }}
                          />
                          {hwCellRow ? (
                            <HomeworkPhotoBadges row={hwCellRow} onOpen={openHwPanel} />
                          ) : null}
                        </td>
                      )
                    }

                    if (isScoreItem(item)) {
                      const colMax = getScoreColumnMax(students, item)
                      return (
                        <td key={lessonItemRef(item)} className={tdClass} {...focusHandlers}>
                          <ScoreEarnedCell
                            value={studentItem?.value ?? ''}
                            columnMax={colMax}
                            onChange={(v) => updateItem(student.id, item, v)}
                            onBlur={handleCellBlur}
                          />
                        </td>
                      )
                    }

                    return (
                      <td key={lessonItemRef(item)} className={tdClass} {...focusHandlers}>
                        <TextInputCell
                          value={studentItem?.value ?? ''}
                          onChange={(v) => updateItem(student.id, item, v)}
                          onBlur={handleCellBlur}
                        />
                      </td>
                    )
                  })}
                  {onAddItem ? (
                    <td
                      className={
                        isComplete ? `${addColumnCellStyle} ${completeRowTdStyle}` : addColumnCellStyle
                      }
                    />
                  ) : null}
                </tr>
              )
              })}
            </tbody>
          </table>
        </div>
      )}

      {onAddItem ? (
        <Modal isOpen={isAddFormOpen} onClose={() => setIsAddFormOpen(false)} size="md">
          <AddItemForm
            onAdd={(label, type, choices) => {
              void Promise.resolve(onAddItem(mapFormToAdhocBody(label, type, choices)))
                .then(() => {
                  setIsAddFormOpen(false)
                })
                .catch(() => {
                  /* addAdhocItem shows error toast */
                })
            }}
            onCancel={() => setIsAddFormOpen(false)}
          />
        </Modal>
      ) : null}

      <ConfirmModal
        isOpen={removeTarget != null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (!removeTarget || !onRemoveStudent) return
          const studentId = removeTarget.id
          setRemoveTarget(null)
          void onRemoveStudent(studentId)
        }}
        title={removeTarget ? `'${removeTarget.name}' 학생을 이 수업에서 뺄까요?` : ''}
        descriptions={['반 소속과 학생 정보는 그대로예요.']}
        confirmLabel="빼기"
        confirmVariant="danger"
      />

      {onAddStudents ? (
        <EnrollStudentsModal
          isOpen={addStudentsModal.isOpen}
          onClose={addStudentsModal.close}
          currentStudentIds={students.map((s) => s.id)}
          onConfirm={(ids) => {
            void onAddStudents(ids)
          }}
        />
      ) : null}
    </div>
  )
}
