'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import ArrowLeftIcon from '@/assets/icons/icon-arrow-left.svg'
import SaveIcon from '@/assets/icons/icon-save.svg'
import ChevronDownIcon from '@/assets/icons/icon-chevron-down.svg'
import MessageIcon from '@/assets/icons/icon-message.svg'
import LessonTable from './_components/LessonTableSection/LessonTableSection'
import CommonContent from './_components/CommonContent/CommonContent'
import ProgressBar from './_components/ProgressBar/ProgressBar'
import AlimtalkSendModal from './_components/AlimtalkSendModal/AlimtalkSendModal'
import HomeworkPhotoSummary from './_components/HomeworkPhotoSummary/HomeworkPhotoSummary'
import HomeworkPhotoSidePanel from './_components/HomeworkPhotoSidePanel/HomeworkPhotoSidePanel'
import ConfirmModal from '@/components/common/ConfirmModal'
import TemplateSelectModal from '../_components/TemplateSelectModal/TemplateSelectModal'
import {
  pageStyle,
  headerStyle,
  footerStyle,
  sectionStyle,
  backButtonStyle,
  headerLeftStyle,
  headerTitleStyle,
  headerButtonGroupStyle,
  autoSaveHintStyle,
  templateChipButtonStyle,
  scheduleNoticeStyle,
} from './lessonDetail.css'
import useLessonDetail from '@/hooks/useLessonDetail'
import useDisclosure from '@/hooks/useDisclosure'
import { lessonService } from '@/services/lesson'
import { useToastStore } from '@/stores/toastStore'
import AttendanceStartModal from '@/components/attendance/AttendanceStartModal'
import type { LessonItemDetail } from '@/services/lesson'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useQueryClient } from '@tanstack/react-query'
import { invalidateLessonLists } from '@/lib/queryKeys'
import { useLessonAttendanceOnDetail } from '@/hooks/lesson/useLessonAttendanceOnDetail'
import { useTutorial } from '@/features/tutorial/TutorialProvider'
import { useAttendanceSessionStore } from '@/stores/attendanceSessionStore'
import { HW_LESSON_LABELS } from '@/lib/homeworkPhoto/labels'
import { homeworkCellValue } from '@/lib/homeworkPhoto/rowState'

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const lessonId = Number(id)
  const router = useRouter()
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  const {
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
    isAutoSaving,
    hasUnsavedChanges,
    saveDirtyChanges,
    confirmScheduleEdit,
    scheduleEditOpen,
    acceptScheduleEdit,
    rejectScheduleEdit,
    refetch,
    refetchAfterAttendanceEnd,
    addAdhocItem,
    removeAdhocItem,
    excludeTemplateItem,
    updateLessonItemOrder,
    setItemPartial,
    addStudentsToLesson,
    removeStudentFromLesson,
    addAttendanceOption,
    removeAttendanceOption,
    homework,
  } = useLessonDetail(lessonId)

  const templateModal = useDisclosure()
  const templateConfirmModal = useDisclosure()
  const removeItemConfirmModal = useDisclosure()
  const [pendingTemplateId, setPendingTemplateId] = useState<number | null>(null)
  const [removeTarget, setRemoveTarget] = useState<LessonItemDetail | null>(null)
  /** 사진 숙제 옆 창을 연 학생 */
  const [hwPanelStudentId, setHwPanelStudentId] = useState<number | null>(null)

  const {
    hasAttendanceItem,
    attendanceStartModal,
    handleAttendanceButtonClick,
    attendanceButtonLabel,
    attendanceButtonVariant,
  } = useLessonAttendanceOnDetail({
    lessonId,
    lesson,
    error,
    students,
    refetchAfterAttendanceEnd,
  })

  const tour = useTutorial()
  const reopenSeen = useRef(tour.reopenTick)
  const dismissSeen = useRef(tour.dismissTick)
  useEffect(() => {
    if (tour.reopenTick === reopenSeen.current) return
    reopenSeen.current = tour.reopenTick
    if (tour.status !== 'in_progress' || tour.lessonId !== lessonId) return
    if (tour.step === 4) {
      const active = useAttendanceSessionStore.getState().active
      if (active) useAttendanceSessionStore.getState().bumpAttendanceDetail()
      else attendanceStartModal.open()
    }
    if (tour.step === 6) void openAlimtalkSendModal()
  }, [
    attendanceStartModal,
    lessonId,
    openAlimtalkSendModal,
    tour.lessonId,
    tour.reopenTick,
    tour.status,
    tour.step,
  ])
  useEffect(() => {
    if (tour.dismissTick === dismissSeen.current) return
    dismissSeen.current = tour.dismissTick
    attendanceStartModal.close()
    alimtalkSendModal.close()
  }, [alimtalkSendModal, attendanceStartModal, tour.dismissTick])

  const handleTemplateSelect = (templateId: number) => {
    setPendingTemplateId(templateId)
    templateModal.close()
    templateConfirmModal.open()
  }

  const handleTemplateChange = async (templateId?: number) => {
    const targetId = templateId ?? pendingTemplateId
    if (!lesson || !targetId) return
    templateConfirmModal.close()
    templateModal.close()
    if (!(await confirmScheduleEdit())) {
      setPendingTemplateId(null)
      return
    }
    try {
      await lessonService.updateLesson(lessonId, {
        template_id: targetId,
        status: 'SAVED',
        common_data: [],
        student_data: students.map((s) => ({ student_id: s.id, items: [] })),
      })
      refetch()
      void homework.refresh()
    } catch {
      addToast({ variant: 'error', message: '템플릿 변경에 실패했어요.' })
    } finally {
      setPendingTemplateId(null)
    }
  }

  if (isLoading || !lesson) return null

  const lessonListHref = `/lesson?date=${format(new Date(lesson.lesson_date), 'yyyy-MM-dd')}`

  if (error === 'TEMPLATE_NOT_FOUND') {
    return (
      <div className={pageStyle}>
        <div className={headerStyle}>
          <div className={headerLeftStyle}>
            <button
              onClick={() => {
                invalidateLessonLists(queryClient)
                router.push(lessonListHref)
              }}
              className={backButtonStyle}
            >
              <ArrowLeftIcon width={24} height={24} />
            </button>
            <Text variant="display" as="h1" className={headerTitleStyle}>
              {format(new Date(lesson.lesson_date), 'M월 d일(E)', { locale: ko })}{' '}
              {lesson.class_name}
            </Text>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            minHeight: 'calc(100vh - 300px)',
          }}
        >
          <Text variant="headingMd">템플릿이 삭제됐어요</Text>
          <Text variant="bodyLg" color="gray500">
            다른 템플릿을 선택해주세요
          </Text>
          <Button variant="primary" size="md" onClick={templateModal.open}>
            템플릿 선택
          </Button>
        </div>
        <TemplateSelectModal
          isOpen={templateModal.isOpen}
          onClose={templateModal.close}
          onConfirm={handleTemplateChange}
          title="템플릿 선택"
          confirmLabel="선택"
        />
      </div>
    )
  }

  const commonItems = lesson.items
    .filter((i) => i.is_common && i.item_type === 'TEXT')
    .map((i) => ({
      id: i.id,
      source: i.source ?? 'template',
      label: i.name,
    }))

  const handleRemoveItem = (item: LessonItemDetail) => {
    setRemoveTarget(item)
    removeItemConfirmModal.open()
  }

  const homeworkView = homework.view?.enabled ? homework.view : null
  const hwPanelStudent = students.find((s) => s.id === hwPanelStudentId) ?? null

  const confirmRemoveItem = async () => {
    if (!removeTarget) return
    removeItemConfirmModal.close()
    try {
      if (removeTarget.source === 'adhoc') {
        await removeAdhocItem(removeTarget.id)
      } else {
        await excludeTemplateItem(removeTarget.id)
      }
    } catch {
      addToast({ variant: 'error', message: '항목 제거에 실패했어요.' })
    } finally {
      setRemoveTarget(null)
    }
  }

  return (
    <div className={pageStyle}>
      <div className={headerStyle}>
        <div className={headerLeftStyle}>
          <button
            onClick={() => {
              invalidateLessonLists(queryClient)
              router.push(lessonListHref)
            }}
            className={backButtonStyle}
          >
            <ArrowLeftIcon width={24} height={24} />
          </button>
          <Text variant="display" as="h1" className={headerTitleStyle}>
            {format(new Date(lesson.lesson_date), 'M월 d일(E)', { locale: ko })} {lesson.class_name}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ChevronDownIcon width={20} height={20} />}
            onClick={templateModal.open}
            className={templateChipButtonStyle}
          >
            {lesson.template_name}
          </Button>
        </div>
        <div className={headerButtonGroupStyle}>
          {hasAttendanceItem && (
            <Button
              variant={attendanceButtonVariant}
              size="sm"
              onClick={handleAttendanceButtonClick}
              data-tour="attendance-open"
            >
              {attendanceButtonLabel}
            </Button>
          )}
          {(isAutoSaving || hasUnsavedChanges) && (
            <span className={autoSaveHintStyle}>
              {isAutoSaving ? '저장 중…' : '저장 대기'}
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<SaveIcon width={20} height={20} />}
            onClick={() => void saveDirtyChanges()}
          >
            저장
          </Button>
        </div>
      </div>

      {lesson.send_schedule_cancel_notice && (
        <div className={scheduleNoticeStyle} role="status">
          <Text variant="bodyMd">
            내용이 바뀌어 예약 발송을 취소했어요. 다시 예약해 주세요.
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void lessonService.dismissSendScheduleNotice(lessonId).then((saved) => {
                setLesson((prev) =>
                  prev
                    ? {
                        ...prev,
                        send_schedule_cancel_notice: false,
                        updated_at: saved.updated_at,
                      }
                    : prev,
                )
              }).catch(() => {
                addToast({ variant: 'error', message: '안내를 닫지 못했어요.' })
              })
            }}
          >
            닫기
          </Button>
        </div>
      )}

      <div className={sectionStyle}>
        <Text variant="headingMd">공통 내용</Text>
        <CommonContent
          lessonId={lessonId}
          items={commonItems}
          values={commonValues}
          onChange={updateCommonValue}
          onAddCommon={(name) => addAdhocItem({ name, is_common: true })}
          onRemoveItem={(item) =>
            handleRemoveItem({
              id: item.id,
              source: item.source,
              name: item.label,
              item_type: 'TEXT',
              is_common: true,
              include_in_message: false,
              sort_order: 0,
            })
          }
        />
      </div>

      <div className={sectionStyle}>
        <Text variant="headingMd">개별 내용</Text>
        {homeworkView ? (
          <HomeworkPhotoSummary
            summary={homework.summary}
            showApply={homework.columnItemId !== null}
            applyDisabled={homework.suggestionCount === 0 || homework.applying}
            onApply={() => void homework.applySuggestions()}
          />
        ) : null}
        <LessonTable
          students={students}
          templateItems={lesson.items}
          extraAttendanceOptions={lesson.attendance_extra_options ?? []}
          onChange={updateStudents}
          onCellBlur={flushPendingStudentCellSave}
          onAddItem={addAdhocItem}
          onRemoveColumn={handleRemoveItem}
          onTogglePartial={(item, isPartial) => void setItemPartial(item, isPartial)}
          onAddStudents={addStudentsToLesson}
          onRemoveStudent={removeStudentFromLesson}
          onAddAttendanceOption={(label) => void addAttendanceOption(label)}
          onRemoveAttendanceOption={(optionId, label) =>
            void removeAttendanceOption(optionId, label)
          }
          homework={
            homeworkView
              ? {
                  columnItemId: homework.columnItemId,
                  rows: homework.rows,
                  onCellChange: (studentId, value) => void homework.onCellChange(studentId, value),
                  onOpenPanel: setHwPanelStudentId,
                }
              : undefined
          }
        />
      </div>

      <div className={footerStyle}>
        <ProgressBar current={inputCount} total={students.length} />
        <Button
          variant="primary"
          size="sm"
          leftIcon={<MessageIcon width={20} height={20} />}
          onClick={() => void openAlimtalkSendModal()}
          data-tour="alimtalk-open"
        >
          알림톡 전송하기
        </Button>
      </div>

      <TemplateSelectModal
        isOpen={templateModal.isOpen}
        onClose={templateModal.close}
        onConfirm={handleTemplateSelect}
        currentTemplateId={lesson.template_id}
        title="템플릿 변경"
        confirmLabel="확인"
      />

      <ConfirmModal
        isOpen={scheduleEditOpen}
        onClose={rejectScheduleEdit}
        onConfirm={acceptScheduleEdit}
        title="수정하면 예약이 취소돼요"
        descriptions={[
          '수업 내용을 바꾸면 예약 발송이 취소됩니다.',
          '다시 예약할 수 있어요.',
        ]}
        confirmLabel="수정하기"
        cancelLabel="취소"
        confirmVariant="danger"
      />

      <ConfirmModal
        isOpen={homework.sendPrompt !== null}
        onClose={() => homework.answerSendPrompt(false)}
        onConfirm={() => homework.answerSendPrompt(true)}
        title={HW_LESSON_LABELS.sendPrompt(homework.sendPrompt?.count ?? 0)}
        confirmLabel="적용"
        cancelLabel="적용 안 함"
      />

      <HomeworkPhotoSidePanel
        key={hwPanelStudentId ?? 'closed'}
        studentId={hwPanelStudentId}
        studentName={hwPanelStudent?.name ?? ''}
        cellValue={hwPanelStudent ? homeworkCellValue(hwPanelStudent, homework.columnItemId) : null}
        homework={homework}
        onClose={() => setHwPanelStudentId(null)}
        onOpenTarget={(targetLessonId) => {
          setHwPanelStudentId(null)
          router.push(`/lesson/${targetLessonId}`)
        }}
      />

      <ConfirmModal
        isOpen={templateConfirmModal.isOpen}
        onClose={() => {
          templateConfirmModal.close()
          setPendingTemplateId(null)
        }}
        onConfirm={() => handleTemplateChange()}
        title="템플릿을 변경할까요?"
        descriptions={['템플릿을 변경하면 입력한 내용이 모두 사라져요.']}
        confirmLabel="변경"
        confirmVariant="danger"
      />

      <AlimtalkSendModal
        isOpen={alimtalkSendModal.isOpen}
        onClose={alimtalkSendModal.close}
        lessonId={lessonId}
        lesson={lesson}
        commonValues={commonValues}
        students={students}
        sendSchedule={lesson.send_schedule ?? null}
        onSendScheduleChange={(patch) => {
          setLesson((prev) => (prev ? { ...prev, ...patch } : prev))
        }}
        onSaveMessageOrder={updateLessonItemOrder}
      />

      <AttendanceStartModal
        isOpen={attendanceStartModal.isOpen}
        onClose={attendanceStartModal.close}
        lessonRecordId={lessonId}
        className={lesson.class_name}
        studentCount={students.length}
        students={students.map((s) => ({ id: s.id, name: s.name }))}
      />

      <ConfirmModal
        isOpen={removeItemConfirmModal.isOpen}
        onClose={() => {
          removeItemConfirmModal.close()
          setRemoveTarget(null)
        }}
        onConfirm={() => void confirmRemoveItem()}
        title="이 수업에서 항목을 제거할까요?"
        descriptions={[
          removeTarget?.source === 'adhoc'
            ? '추가한 항목과 입력값이 삭제돼요.'
            : '템플릿은 그대로이고, 이 수업 화면에서만 숨겨져요.',
        ]}
        confirmLabel="제거"
        confirmVariant="danger"
      />
    </div>
  )
}
