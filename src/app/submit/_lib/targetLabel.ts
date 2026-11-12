import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { HW_STUDENT_LABELS } from '@/lib/homeworkPhoto/labels'
import type { HwPublicClass, HwPublicMe, HwTargetKind } from '@/types/homeworkPhoto'

/** 'YYYY-MM-DD'(한국 날짜)를 날짜로. 읽을 수 없으면 null */
function parseDay(date: string): Date | null {
  const parsed = parseISO(date)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function withRange(label: string, rangeText: string | null): string {
  return rangeText ? `${label} · ${rangeText}` : label
}

/** 낼 숙제: '수요일 수업 숙제 · p.42~43' */
export function targetLabel(date: string, rangeText: string | null): string {
  const day = parseDay(date)
  const weekday = day ? format(day, 'EEEE', { locale: ko }) : date
  return withRange(`${weekday} 수업 숙제`, rangeText)
}

/** 지난 수업 숙제: '11월 4일 수업 숙제 · p.40' */
export function dayLabel(date: string, rangeText: string | null = null): string {
  const day = parseDay(date)
  return withRange(`${day ? format(day, 'M월 d일') : date} 수업 숙제`, rangeText)
}

/** 학생이 고르는 낼 숙제 하나 */
export type SubmitTarget = {
  /** 고른 숙제를 /me를 다시 읽은 뒤에도 찾는 키(반·종류·늦게 낼 칸) */
  key: string
  classId: number
  kind: HwTargetKind
  /** 늦게 낼 지난 숙제 칸(LessonStudentData id). 아니면 null */
  lateId: number | null
  /** '오늘 수업'·'다음 수업'. 고를 것이 하나뿐이면 null */
  title: string | null
  label: string
}

function option(
  cls: HwPublicClass,
  kind: HwTargetKind,
  title: string | null,
  label: string,
  lateId: number | null = null
): SubmitTarget {
  const key = lateId === null ? `${cls.class_id}:${kind}` : `${cls.class_id}:${kind}:${lateId}`
  return { key, classId: cls.class_id, kind, lateId, title, label }
}

/** 수업이 있는 날에는 오늘 수업·다음 수업 둘, 아니면 다음 수업 하나 */
function mainTargets(cls: HwPublicClass): SubmitTarget[] {
  const { today, next } = cls
  const nextLabel = next ? targetLabel(next.date, next.range_text) : null
  if (!today) return nextLabel ? [option(cls, 'NEXT', null, nextLabel)] : []
  const todayLabel = targetLabel(today.date, today.range_text)
  const todayOption = option(cls, 'TODAY', HW_STUDENT_LABELS.today, todayLabel)
  if (!nextLabel) return [todayOption]
  return [todayOption, option(cls, 'NEXT', HW_STUDENT_LABELS.next, nextLabel)]
}

/** 한 반의 낼 숙제(main)와 늦게 낼 수 있는 지난 숙제(late) */
export function classTargets(cls: HwPublicClass): { main: SubmitTarget[]; late: SubmitTarget[] } {
  const late = cls.late.map((item) =>
    option(cls, 'LATE', null, dayLabel(item.date, item.range_text), item.lesson_student_data_id)
  )
  return { main: mainTargets(cls), late }
}

/** 고른 숙제를 지금 /me에서 다시 찾는다. 없어졌으면 null */
export function findTarget(me: HwPublicMe, key: string | null): SubmitTarget | null {
  if (key === null) return null
  for (const cls of me.classes) {
    const { main, late } = classTargets(cls)
    const found = [...main, ...late].find((target) => target.key === key)
    if (found) return found
  }
  return null
}
