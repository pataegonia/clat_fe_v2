import type { LessonStudent } from '@/types/lessonStudent'
import type { LessonItemDetail, CreateLessonAdhocItemBody } from '@/services/lesson'
import { cohortScoreMetric, joinScoreStorage, splitScoreStorage } from '@/lib/lessonScore'
import { completeItemNoteDraft } from '@/lib/completeNote'
import { matchesLessonItem } from '@/lib/lessonItemRef'
import { activeRowTdStyle, completeRowTdStyle } from './LessonTable.css'

export function mapFormToAdhocBody(
  label: string,
  type: string,
  choices?: string[],
): CreateLessonAdhocItemBody {
  const itemTypeMap = {
    number: 'SCORE',
    text: 'TEXT',
    choice: 'SELECT',
    completion: 'COMPLETE',
  } as const

  const body: CreateLessonAdhocItemBody = {
    name: label,
    is_common: false,
    item_type: itemTypeMap[type as keyof typeof itemTypeMap] ?? 'TEXT',
  }

  if (type === 'choice' && choices?.length) {
    body.options = choices
  }

  return body
}

export function isScoreItem(item: LessonItemDetail) {
  return item.item_type === 'SCORE' || item.item_type === 'NUMBER'
}

export function getTdClassName(
  base: string,
  studentId: number,
  focusedStudentId: number | null,
  isComplete = false,
) {
  if (focusedStudentId === studentId) return `${base} ${activeRowTdStyle}`
  if (isComplete) return `${base} ${completeRowTdStyle}`
  return base
}

export function getScoreColumnMax(students: LessonStudent[], item: LessonItemDetail): string {
  for (const s of students) {
    const v = s.items.find((i) => matchesLessonItem(i, item))?.value ?? ''
    const { max } = splitScoreStorage(v)
    if (max) return max
  }
  return ''
}

function collectScoreMetrics(students: LessonStudent[], item: LessonItemDetail): number[] {
  const nums: number[] = []
  for (const s of students) {
    const v = s.items.find((i) => matchesLessonItem(i, item))?.value ?? ''
    const metric = cohortScoreMetric(v)
    if (metric != null) nums.push(metric)
  }
  return nums
}

/** 입력된 획득 점수만으로 평균. 문자 발송과 동일하게 소수 첫째 자리. */
export function getScoreColumnAverage(
  students: LessonStudent[],
  item: LessonItemDetail,
): number | null {
  const nums = collectScoreMetrics(students, item)
  if (nums.length === 0) return null
  const sum = nums.reduce((a, b) => a + b, 0)
  return Math.round((sum / nums.length) * 10) / 10
}

export function formatScoreColumnMetric(value: number | null): string {
  if (value == null) return '—'
  return Number.isInteger(value) ? `${value}점` : `${value.toFixed(1)}점`
}

export function applyScoreMaxToAllStudents(
  students: LessonStudent[],
  item: LessonItemDetail,
  maxStr: string,
): LessonStudent[] {
  return students.map((s) => {
    const it = s.items.find((i) => matchesLessonItem(i, item))
    const { earned } = splitScoreStorage(it?.value ?? '')
    return {
      ...s,
      items: s.items.map((i) =>
        matchesLessonItem(i, item) ? { ...i, value: joinScoreStorage(earned, maxStr) } : i,
      ),
    }
  })
}

export function isCompleteItem(item: LessonItemDetail) {
  return item.item_type === 'COMPLETE'
}

export function getCompleteColumnNote(students: LessonStudent[], item: LessonItemDetail): string {
  for (const s of students) {
    const v = s.items.find((i) => matchesLessonItem(i, item))?.value ?? ''
    const note = completeItemNoteDraft(v)
    if (note != null) return note
  }
  return ''
}

export function applyCompleteNoteToAllStudents(
  students: LessonStudent[],
  item: LessonItemDetail,
  note: string,
): LessonStudent[] {
  return students.map((s) => ({
    ...s,
    items: s.items.map((i) => (matchesLessonItem(i, item) ? { ...i, value: note } : i)),
  }))
}
