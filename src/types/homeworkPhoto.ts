/** 사진 숙제 AI 확인 API 타입. 백엔드 src/homework-photo/homework-photo.types.ts와 같은 내용이다(바꾸면 둘 다 바꾼다). */

export type HwTargetKind = 'NEXT' | 'TODAY' | 'LATE'
export type HwVerdict = 'COMPLETE' | 'INCOMPLETE' | 'RETAKE' | 'REVIEW'
export type HwResolution = 'APPLIED' | 'CHECKED' | 'ACKNOWLEDGED' | 'RETURNED' | 'HIDDEN'
export type HwHiddenBy = 'TEACHER' | 'MODERATION'
export type HwConsentScope = 'UPLOAD' | 'AI'
export type HwConsenter = 'GUARDIAN' | 'STUDENT'
export type HwConsentMethod = 'WRITTEN'

/** photo = 1-based photo index in the submission, n = problem number read on that photo */
export type HwProblemRef = { photo: number; n: number }
export type HwRetakeItem =
  | { code: 'BLURRY' | 'DARK' | 'CROPPED' | 'NOT_HOMEWORK'; photo: number }
  | { code: 'WRONG_PAGE' | 'MISSING_PAGE'; pages: number[] }
/** Stored on the submission (review_reasons). */
export type HwStoredReason =
  | { code: 'AI_NO_CONSENT' | 'AI_LIMIT' | 'AI_FAILED' | 'AI_OFF' | 'FLAGGED' | 'NO_PAGE_NUMBER' | 'LATE' | 'DUPLICATE_PHOTO' | 'NO_PROBLEMS' }
  | { code: 'RETAKE'; items: HwRetakeItem[] }
  | { code: 'PAGE_OVERLAP'; pages: number[] }
  | { code: 'AMBIGUOUS'; problems: HwProblemRef[] }
  | { code: 'PARTIAL'; answered: number; total: number; blank: HwProblemRef[]; joke: HwProblemRef[] }

// ---- teacher: status / delete-all ----
export type HwStatus = { available: boolean; enabled: boolean; photo_count: number }
export type HwDeleteAllResult = { deleted_photos: number }

// ---- teacher: student consent + link ----
export type HwConsentRecord = {
  id: number
  scope: HwConsentScope
  consenter: HwConsenter
  method: HwConsentMethod
  consented_on: string
  notice_version: string
  recorded_at: string
  withdrawn_at: string | null
}
export type HwLinkBlockedReason =
  | 'REVOKED' | 'STUDENT_DELETED' | 'TEACHER_INACTIVE' | 'FEATURE_OFF' | 'TRIAL_OFF'
  | 'LINK_BEFORE_TRIAL' | 'NO_CONSENT' | 'NOT_ENROLLED' | 'UNCLAIMED_EXPIRED'
export type HwLinkStatus = {
  id: number
  created_at: string
  claimed_at: string | null
  last_used_at: string | null
  submit_count: number
  blocked_attempts: number
  last_blocked_at: string | null
  expires_at: string | null
  alive: boolean
  blocked_reason: HwLinkBlockedReason | null
}
export type HwStudentState = {
  available: boolean
  enabled: boolean
  effective: { upload: boolean; ai: boolean }
  /** newest first, max 20, withdrawn rows included */
  consents: HwConsentRecord[]
  /** newest non-revoked link, or null */
  link: HwLinkStatus | null
}
export type HwConsentBody =
  | { scope: HwConsentScope; action: 'RECORD'; consenter: HwConsenter; method: HwConsentMethod; consented_on: string }
  | { scope: HwConsentScope; action: 'WITHDRAW' }
export type HwCreatedLink = {
  link: HwLinkStatus
  /** shown once */
  token: string
  /** '/submit#t=<token>' */
  path: string
  /** FRONTEND_PUBLIC_URL + path when that env is set, else null */
  url: string | null
}

// ---- teacher: template setting ----
export type HwItemOption = { id: number; name: string }
export type HwTemplateSetting = {
  template_id: number
  complete_item_id: number | null
  range_item_id: number | null
  /** after the fallback rule; null = no homework item */
  effective_complete_item_id: number | null
  /** COMPLETE, not common, not deleted, by sort_order */
  complete_candidates: HwItemOption[]
  /** common TEXT, not deleted, by sort_order */
  range_candidates: HwItemOption[]
}
export type HwTemplateSettingBody = { complete_item_id: number | null; range_item_id: number | null }

// ---- teacher: lesson view ----
export type HwCarryReason = 'LATE' | 'UNRESOLVED_REVIEW' | 'NO_TARGET_LESSON' | 'NOT_ON_ROSTER'
export type HwPhoto = { id: string; ordinal: number; width: number; height: number }
export type HwSubmissionActions = {
  check_here: boolean
  open_target: boolean
  acknowledge: boolean
  return: boolean
  hide: boolean
  unhide: boolean
  move: boolean
  recheck: boolean
  complete_late: boolean
}
export type HwSubmissionView = {
  id: string
  student_id: number
  class_id: number
  class_name: string
  target_kind: HwTargetKind
  target_date: string
  /** regular lesson of (class, target_date), or null */
  target_lesson_id: number | null
  /** own submission of THIS lesson */
  is_own: boolean
  /** null when is_own */
  carry_reason: HwCarryReason | null
  submitted_at: string
  range_text: string | null
  /** latest check is PENDING */
  checking: boolean
  verdict: HwVerdict | null
  reasons: HwStoredReason[]
  /** from the latest DONE check's computed counts; null when hidden, no DONE check, or total 0 */
  completeness: { answered: number; total: number } | null
  photo_count: number
  photos: HwPhoto[]
  hidden: HwHiddenBy | null
  resolution: HwResolution | null
  resolved_value: boolean | null
  resolved_lesson_record_id: number | null
  /** resolved_lesson_record_id === this lesson */
  resolved_here: boolean
  /** own only (null otherwise): value an earlier, superseded submission of the same target APPLIED in this lesson (OwnFacts.earlierAppliedValue, §3.9) */
  earlier_applied_value: boolean | null
  return_reason: string | null
  late: { lesson_student_data_id: number | null; lesson_record_id: number | null; lesson_date: string } | null
  actions: HwSubmissionActions
}
export type HwLessonStudent = {
  student_id: number
  own_submission_id: string | null
  /** unresolved carried 확인 필요, newest first */
  carried_submission_ids: string[]
}
export type HwSummary = {
  complete: number
  incomplete: number
  applied: number
  teacher: number
  review: number
  checking: number
  no_photo: number
}
export type HwLessonView = {
  enabled: boolean
  lesson_id: number
  /** template item id of the homework column (source 'template') */
  homework_item_id: number | null
  has_column: boolean
  /** roster students that have an own or carried submission; others are 사진 없음 */
  students: HwLessonStudent[]
  submissions: HwSubmissionView[]
  /** computed with SAVED cell values; the FE recomputes with local values */
  summary: HwSummary
}
export type HwRowCategory =
  | 'REVIEW' | 'CHECKING' | 'NO_PHOTO' | 'SUGGEST_COMPLETE' | 'SUGGEST_INCOMPLETE' | 'APPLIED' | 'TEACHER'

// ---- teacher: resolve / recheck ----
export type HwResolveAction =
  | { type: 'APPLIED' | 'CHECKED'; submission_id: string; value: boolean; lesson_record_id?: number }
  | { type: 'ACKNOWLEDGED' | 'HIDDEN' | 'UNHIDE'; submission_id: string }
  | { type: 'RETURNED'; submission_id: string; reason: string }
  | { type: 'MOVE'; submission_id: string; class_id: number; target_date: string }
export type HwResolveResult = {
  results: Array<{ submission_id: string; type: HwResolveAction['type']; ok: boolean; code: string | null }>
}
export type HwRecheckResult = { submission_id: string; checking: true }

// ---- public (student) ----
export type HwPublicState = 'DRAFT' | 'CHECKING' | 'RETAKE' | 'SUBMITTED' | 'CONFIRMED' | 'RETURNED'
export type HwPublicSubmission = {
  submission_id: string
  class_name: string
  target_kind: HwTargetKind
  target_date: string
  submitted_at: string | null
  photo_count: number
  state: HwPublicState
  /** only when state === 'RETAKE', else [] */
  retake: HwRetakeItem[]
  /** only when state === 'RETURNED', else null */
  return_reason: string | null
}
export type HwPublicTarget = { date: string; range_text: string | null }
export type HwPublicLate = { lesson_student_data_id: number; date: string; range_text: string | null }
export type HwPublicClass = {
  class_id: number
  class_name: string
  /** only when today (KST) is a class day */
  today: HwPublicTarget | null
  next: HwPublicTarget | null
  late: HwPublicLate[]
}
export type HwPublicMe = {
  /** 이름 일부, e.g. '홍*동' */
  student_name: string
  /** guardian AI consent: show the AI line of the intro */
  ai_notice: boolean
  max_photos: number
  classes: HwPublicClass[]
  recent: HwPublicSubmission[]
  returned_notice: { submission_id: string; class_name: string; target_date: string; reason: string } | null
}
export type HwClaimBody = { token: string }
export type HwClaimResult = { claimed: true }
export type HwCreateSubmissionBody = { class_id: number; target: HwTargetKind; late_lesson_student_data_id?: number }
export type HwCreatedSubmission = {
  submission_id: string
  class_name: string
  target_kind: HwTargetKind
  target_date: string
  max_photos: number
}
export type HwUploadedPhoto = { photo: HwPhoto; photo_count: number }
