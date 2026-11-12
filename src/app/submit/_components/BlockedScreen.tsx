'use client'

import WarningIcon from '@/assets/icons/icon-warning.svg'
import { HW_STUDENT_LABELS } from '@/lib/homeworkPhoto/labels'
import * as styles from '../submit.css'

type BlockedScreenProps = {
  /** 기본은 '선생님께 새 링크를 받아 주세요' */
  message?: string
  /** 있으면 '다시 시도' 버튼을 보인다(/me를 읽지 못했을 때) */
  onRetry?: () => void
}

/** 더 나아갈 수 없을 때: 막힌 링크, 다시 열어야 하는 링크, 읽지 못한 /me */
export default function BlockedScreen({
  message = HW_STUDENT_LABELS.blocked,
  onRetry,
}: BlockedScreenProps) {
  return (
    <div className={styles.centerStack}>
      <WarningIcon className={styles.stateIcon} aria-hidden />
      <h1 className={styles.centerTitle}>{message}</h1>
      {onRetry ? (
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={onRetry}>
            다시 시도
          </button>
        </div>
      ) : null}
    </div>
  )
}
