'use client'

import Text from '@/components/common/Text'
import Input from '@/components/common/Input'
import {
  LEAVE_REASON_NOTE_MAX_LENGTH,
  LEAVE_REASON_OPTIONS,
  type LeaveReasonValue,
} from '@/types/leaveReason'
import { chipRowStyle, chipSelectedStyle, chipStyle, wrapperStyle } from './LeaveReasonPicker.css'

interface LeaveReasonPickerProps {
  value: LeaveReasonValue
  onChange: (next: LeaveReasonValue) => void
  /** 화면 낭독기용 묶음 이름 */
  label?: string
}

/** 반에서 빼거나 학생을 지울 때 사유(선택)를 고른다. 다시 누르면 선택이 풀린다. */
export default function LeaveReasonPicker({ value, onChange, label = '사유' }: LeaveReasonPickerProps) {
  return (
    <div className={wrapperStyle}>
      <Text variant="titleSm" color="gray700">
        {`${label} (선택)`}
      </Text>
      <div role="radiogroup" aria-label={label} className={chipRowStyle}>
        {LEAVE_REASON_OPTIONS.map((option) => {
          const selected = value.reason === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={selected ? `${chipStyle} ${chipSelectedStyle}` : chipStyle}
              onClick={() => onChange({ ...value, reason: selected ? null : option.value })}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {value.reason ? (
        <Input
          value={value.note}
          onChange={(event) => onChange({ ...value, note: event.target.value })}
          placeholder="메모 (선택)"
          maxLength={LEAVE_REASON_NOTE_MAX_LENGTH}
          aria-label={`${label} 메모`}
        />
      ) : null}
    </div>
  )
}
