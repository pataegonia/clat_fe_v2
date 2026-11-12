import type {
  HwCarryReason,
  HwConsenter,
  HwConsentMethod,
  HwConsentScope,
  HwLinkBlockedReason,
  HwProblemRef,
  HwPublicState,
  HwRetakeItem,
  HwStoredReason,
  HwSummary,
} from '@/types/homeworkPhoto'

/**
 * 사진 숙제 AI 확인 문구. 기획 문서(homework-photo-plan.md)에 있는 말은 고치지 않고 그대로 둔다.
 * 여러 화면이 같이 쓰는 문구만 여기 두고, 한 컴포넌트에서만 쓰는 문구는 그 컴포넌트에 둔다.
 */

/** 기능 이름(기능 체험, 템플릿 카드) */
export const HW_FEATURE_LABEL = '사진 숙제 AI 확인'

// ---- 학생 제출 화면(/submit) ----

/** 첫 안내(기획 §6). ai 줄은 AI 확인 동의가 있는 학생(ai_notice)에게만 보인다. */
export const HW_INTRO_LINES = {
  teacher: '사진은 선생님이 본다.',
  ai: 'AI(해외 회사 OpenAI)가 먼저 숙제를 했는지 살펴보고 선생님께 알려 드린다. 숙제를 했는지는 선생님이 사진을 보고 정한다.',
  retention: '사진은 짧게 두고 지운다.',
  photoOnly: '숙제만 찍는다. 얼굴, 다른 사람, 집 안은 찍지 않는다.',
} as const

export const HW_STUDENT_LABELS = {
  claim: '이 휴대폰으로 내기',
  today: '오늘 수업',
  next: '다음 수업',
  late: '늦게 내기',
  camera: '카메라로 찍기',
  album: '앨범에서 고르기',
  submit: '제출',
  submitted: '냈어요',
  blocked: '선생님께 새 링크를 받아 주세요',
} as const

/** 학생이 보는 내 지난 제출 상태 */
export const HW_PUBLIC_STATE_LABELS: Record<HwPublicState, string> = {
  DRAFT: '다 내지 않음',
  CHECKING: '확인하고 있어요',
  RETAKE: '다시 찍기 안내',
  SUBMITTED: '냈음',
  CONFIRMED: '선생님 확인함',
  RETURNED: '다시 내기 요청',
}

// ---- 선생님 수업 표·옆 창 ----

/** 숙제 칸에 연하게 보이는 AI 제안과 적용한 칸의 표시 */
export const HW_CELL_LABELS = {
  suggestComplete: 'AI 완료',
  suggestIncomplete: 'AI 미완료',
  aiMark: 'AI',
} as const

export const HW_LESSON_LABELS = {
  summaryTitle: 'AI 제안:',
  apply: 'AI 제안 적용',
  review: '확인 필요',
  checking: 'AI 확인 중',
  moderationHidden: '자동으로 가림',
  sendPrompt: (count: number) => `AI 제안 ${count}명을 적용하고 보낼까요?`,
} as const

/** 표 위 숫자(AI 제안: 완료 8 · 미완료 1 · …)의 이름 */
export const HW_SUMMARY_LABELS: Record<keyof HwSummary, string> = {
  complete: '완료',
  incomplete: '미완료',
  applied: '적용함',
  teacher: '선생님 체크',
  review: '확인 필요',
  checking: 'AI 확인 중',
  no_photo: '사진 없음',
}

/** 표 위 숫자를 보이는 차례 */
export const HW_SUMMARY_ORDER: ReadonlyArray<keyof HwSummary> = [
  'complete',
  'incomplete',
  'applied',
  'teacher',
  'review',
  'checking',
  'no_photo',
]

/** 옆 창에서 고를 수 있는 것 */
export const HW_ACTION_LABELS = {
  complete: '완료',
  incomplete: '미완료',
  openTarget: '대상 수업 열기',
  acknowledge: '확인함',
  return: '다시 내기 요청',
  hide: '숨기기',
  unhide: '가림 풀기',
  move: '다른 수업으로 옮기기',
  recheck: 'AI 다시 확인',
  completeLate: '지난 숙제로 완료',
} as const

/** 칸 옆 표시: '사진 2' 또는 완성도가 있으면 '사진 2 · 9/12' */
export function photoBadgeText(
  photoCount: number,
  completeness: { answered: number; total: number } | null
): string {
  const photos = `사진 ${photoCount}`
  return completeness ? `${photos} · ${completeness.answered}/${completeness.total}` : photos
}

// ---- 확인 필요 이유 ----

/** 문항·쪽 같은 내용이 붙는 이유 */
type DetailedReasonCode = 'RETAKE' | 'PAGE_OVERLAP' | 'AMBIGUOUS' | 'PARTIAL'
type SimpleReason = Exclude<HwStoredReason, { code: DetailedReasonCode }>
type ExtraReasonCode = 'NO_HOMEWORK_ITEM' | 'TEACHER_VALUE_DIFFERS'

const SIMPLE_REASON_LABELS: Record<SimpleReason['code'], string> = {
  AI_NO_CONSENT: 'AI 동의 없음',
  AI_LIMIT: '오늘 한도로 AI 확인 안 함',
  AI_FAILED: 'AI 실패',
  AI_OFF: 'AI 확인 꺼짐',
  FLAGGED: '부적절한 사진 검사에 걸림',
  NO_PAGE_NUMBER: '쪽 번호를 못 읽음',
  LATE: '늦게 낸 지난 숙제',
  DUPLICATE_PHOTO: '지난 숙제와 같은 사진',
  NO_PROBLEMS: '문항을 못 읽음',
}

/** 제출에 저장되지 않고 이 수업의 칸을 보고 정하는 확인 필요 까닭 */
export const HW_EXTRA_REASON_LABELS: Record<ExtraReasonCode, string> = {
  NO_HOMEWORK_ITEM: '숙제 항목 없음',
  TEACHER_VALUE_DIFFERS: '선생님이 적은 값과 다름',
}

/** 다른 수업에서 넘어온 까닭. 따로 적는 것만 둔다(나머지는 제출의 이유로 보인다). */
export const HW_CARRY_REASON_LABELS: Partial<Record<HwCarryReason, string>> = {
  NOT_ON_ROSTER: '수업 명단에 없음',
  NO_TARGET_LESSON: '그 날짜 수업 기록 없음',
}

/** 쪽 번호: [42, 43] → '42, 43' */
function pagesText(pages: number[]): string {
  return pages.join(', ')
}

/** 문항 위치. 사진이 한 장이면 '3번·7번', 여러 장이면 '사진1 3번·사진2 7번' */
export function problemRefsText(refs: HwProblemRef[], photoCount: number): string {
  const refText = (ref: HwProblemRef) =>
    photoCount > 1 ? `사진${ref.photo} ${ref.n}번` : `${ref.n}번`
  return refs.map(refText).join('·')
}

const PHOTO_RETAKE_LABELS = {
  BLURRY: '사진이 흐려요. 다시 찍어 주세요',
  DARK: '사진이 어두워요. 밝은 곳에서 다시 찍어 주세요',
  CROPPED: '숙제가 잘렸어요. 한 쪽이 다 보이게 다시 찍어 주세요',
  NOT_HOMEWORK: '숙제 사진이 아니에요. 숙제를 찍어 주세요',
} as const

/**
 * 다시 찍기 안내 한 줄(학생 화면과 옆 창).
 * 사진이 여러 장이면 사진 한 장에 대한 안내 앞에 'n번째 사진: '을 붙인다.
 */
export function retakeText(item: HwRetakeItem, photoCount: number): string {
  switch (item.code) {
    case 'WRONG_PAGE':
      return `숙제 범위와 다른 쪽이에요(p.${pagesText(item.pages)}). 맞는 쪽을 찍어 주세요`
    case 'MISSING_PAGE':
      return `빠진 쪽이 있어요(p.${pagesText(item.pages)}). 모든 쪽을 찍어 다시 내 주세요`
    default: {
      const text = PHOTO_RETAKE_LABELS[item.code]
      return photoCount > 1 ? `${item.photo}번째 사진: ${text}` : text
    }
  }
}

/** 일부만 함(5/12) · 3번·7번 빈칸 · 9번 장난 답 */
function partialText(
  reason: Extract<HwStoredReason, { code: 'PARTIAL' }>,
  photoCount: number
): string {
  const parts = [`일부만 함(${reason.answered}/${reason.total})`]
  if (reason.blank.length > 0) parts.push(`${problemRefsText(reason.blank, photoCount)} 빈칸`)
  if (reason.joke.length > 0) parts.push(`${problemRefsText(reason.joke, photoCount)} 장난 답`)
  return parts.join(' · ')
}

/** 확인 필요 이유 한 줄(옆 창). photoCount는 그 제출의 사진 수다(문항·사진 위치 표기에 쓴다). */
export function reasonText(reason: HwStoredReason, photoCount: number): string {
  switch (reason.code) {
    case 'RETAKE': {
      const items = reason.items.map((item) => retakeText(item, photoCount))
      return ['다시 찍기 안내함', ...items].join(' · ')
    }
    case 'PAGE_OVERLAP':
      return `지난 숙제와 같은 쪽(p.${pagesText(reason.pages)})`
    case 'AMBIGUOUS':
      return `애매한 문항(${problemRefsText(reason.problems, photoCount)})`
    case 'PARTIAL':
      return partialText(reason, photoCount)
    default:
      return SIMPLE_REASON_LABELS[reason.code]
  }
}

// ---- 학생 상세: 동의와 링크 ----

export const HW_CONSENT_SCOPE_LABELS: Record<HwConsentScope, string> = {
  UPLOAD: '사진 제출',
  AI: 'AI 확인',
}

export const HW_CONSENTER_LABELS: Record<HwConsenter, string> = {
  GUARDIAN: '학부모',
  STUDENT: '학생 본인',
}

export const HW_CONSENT_METHOD_LABELS: Record<HwConsentMethod, string> = {
  WRITTEN: '학원 서면 동의',
}

/** 링크를 쓸 수 없는 까닭(선생님 화면) */
export const HW_LINK_BLOCKED_LABELS: Record<HwLinkBlockedReason, string> = {
  REVOKED: '끊은 링크예요',
  STUDENT_DELETED: '지운 학생이에요',
  TEACHER_INACTIVE: '계정 상태 때문에 쓸 수 없어요',
  TRIAL_OFF: '기능이 꺼져 있어요',
  LINK_BEFORE_TRIAL: '기능을 껐다 켜서 끊긴 링크예요',
  NO_CONSENT: '사진 제출 동의가 없어요',
  NOT_ENROLLED: '다니는 반이 없어요',
  UNCLAIMED_EXPIRED: '7일 안에 열지 않아 끝났어요',
}
