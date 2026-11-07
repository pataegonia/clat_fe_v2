'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addWeeks, subWeeks, format, addDays, isSameDay } from 'date-fns'
import Text from '@/components/common/Text'
import ConfirmModal from '@/components/common/ConfirmModal'
import DateCard from './_components/DateCard/DateCard'
import LessonCard from './_components/LessonCard/LessonCard'
import AddCard from '@/components/common/AddCard'
import AddLessonModal from './_components/AddLessonModal/AddLessonModal'
import TodayBriefing from './_components/TodayBriefing/TodayBriefing'
import PlusCircleIcon from '@/assets/icons/icon-plus-circle.svg'
import ArrowLeftIcon from '@/assets/icons/icon-chevron-left.svg'
import ArrowRightIcon from '@/assets/icons/icon-chevron-right.svg'
import {
  pageStyle,
  dateGridStyle,
  lessonGridStyle,
  sectionTitleStyle,
  navButtonStyle,
  weekNavStyle,
  weekLabelStyle,
  todayButtonStyle,
} from './lesson.css'
import { useLessonList } from '@/hooks/lesson/useLessonList'
import { formatCompletionRatePercent } from '@/lib/completionRate'
import { useTutorial } from '@/features/tutorial/TutorialProvider'

const DAYS_KO = ['월', '화', '수', '목', '금', '토', '일']
type DateStatus = 'done' | 'inProgress' | 'none'

function parseDateParam(value: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function dateKey(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function LessonPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  const initialDate = parseDateParam(dateParam) ?? new Date()
  const [currentWeek, setCurrentWeek] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false)

  const replaceDateInUrl = useCallback(
    (date: Date) => {
      const key = dateKey(date)
      if (searchParams.get('date') === key) return
      router.replace(`/lesson?date=${key}`, { scroll: false })
    },
    [router, searchParams],
  )

  useEffect(() => {
    const parsed = parseDateParam(dateParam)
    if (parsed) {
      setSelectedDate(parsed)
      setCurrentWeek(parsed)
      return
    }
    const today = new Date()
    setSelectedDate(today)
    setCurrentWeek(today)
    replaceDateInUrl(today)
  }, [dateParam, replaceDateInUrl])

  const selectDate = (date: Date) => {
    setSelectedDate(date)
    setCurrentWeek(date)
    replaceDateInUrl(date)
  }

  const shiftWeek = (delta: -1 | 1) => {
    const nextSelected = delta < 0 ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1)
    setSelectedDate(nextSelected)
    setCurrentWeek(nextSelected)
    replaceDateInUrl(nextSelected)
  }

  const goToday = () => {
    selectDate(new Date())
  }

  const list = useLessonList(selectedDate, currentWeek)
  const tour = useTutorial()
  const isTodaySelected = isSameDay(selectedDate, new Date())

  const getDateStatus = (date: Date): DateStatus => {
    const key = format(date, 'yyyy-MM-dd')
    const dayLessons = list.weekLessons[key] ?? []
    if (dayLessons.length === 0) return 'none'
    if (dayLessons.every((l) => l.progress_rate === 1)) return 'done'
    if (dayLessons.some((l) => l.lesson_record_id !== null)) return 'inProgress'
    return 'none'
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(list.weekStart, i)
    return {
      date: date.getDate(),
      day: DAYS_KO[i],
      fullDate: date,
      status: getDateStatus(date),
    }
  })

  const headerText = `${format(list.weekStart, 'M월 d일')} – ${format(addDays(list.weekStart, 6), 'M월 d일')}`
  const selectedLabel = `${format(selectedDate, 'M월 d일')}(${DAYS_KO[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}) 수업`

  return (
    <div className={pageStyle}>
      <Text variant="display" as="h1">
        수업 입력
      </Text>

      <div className={weekNavStyle}>
        <button
          type="button"
          className={navButtonStyle}
          onClick={() => shiftWeek(-1)}
          aria-label="이전 주"
        >
          <ArrowLeftIcon width={24} height={24} />
        </button>
        <span className={weekLabelStyle}>
          <Text variant="headingMd">{headerText}</Text>
        </span>
        <button
          type="button"
          className={todayButtonStyle}
          onClick={goToday}
          disabled={isTodaySelected}
        >
          오늘
        </button>
        <button
          type="button"
          className={navButtonStyle}
          onClick={() => shiftWeek(1)}
          aria-label="다음 주"
        >
          <ArrowRightIcon width={24} height={24} />
        </button>
      </div>

      <div className={dateGridStyle}>
        {weekDays.map((item) => (
          <DateCard
            key={format(item.fullDate, 'yyyy-MM-dd')}
            day={item.day}
            date={item.date}
            status={item.status}
            isSelected={isSameDay(item.fullDate, selectedDate)}
            dataTour={isSameDay(item.fullDate, new Date()) ? 'lesson-today' : undefined}
            onClick={() => selectDate(item.fullDate)}
          />
        ))}
      </div>

      {isTodaySelected ? <TodayBriefing date={list.selectedDateKey} /> : null}

      <div className={sectionTitleStyle}>
        <Text variant="headingMd">{selectedLabel}</Text>
      </div>
      <div className={lessonGridStyle}>
        {list.lessons.map((lesson) => {
          const recordId = lesson.lesson_record_id ?? lesson.id ?? null
          const cardKey =
            recordId != null
              ? `${lesson.is_adhoc ? 'adhoc' : 'scheduled'}-${recordId}`
              : `pending-${list.selectedDateKey}-${lesson.class_id}`
          return (
            <LessonCard
              key={cardKey}
              academyName={lesson.academy_name}
              templateName={lesson.template_name ?? ''}
              className={lesson.class_name}
              progress={formatCompletionRatePercent(lesson.progress_rate)}
              totalStudents={lesson.total_students}
              inputCount={
                lesson.input_count ?? Math.round(lesson.total_students * lesson.progress_rate)
              }
              isDone={recordId !== null}
              alimtalkSent={lesson.alimtalk_sent ?? false}
              alimtalkDeliveryMode={lesson.alimtalk_delivery_mode ?? null}
              tourAnchor={
                tour.step === 3 && tour.classId === lesson.class_id ? 'lesson-enter' : undefined
              }
              onDelete={recordId != null ? () => list.setDeleteTarget(lesson) : undefined}
              onClick={() => {
                if (recordId) {
                  router.push(`/lesson/${recordId}`)
                } else {
                  router.push(
                    `/lesson/new?class_id=${lesson.class_id}&date=${list.selectedDateKey}&is_adhoc=false`,
                  )
                }
              }}
            />
          )
        })}
        <AddCard
          icon={<PlusCircleIcon width={36} height={36} />}
          label="다른 수업 추가"
          description="오늘 일정에 없는 반의 수업을 입력할 수 있어요"
          onClick={() => setIsAddLessonOpen(true)}
        />
        <AddLessonModal
          isOpen={isAddLessonOpen}
          onClose={() => setIsAddLessonOpen(false)}
          onConfirm={(classId) => {
            router.push(
              `/lesson/new?class_id=${classId}&date=${list.selectedDateKey}&is_adhoc=true`,
            )
          }}
          selectedDate={selectedDate}
        />
      </div>

      <ConfirmModal
        isOpen={list.deleteTarget != null}
        onClose={() => {
          if (!list.isDeleting) list.setDeleteTarget(null)
        }}
        onConfirm={() => void list.handleDeleteConfirm()}
        title="수업 데이터를 삭제할까요?"
        descriptions={
          list.deleteTarget
            ? [
                '입력한 공통·개별 내용과 완료형 미완료 항목이 모두 삭제돼요.',
                list.deleteTarget.is_adhoc
                  ? '이 수업은 목록에서 사라져요.'
                  : '다시 「입력하기」 상태로 돌아가요.',
              ]
            : undefined
        }
        confirmLabel="삭제"
        confirmVariant="danger"
      />
    </div>
  )
}

export default function LessonPage() {
  return (
    <Suspense>
      <LessonPageContent />
    </Suspense>
  )
}
