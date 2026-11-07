'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import useDisclosure from '@/hooks/useDisclosure'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import ClassInfoTable from './_components/ClassInfoTable/ClassInfoTable'
import StudentTable from '../_components/StudentTable/StudentTable'
import DangerSection from './_components/DangerSection/DangerSection'
import { sectionWrapperStyle } from './_components/DangerSection/DangerSection.css'
import ArrowLeftIcon from '@/assets/icons/icon-arrow-left.svg'
import EditIcon from '@/assets/icons/icon-edit.svg'
import PlusIcon from '@/assets/icons/icon-plus.svg'
import EnrollStudentsModal from '@/components/student/EnrollStudentsModal/EnrollStudentsModal'
import ConfirmModal from '@/components/common/ConfirmModal'
import LeaveReasonPicker from '@/components/student/LeaveReasonPicker/LeaveReasonPicker'
import { EMPTY_LEAVE_REASON, type LeaveReasonValue } from '@/types/leaveReason'
import ClassFormModal from '../_components/ClassFormModal/ClassFormModal'
import { classService, type ClassDetail } from '@/services/class'
import { useToastStore } from '@/stores/toastStore'
import type { Student } from '@/types/student'
import { sortStudentsByNameKo } from '@/lib/sortStudents'
import { backButtonStyle } from '../management.css'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const formatSchedule = (schedules: { day_of_week: number }[]) =>
  schedules.map((s) => DAY_NAMES[s.day_of_week]).join('·')

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const classId = Number(id)
  const router = useRouter()
  const addToast = useToastStore((s) => s.addToast)
  const addStudent = useDisclosure()
  const endClass = useDisclosure()
  const deleteClass = useDisclosure()
  const editClass = useDisclosure()

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteStudentTarget, setDeleteStudentTarget] = useState<number | null>(null)
  const [leaveReason, setLeaveReason] = useState<LeaveReasonValue>(EMPTY_LEAVE_REASON)
  const closeRemoveStudent = () => {
    setDeleteStudentTarget(null)
    setLeaveReason(EMPTY_LEAVE_REASON)
  }
  useEffect(() => {
    classService
      .getClass(classId)
      .then((data) => {
        setClassDetail(data)
        setStudents(sortStudentsByNameKo(data.students))
      })
      .catch(() => {
        addToast({ variant: 'error', message: '반 정보를 불러오지 못했어요.' })
        router.push('/management')
      })
      .finally(() => setIsLoading(false))
  }, [classId])

  const handleDeleteStudent = async () => {
    if (!deleteStudentTarget) return
    try {
      await classService.removeStudent(classId, deleteStudentTarget, leaveReason)
      setStudents((prev) => prev.filter((s) => s.id !== deleteStudentTarget))
      addToast({ variant: 'success', message: '학생이 제거됐어요.' })
    } catch {
      addToast({ variant: 'error', message: '학생 제거에 실패했어요.' })
    } finally {
      closeRemoveStudent()
    }
  }

  const handleEndClass = async () => {
    try {
      await classService.endClass(classId)
      addToast({ variant: 'success', message: '반이 종료됐어요.' })
      endClass.close()
      router.push('/management')
    } catch {
      addToast({ variant: 'error', message: '반 종료에 실패했어요.' })
    }
  }

  const handleDeleteClass = async () => {
    try {
      await classService.deleteClass(classId)
      addToast({ variant: 'success', message: '반이 삭제됐어요.' })
      deleteClass.close()
      router.push('/management')
    } catch {
      addToast({ variant: 'error', message: '반 삭제에 실패했어요.' })
    }
  }

  if (isLoading || !classDetail) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} className={backButtonStyle}>
          <ArrowLeftIcon width={24} height={24} />
        </button>
        <Text variant="display" as="h1">
          {classDetail.name}
        </Text>
      </div>

      {/* 반 정보 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Text variant="headingMd">반 정보</Text>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<EditIcon width={14} height={14} />}
            style={{ height: '28px' }}
            onClick={editClass.open}
          >
            수정
          </Button>
          <ClassFormModal
            isOpen={editClass.isOpen}
            onClose={editClass.close}
            onConfirm={async (data) => {
              try {
                const updated = await classService.updateClass(classId, {
                  academy_name: data.academyName,
                  name: data.name,
                  day_of_week: data.dayOfWeek,
                })
                setClassDetail((prev) => (prev ? { ...prev, ...updated } : prev))
                editClass.close()
                addToast({ variant: 'success', message: '반 정보가 수정됐어요.' })
              } catch {
                addToast({ variant: 'error', message: '반 정보 수정에 실패했어요.' })
              }
            }}
            mode="edit"
            defaultValues={{
              academyName: classDetail.academy_name,
              name: classDetail.name,
              dayOfWeek: classDetail.schedules.map((s) => s.day_of_week),
            }}
          />
        </div>
        <ClassInfoTable
          academyName={classDetail.academy_name}
          schedule={formatSchedule(classDetail.schedules)}
          status={classDetail.status}
          templates={classDetail.templates ?? []}
        />
      </section>

      {/* 학생 명단 */}
      <section>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <Text variant="headingMd">학생 명단</Text>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon width={20} height={20} />}
            onClick={addStudent.open}
          >
            학생 등록
          </Button>
          <EnrollStudentsModal
            isOpen={addStudent.isOpen}
            onClose={addStudent.close}
            currentStudentIds={students.map((s) => s.id)}
            onConfirm={async (ids) => {
              try {
                await classService.addStudents(classId, ids)
                const updated = await classService.getClass(classId)
                setStudents(sortStudentsByNameKo(updated.students))
                addStudent.close()
                addToast({ variant: 'success', message: '학생이 추가됐어요.' })
              } catch {
                addToast({ variant: 'error', message: '학생 추가에 실패했어요.' })
              }
            }}
          />
        </div>
        <StudentTable
          students={students}
          middleColumns={[]}
          onDelete={(id) => setDeleteStudentTarget(id)}
          onRowClick={(id) => router.push(`/students/${id}`)}
        />
      </section>

      <div className={sectionWrapperStyle}>
        <DangerSection
          variant="end"
          title="반 종료"
          description="학기가 끝났거나 더 이상 수업이 없다면 반을 종료할 수 있어요."
          buttonLabel="반 종료하기"
          onConfirm={endClass.open}
        />
        <DangerSection
          variant="delete"
          title="반 삭제"
          description="반을 삭제하면 학생 배정이 해제되지만, 수업 기록은 그대로 남아요."
          buttonLabel="반 삭제하기"
          onConfirm={deleteClass.open}
        />

        <ConfirmModal
          isOpen={!!deleteStudentTarget}
          onClose={closeRemoveStudent}
          onConfirm={handleDeleteStudent}
          title={`'${students.find((s) => s.id === deleteStudentTarget)?.name}' 학생을 ${classDetail.name}에서 제거할까요?`}
          descriptions={['반에서 제거되지만 학생 정보는 그대로 남아요.']}
          confirmLabel="제거"
          confirmVariant="danger"
        >
          <LeaveReasonPicker value={leaveReason} onChange={setLeaveReason} label="반에서 빼는 사유" />
        </ConfirmModal>

        <ConfirmModal
          isOpen={endClass.isOpen}
          onClose={endClass.close}
          onConfirm={handleEndClass}
          title={`'${classDetail.name}'을 종료할까요?`}
          descriptions={['종료 후에는 수업 입력이 불가능해요.']}
          confirmLabel="종료"
          confirmVariant="primary"
        />

        <ConfirmModal
          isOpen={deleteClass.isOpen}
          onClose={deleteClass.close}
          onConfirm={handleDeleteClass}
          title={`'${classDetail.name}'을 삭제할까요?`}
          descriptions={['학생 배정이 해제되지만, 수업 기록은 그대로 남아요.']}
          confirmLabel="삭제"
          confirmVariant="danger"
        />
      </div>

    </div>
  )
}
