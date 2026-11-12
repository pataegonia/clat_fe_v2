'use client'

import Button from '@/components/common/Button'
import { HW_LESSON_LABELS, HW_SUMMARY_LABELS, HW_SUMMARY_ORDER } from '@/lib/homeworkPhoto/labels'
import type { HwSummary } from '@/types/homeworkPhoto'
import * as styles from './HomeworkPhotoSummary.css'

type HomeworkPhotoSummaryProps = {
  /** 명단 전체(검색으로 거른 목록이 아니다)를 지금 칸 값으로 센 숫자 */
  summary: HwSummary
  /** 숙제 열이 있을 때만 'AI 제안 적용'을 보인다. */
  showApply: boolean
  applyDisabled: boolean
  onApply: () => void
}

/** 표 위 숫자: 'AI 제안: 완료 8 · 미완료 1 · 확인 필요 3 · 사진 없음 2'. 0인 것은 뺀다(§10). */
export default function HomeworkPhotoSummary({
  summary,
  showApply,
  applyDisabled,
  onApply,
}: HomeworkPhotoSummaryProps) {
  const counts = HW_SUMMARY_ORDER.filter((key) => summary[key] > 0)
    .map((key) => `${HW_SUMMARY_LABELS[key]} ${summary[key]}`)
    .join(' · ')
  return (
    <div className={styles.bar}>
      <p className={styles.text}>
        <span className={styles.label}>{HW_LESSON_LABELS.summaryTitle}</span> {counts}
      </p>
      {showApply ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          className={styles.applyButton}
          disabled={applyDisabled}
          onClick={onApply}
        >
          {HW_LESSON_LABELS.apply}
        </Button>
      ) : null}
    </div>
  )
}
