'use client'

import SuccessIcon from '@/assets/icons/icon-success.svg'
import WarningIcon from '@/assets/icons/icon-warning.svg'
import { HW_PUBLIC_STATE_LABELS, HW_STUDENT_LABELS } from '@/lib/homeworkPhoto/labels'
import type { ResultView, SubmitResult } from '../_hooks/useSubmissionFlow'
import * as styles from '../submit.css'

const TITLES: Record<ResultView['kind'], string> = {
  checking: HW_PUBLIC_STATE_LABELS.CHECKING,
  retake: HW_PUBLIC_STATE_LABELS.RETAKE,
  done: HW_STUDENT_LABELS.submitted,
}

type ResultScreenProps = {
  result: SubmitResult
  /** 다시 찍기 안내일 때: 같은 숙제로 새로 찍는다 */
  onRetake: () => void
  onHome: () => void
}

/** 낸 뒤: AI가 확인하는 동안 기다리고, 사진에 문제가 있으면 다시 찍기 안내, 아니면 '냈어요' */
export default function ResultScreen({ result, onRetake, onHome }: ResultScreenProps) {
  const { view } = result

  return (
    <div className={styles.centerStack}>
      {view.kind === 'checking' ? <div className={styles.spinner} aria-hidden /> : null}
      {view.kind === 'retake' ? <WarningIcon className={styles.stateIcon} aria-hidden /> : null}
      {view.kind === 'done' ? <SuccessIcon className={styles.stateIcon} aria-hidden /> : null}

      <h1 className={styles.centerTitle} aria-live="polite">{TITLES[view.kind]}</h1>
      <p className={styles.statusText}>{result.label}</p>

      {view.kind === 'retake' ? (
        <ul className={styles.retakeList}>
          {view.lines.map((line, index) => (
            <li key={index} className={styles.retakeLine}>
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.actions}>
        {view.kind === 'retake' ? (
          <button type="button" className={styles.primaryButton} onClick={onRetake}>
            다시 찍기
          </button>
        ) : null}
        <button type="button" className={styles.secondaryButton} onClick={onHome}>
          처음으로
        </button>
      </div>
    </div>
  )
}
