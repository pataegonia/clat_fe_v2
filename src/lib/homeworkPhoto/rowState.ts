import type {
  HwHiddenBy,
  HwLessonView,
  HwResolution,
  HwRowCategory,
  HwSubmissionView,
  HwSummary,
  HwVerdict,
} from '@/types/homeworkPhoto'
import type { LessonItemDetail } from '@/services/lesson'
import type { LessonStudent } from '@/types/lessonStudent'
import type { StudentCellChange } from '@/hooks/lesson/useLessonDirtySave'

/**
 * 수업 표의 사진 숙제 상태(기획 §9·§10). 백엔드 rules/lesson-view.ts와 같은 표(§3.9)를 쓰되,
 * 칸 값은 저장 전 값까지 든 표 상태(students)로 본다.
 * 서버 summary는 저장된 값으로 센 것이라 쓰지 않는다.
 */

export type OwnState = 'CHECKING' | 'SUGGESTION' | 'REVIEW' | 'APPLIED' | 'TEACHER' | 'ENDED'
export type ExtraReason = 'NO_HOMEWORK_ITEM' | 'TEACHER_VALUE_DIFFERS' | null

type CheckStatus =
  | 'PENDING'
  | 'DONE'
  | 'FAILED'
  | 'FLAGGED'
  | 'SKIPPED_LIMIT'
  | 'SKIPPED_NO_CONSENT'
  | 'SKIPPED_OFF'
  | 'SKIPPED_PHOTO'

export type OwnFacts = {
  latestCheckStatus: CheckStatus | null
  hiddenBy: HwHiddenBy | null
  resolution: HwResolution | null
  resolvedLessonRecordId: number | null
  resolvedValue: boolean | null
  verdict: HwVerdict | null
  /** 같은 대상에 먼저 냈다가 새 제출에 밀린 제출이 이 수업에 적용한 값(earlier_applied_value) */
  earlierAppliedValue: boolean | null
}

export type HwRowView = {
  category: HwRowCategory
  ownSubmissionId: string | null
  ownState: OwnState | null
  extraReason: ExtraReason
  /** 연하게 그릴 값. category가 SUGGEST_*일 때만 있다. */
  suggestion: boolean | null
  /** 이 수업 대상 제출의 사진 수 */
  photoCount: number
  completeness: { answered: number; total: number } | null
  /** (이 수업 대상 제출이 확인 필요면 1) + 넘어온 확인 필요 수 */
  reviewCount: number
  /** 확인 필요(이 수업 대상 제출과 넘어온 것) 가운데 가장 늦게 낸 것 */
  latestReviewId: string | null
  /** 적용한 AI 제안 그대로인 칸(category APPLIED) */
  aiMark: boolean
  /** 이 수업 대상 제출이 있으면 숙제 칸 버튼이 saveStudentCellsNow로 저장한다. */
  routeClicks: boolean
}

export type HwSuggestionChange = { change: StudentCellChange; submissionId: string }

/** 판정 COMPLETE → 완료(true), INCOMPLETE → 미완료(false), 그 밖에는 제안 없음 */
export function suggestionValue(facts: Pick<OwnFacts, 'verdict'>): boolean | null {
  if (facts.verdict === 'COMPLETE') return true
  if (facts.verdict === 'INCOMPLETE') return false
  return null
}

function isAppliedOrChecked(resolution: HwResolution | null): boolean {
  return resolution === 'APPLIED' || resolution === 'CHECKED'
}

function isEndedResolution(resolution: HwResolution | null): boolean {
  return resolution === 'ACKNOWLEDGED' || resolution === 'RETURNED' || resolution === 'HIDDEN'
}

/** 이 수업 대상 제출의 상태. 표의 줄을 위에서부터 보고 먼저 맞는 것이다(§3.9 ownState). */
export function ownState(
  facts: OwnFacts,
  cell: boolean | null,
  hasColumn: boolean,
  lessonId: number
): { state: OwnState; extra: ExtraReason } {
  if (facts.latestCheckStatus === 'PENDING') return { state: 'CHECKING', extra: null }
  if (facts.hiddenBy === 'TEACHER' || isEndedResolution(facts.resolution)) {
    return { state: 'ENDED', extra: null }
  }
  if (facts.hiddenBy === 'MODERATION') return { state: 'REVIEW', extra: null }
  const suggestion = suggestionValue(facts)
  if (isAppliedOrChecked(facts.resolution) && facts.resolvedLessonRecordId === lessonId) {
    if (cell === null) {
      if (hasColumn && suggestion !== null) return { state: 'SUGGESTION', extra: null }
      return { state: 'REVIEW', extra: hasColumn ? null : 'NO_HOMEWORK_ITEM' }
    }
    if (facts.resolution === 'APPLIED' && cell === facts.resolvedValue) {
      return { state: 'APPLIED', extra: null }
    }
    return { state: 'TEACHER', extra: null }
  }
  if (!hasColumn) return { state: 'REVIEW', extra: 'NO_HOMEWORK_ITEM' }
  if (suggestion === null) return { state: 'REVIEW', extra: null }
  if (cell === null) return { state: 'SUGGESTION', extra: null }
  if (cell === suggestion) {
    // 먼저 낸 제출로 적용한 칸에 같은 판정으로 다시 내면 사진만 붙고 "AI" 표시는 남는다(§3).
    return { state: facts.earlierAppliedValue === cell ? 'APPLIED' : 'TEACHER', extra: null }
  }
  return { state: 'REVIEW', extra: 'TEACHER_VALUE_DIFFERS' }
}

/**
 * 표 위 숫자에서 이 학생이 들어갈 곳(§10 표 위 숫자, 먼저 맞는 것).
 * suggestion은 이 수업 대상 제출의 제안 값이다(own이 SUGGESTION일 때 완료·미완료를 가른다).
 */
export function rowCategory(
  own: OwnState | null,
  carriedCount: number,
  suggestion: boolean | null
): HwRowCategory {
  if (carriedCount > 0 || own === 'REVIEW') return 'REVIEW'
  if (own === 'CHECKING') return 'CHECKING'
  if (own === null) return 'NO_PHOTO'
  if (own === 'SUGGESTION') return suggestion === false ? 'SUGGEST_INCOMPLETE' : 'SUGGEST_COMPLETE'
  if (own === 'APPLIED') return 'APPLIED'
  return 'TEACHER'
}

/** 숙제 열: 서버가 정한 숙제 항목이 이 수업 표에 템플릿 완료형 개별 칸으로 있을 때만 그 id */
export function homeworkColumnId(view: HwLessonView, items: LessonItemDetail[]): number | null {
  const itemId = view.homework_item_id
  if (!view.has_column || itemId === null) return null
  const present = items.some(
    (item) =>
      (item.source ?? 'template') === 'template' &&
      item.id === itemId &&
      !item.is_common &&
      item.item_type === 'COMPLETE'
  )
  return present ? itemId : null
}

/** 그 학생의 숙제 칸 값(저장 전 값 포함). 숙제 열이 없으면 null */
export function homeworkCellValue(
  student: LessonStudent,
  columnItemId: number | null
): boolean | null {
  if (columnItemId === null) return null
  const cell = student.items.find(
    (item) => item.source === 'template' && item.item_id === columnItemId
  )
  return cell?.is_completed ?? null
}

/** 화면 응답의 제출 한 건 → ownState에 넣을 사실. 확인 상태는 PENDING인지만 본다(§8.3). */
export function ownFacts(sub: HwSubmissionView): OwnFacts {
  return {
    latestCheckStatus: sub.checking ? 'PENDING' : null,
    hiddenBy: sub.hidden,
    resolution: sub.resolution,
    resolvedLessonRecordId: sub.resolved_lesson_record_id,
    resolvedValue: sub.resolved_value,
    verdict: sub.verdict,
    earlierAppliedValue: sub.earlier_applied_value,
  }
}

function isSuggestCategory(category: HwRowCategory): boolean {
  return category === 'SUGGEST_COMPLETE' || category === 'SUGGEST_INCOMPLETE'
}

function newestId(submissions: HwSubmissionView[]): string | null {
  let newest: HwSubmissionView | null = null
  for (const sub of submissions) {
    if (!newest || Date.parse(sub.submitted_at) > Date.parse(newest.submitted_at)) newest = sub
  }
  return newest?.id ?? null
}

/**
 * 학생마다 표에 그릴 상태. 명단(students)에 있고, 이 수업 대상 제출이나 넘어온 확인 필요가 있는
 * 학생만 담는다. columnItemId는 homeworkColumnId로 구한 숙제 열이다(null이면 숙제 칸이 없다).
 */
export function deriveRows(
  view: HwLessonView,
  students: LessonStudent[],
  lessonId: number,
  columnItemId: number | null
): Map<number, HwRowView> {
  const rows = new Map<number, HwRowView>()
  if (!view.enabled) return rows
  const submissions = new Map(view.submissions.map((sub) => [sub.id, sub]))
  const studentsById = new Map(students.map((student) => [student.id, student]))
  const hasColumn = columnItemId !== null

  for (const entry of view.students) {
    const student = studentsById.get(entry.student_id)
    if (!student) continue
    const own = entry.own_submission_id ? (submissions.get(entry.own_submission_id) ?? null) : null
    const carried = entry.carried_submission_ids
      .map((id) => submissions.get(id))
      .filter((sub): sub is HwSubmissionView => sub !== undefined)
    if (!own && carried.length === 0) continue

    const facts = own ? ownFacts(own) : null
    const result = facts
      ? ownState(facts, homeworkCellValue(student, columnItemId), hasColumn, lessonId)
      : null
    const state = result?.state ?? null
    const suggestion = facts ? suggestionValue(facts) : null
    const category = rowCategory(state, carried.length, suggestion)
    const ownReview = own && state === 'REVIEW' ? [own] : []

    rows.set(student.id, {
      category,
      ownSubmissionId: own?.id ?? null,
      ownState: state,
      extraReason: result?.extra ?? null,
      suggestion: isSuggestCategory(category) ? suggestion : null,
      photoCount: own?.photo_count ?? 0,
      completeness: own?.completeness ?? null,
      reviewCount: ownReview.length + carried.length,
      latestReviewId: newestId([...ownReview, ...carried]),
      aiMark: category === 'APPLIED',
      routeClicks: own !== null,
    })
  }
  return rows
}

const SUMMARY_KEYS: Record<HwRowCategory, keyof HwSummary> = {
  REVIEW: 'review',
  CHECKING: 'checking',
  NO_PHOTO: 'no_photo',
  SUGGEST_COMPLETE: 'complete',
  SUGGEST_INCOMPLETE: 'incomplete',
  APPLIED: 'applied',
  TEACHER: 'teacher',
}

/** 표 위 숫자. 명단(students)의 학생마다 하나로 세고, 상태가 없는 학생은 사진 없음이다. */
export function summarize(rows: Map<number, HwRowView>, students: LessonStudent[]): HwSummary {
  const summary: HwSummary = {
    complete: 0,
    incomplete: 0,
    applied: 0,
    teacher: 0,
    review: 0,
    checking: 0,
    no_photo: 0,
  }
  for (const student of students) {
    summary[SUMMARY_KEYS[rows.get(student.id)?.category ?? 'NO_PHOTO']] += 1
  }
  return summary
}

/** AI 제안 적용으로 바꿀 칸: 제안이 보이는 학생의 숙제 칸을, 저장 직전에도 비어 있을 때만 */
export function suggestionChanges(
  rows: Map<number, HwRowView>,
  columnItemId: number
): HwSuggestionChange[] {
  const changes: HwSuggestionChange[] = []
  for (const [studentId, row] of rows) {
    if (!isSuggestCategory(row.category)) continue
    if (row.suggestion === null || row.ownSubmissionId === null) continue
    changes.push({
      change: {
        studentId,
        source: 'template',
        itemId: columnItemId,
        isCompleted: row.suggestion,
        onlyIfBlank: true,
      },
      submissionId: row.ownSubmissionId,
    })
  }
  return changes
}
