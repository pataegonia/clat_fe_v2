/** 반에서 빼거나 학생을 지운 사유. 백엔드 LeaveReason(선생님이 고르는 값)과 같다. */
export type LeaveReason = 'WITHDRAWN' | 'TRANSFERRED' | 'GRADUATED' | 'PAUSED' | 'OTHER'

export const LEAVE_REASON_OPTIONS: ReadonlyArray<{ value: LeaveReason; label: string }> = [
  { value: 'WITHDRAWN', label: '퇴원' },
  { value: 'TRANSFERRED', label: '반 이동' },
  { value: 'GRADUATED', label: '졸업' },
  { value: 'PAUSED', label: '휴원' },
  { value: 'OTHER', label: '기타' },
]

export const LEAVE_REASON_NOTE_MAX_LENGTH = 200

export interface LeaveReasonValue {
  reason: LeaveReason | null
  note: string
}

export const EMPTY_LEAVE_REASON: LeaveReasonValue = { reason: null, note: '' }

/** 사유를 고르지 않았으면 아무것도 보내지 않는다(예전 호출과 같다). */
export function leaveReasonPayload(
  value?: LeaveReasonValue,
): { reason: LeaveReason; reason_note?: string } | undefined {
  if (!value?.reason) return undefined
  const note = value.note.trim()
  return note ? { reason: value.reason, reason_note: note } : { reason: value.reason }
}
