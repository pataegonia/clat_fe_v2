'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect, useMemo } from 'react'
import Text from '@/components/common/Text'
import useDisclosure from '@/hooks/useDisclosure'
import { classService, type Class } from '@/services/class'
import Button from '@/components/common/Button'
import PlusIcon from '@/assets/icons/icon-plus.svg'
import UploadIcon from '@/assets/icons/icon-upload.svg'
import AddCard from '@/components/common/AddCard'
import Dropdown from '@/components/common/Dropdown'
import ClassCard from './_components/ClassCard/ClassCard'
import PlusCircleIcon from '@/assets/icons/icon-plus-circle.svg'
import {
  tabStyle,
  tabActiveStyle,
  tabContainerStyle,
  tabGroupStyle,
  tabActionsStyle,
  gridStyle,
} from './management.css'
import ClassFormModal from './_components/ClassFormModal/ClassFormModal'
import StudentTable, {
  renderStudentClasses,
  studentClassesTitle,
} from './_components/StudentTable/StudentTable'
import StudentNameSearchBar, {
  emptyStateIconStyle,
  emptyStateStyle,
} from '@/components/common/StudentNameSearchBar'
import UsersIcon from '@/assets/icons/icon-users.svg'
import AddStudentFormModal from '@/components/student/AddStudentFormModal/AddStudentFormModal'
import BulkUploadModal from './_components/BulkUploadModal/BulkUploadModal'
import AttentionStudents from './_components/AttentionStudents/AttentionStudents'
import ConfirmModal from '@/components/common/ConfirmModal'
import LeaveReasonPicker from '@/components/student/LeaveReasonPicker/LeaveReasonPicker'
import { EMPTY_LEAVE_REASON, type LeaveReasonValue } from '@/types/leaveReason'
import { studentService } from '@/services/student'
import type { Student } from '@/types/student'
import { useToastStore } from '@/stores/toastStore'
import { sortStudentsByNameKo } from '@/lib/sortStudents'
import useToggleArray from '@/hooks/useToggleArray'

const FILTER_OPTIONS = [
  { label: '전체', value: 'all' },
  { label: '진행 중', value: 'active' },
  { label: '종료', value: 'ended' },
]

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function ManagementContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') ?? 'class'
  const [filter, setFilter] = useState('active')

  const [students, setStudents] = useState<Student[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const addToast = useToastStore((s) => s.addToast)
  const formatSchedule = (schedules: { day_of_week: number }[]) =>
    schedules.map((s) => DAY_NAMES[s.day_of_week]).join('·')

  useEffect(() => {
    if (tab !== 'students') return
    setIsLoadingStudents(true)
    studentService
      .getStudents()
      .then((res) => setStudents(sortStudentsByNameKo(res.data)))
      .catch((err) => console.error('학생 목록 조회 실패', err))
      .finally(() => setIsLoadingStudents(false))
  }, [tab])

  const [classes, setClasses] = useState<Class[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)

  useEffect(() => {
    if (tab !== 'class') return
    setIsLoadingClasses(true)
    classService
      .getClasses(filter === 'all' ? undefined : { status: filter as 'active' | 'ended' })
      .then((res) => setClasses(res.data))
      .catch((err) => console.error('반 목록 조회 실패', err))
      .finally(() => setIsLoadingClasses(false))
  }, [tab, filter])

  const addClass = useDisclosure()
  const addStudent = useDisclosure()
  const bulkUpload = useDisclosure()
  const [deleteStudentTarget, setDeleteStudentTarget] = useState<number | null>(null)
  const [bulkDeletePending, setBulkDeletePending] = useState(false)
  const [leaveReason, setLeaveReason] = useState<LeaveReasonValue>(EMPTY_LEAVE_REASON)
  const closeDeleteStudent = () => {
    setDeleteStudentTarget(null)
    setLeaveReason(EMPTY_LEAVE_REASON)
  }
  const closeBulkDelete = () => {
    setBulkDeletePending(false)
    setLeaveReason(EMPTY_LEAVE_REASON)
  }
  const [isStudentSelectionMode, setIsStudentSelectionMode] = useState(false)
  const {
    items: selectedStudentIds,
    toggle: toggleStudentSelect,
    set: setSelectedStudentIds,
  } = useToggleArray<number>()

  const filteredStudents = useMemo(() => {
    const query = studentSearchQuery.trim().toLowerCase()
    if (!query) return students
    return students.filter((s) => s.name.toLowerCase().includes(query))
  }, [students, studentSearchQuery])

  useEffect(() => {
    if (tab === 'students') return
    setIsStudentSelectionMode(false)
    setSelectedStudentIds((prev) => (prev.length === 0 ? prev : []))
  }, [tab, setSelectedStudentIds])

  const exitStudentSelectionMode = () => {
    setIsStudentSelectionMode(false)
    setSelectedStudentIds([])
  }

  const handleDeleteStudent = async () => {
    if (!deleteStudentTarget) return
    try {
      await studentService.deleteStudent(deleteStudentTarget, leaveReason)
      setStudents((prev) => prev.filter((s) => s.id !== deleteStudentTarget))
      setSelectedStudentIds((prev) => prev.filter((id) => id !== deleteStudentTarget))
      addToast({ variant: 'success', message: '학생이 삭제됐어요.' })
    } catch (err) {
      console.error('학생 삭제 실패', err)
      addToast({ variant: 'error', message: '학생 삭제에 실패했어요.' })
    } finally {
      closeDeleteStudent()
    }
  }

  const handleToggleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([])
      return
    }
    setSelectedStudentIds(filteredStudents.map((s) => s.id))
  }

  const handleBulkDeleteStudents = async () => {
    if (selectedStudentIds.length === 0) return
    try {
      const result = await studentService.bulkDeleteStudents(selectedStudentIds, leaveReason)
      const deletedIds = new Set(selectedStudentIds)
      setStudents((prev) => prev.filter((s) => !deletedIds.has(s.id)))
      exitStudentSelectionMode()
      addToast({
        variant: 'success',
        message: `${result.deleted_count}명의 학생이 삭제됐어요.`,
      })
    } catch (err) {
      console.error('학생 선택 삭제 실패', err)
      addToast({ variant: 'error', message: '학생 삭제에 실패했어요.' })
    } finally {
      closeBulkDelete()
    }
  }

  return (
    <>
      <Text variant="display" as="h1">
        학생·반 관리
      </Text>
      <div className={tabContainerStyle}>
        <div className={tabGroupStyle}>
          <button
            className={tab === 'class' ? tabActiveStyle : tabStyle}
            onClick={() => router.push('/management?tab=class')}
            data-tour="class-tab"
          >
            반별 보기
          </button>
          <button
            className={tab === 'students' ? tabActiveStyle : tabStyle}
            onClick={() => router.push('/management?tab=students')}
            data-tour="students-tab"
          >
            전체 학생
          </button>
          <button
            className={tab === 'attention' ? tabActiveStyle : tabStyle}
            onClick={() => router.push('/management?tab=attention')}
          >
            살펴볼 학생
          </button>
        </div>
        {tab === 'students' && (
          <div className={tabActionsStyle}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<UploadIcon width={20} height={20} />}
              onClick={bulkUpload.open}
              data-tour="students-bulk"
            >
              일괄 등록
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusIcon width={20} height={20} />}
              onClick={addStudent.open}
              data-tour="students-register"
            >
              학생 등록
            </Button>
          </div>
        )}
      </div>
      {tab === 'attention' && <AttentionStudents />}
      {tab === 'class' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <Dropdown
              options={FILTER_OPTIONS}
              value={filter}
              onChange={setFilter}
              placeholder="전체"
            />
          </div>
          <div className={gridStyle}>
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                id={cls.id}
                name={cls.name}
                academyName={cls.academy_name}
                schedule={formatSchedule(cls.schedules)}
                studentCount={cls.student_count}
                isEnded={!!cls.ended_at}
              />
            ))}
            <AddCard
              icon={<PlusCircleIcon width={36} height={36} />}
              label="반 추가"
              onClick={addClass.open}
              data-tour="class-add"
            />

            <ClassFormModal
              isOpen={addClass.isOpen}
              onClose={addClass.close}
              onConfirm={async (data) => {
                try {
                  await classService.createClass({
                    academy_name: data.academyName,
                    name: data.name,
                    day_of_week: data.dayOfWeek,
                  })
                  const res = await classService.getClasses(
                    filter === 'all' ? undefined : { status: filter as 'active' | 'ended' }
                  )
                  setClasses(res.data)
                  addClass.close()
                  addToast({
                    variant: 'success',
                    message: '\uBC18\uC774 \uCD94\uAC00\uB418\uC5C8\uC5B4\uC694.',
                  })
                } catch (err) {
                  console.error('반 생성 실패', err)
                  addToast({ variant: 'error', message: '반 생성에 실패했어요.' })
                }
              }}
              mode="add"
            />
          </div>
        </>
      )}
      {tab === 'students' && (
        <>
          <BulkUploadModal
            isOpen={bulkUpload.isOpen}
            onClose={bulkUpload.close}
            onConfirm={async (file) => {
              try {
                const bulkRes = await studentService.bulkCreateStudents(file)
                addToast({
                  variant: 'success',
                  message:
                    bulkRes.fail_count > 0
                      ? `${bulkRes.success_count} ok, ${bulkRes.fail_count} failed`
                      : `${bulkRes.success_count} students added`,
                })
                studentService
                  .getStudents()
                  .then((r) => setStudents(sortStudentsByNameKo(r.data)))
              } catch {
                addToast({ variant: 'error', message: '엑셀 업로드에 실패했어요.' })
              }
            }}
          />
          <AddStudentFormModal
            isOpen={addStudent.isOpen}
            onClose={addStudent.close}
            onConfirm={async (data) => {
              try {
                const newStudent = await studentService.createStudent(data)
                setStudents((prev) => sortStudentsByNameKo([...prev, newStudent]))
                addStudent.close()
                addToast({ variant: 'success', message: '학생이 등록됐어요.' })
              } catch (err) {
                console.error('학생 등록 실패', err)
                addToast({ variant: 'error', message: '학생 등록에 실패했어요.' })
              }
            }}
          />
          <StudentNameSearchBar
            value={studentSearchQuery}
            onChange={setStudentSearchQuery}
            totalCount={students.length}
            filteredCount={filteredStudents.length}
            selectionMode={isStudentSelectionMode}
            selectedCount={selectedStudentIds.length}
            onStartSelection={() => {
              setIsStudentSelectionMode(true)
              setSelectedStudentIds([])
            }}
            onCancelSelection={exitStudentSelectionMode}
            onSelectAll={handleToggleSelectAllStudents}
            onConfirmDelete={() => setBulkDeletePending(true)}
          />
          {filteredStudents.length === 0 ? (
            <div className={emptyStateStyle} role="status">
              <UsersIcon width={24} height={24} className={emptyStateIconStyle} aria-hidden />
              <span>
                {students.length === 0 ? '등록된 학생이 없어요.' : '검색 결과가 없어요.'}
              </span>
            </div>
          ) : (
            <StudentTable
              students={filteredStudents}
              selectionMode={isStudentSelectionMode}
              selectedIds={selectedStudentIds}
              onToggleSelect={toggleStudentSelect}
              middleColumns={[
                {
                  header: '소속 반',
                  render: renderStudentClasses,
                  getTitle: studentClassesTitle,
                },
              ]}
              onDelete={(id) => setDeleteStudentTarget(id)}
              onRowClick={
                isStudentSelectionMode
                  ? undefined
                  : (id) => router.push(`/students/${id}`)
              }
            />
          )}

          <ConfirmModal
            isOpen={!!deleteStudentTarget}
            onClose={closeDeleteStudent}
            onConfirm={handleDeleteStudent}
            title={`'${students.find((s) => s.id === deleteStudentTarget)?.name}' 학생을 삭제할까요?`}
            descriptions={['삭제 후에는 복구할 수 없어요.']}
            confirmLabel="삭제"
            confirmVariant="danger"
          >
            <LeaveReasonPicker value={leaveReason} onChange={setLeaveReason} label="삭제 사유" />
          </ConfirmModal>

          <ConfirmModal
            isOpen={bulkDeletePending}
            onClose={closeBulkDelete}
            onConfirm={handleBulkDeleteStudents}
            title={`선택한 ${selectedStudentIds.length}명의 학생을 삭제할까요?`}
            descriptions={['삭제 후에는 복구할 수 없어요.']}
            confirmLabel="삭제"
            confirmVariant="danger"
          >
            <LeaveReasonPicker value={leaveReason} onChange={setLeaveReason} label="삭제 사유" />
          </ConfirmModal>

        </>
      )}
    </>
  )
}

export default function ManagementPage() {
  return (
    <Suspense>
      <ManagementContent />
    </Suspense>
  )
}
