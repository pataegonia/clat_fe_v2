'use client'

import { HW_INTRO_LINES, HW_STUDENT_LABELS } from '@/lib/homeworkPhoto/labels'
import * as styles from '../submit.css'

/** 첫 안내(기획 §6). AI 줄은 AI 확인에 동의한 학생에게만 보인다. */
export function NoticeLines({ ai }: { ai: boolean }) {
  const lines = [
    HW_INTRO_LINES.teacher,
    ...(ai ? [HW_INTRO_LINES.ai] : []),
    HW_INTRO_LINES.retention,
    HW_INTRO_LINES.photoOnly,
  ]
  return (
    <ul className={styles.noticeList}>
      {lines.map((line) => (
        <li key={line} className={styles.noticeItem}>
          {line}
        </li>
      ))}
    </ul>
  )
}

type IntroScreenProps = {
  claiming: boolean
  error: string | null
  onClaim: () => void
}

/** 링크를 처음 연 브라우저. 묶기 전에는 동의 여부를 모르므로 AI 줄 없이 보인다. */
export default function IntroScreen({ claiming, error, onClaim }: IntroScreenProps) {
  return (
    <>
      <h1 className={styles.title}>숙제 내기</h1>
      <section className={styles.card}>
        <NoticeLines ai={false} />
      </section>
      {error ? <p className={styles.errorText}>{error}</p> : null}
      <button type="button" className={styles.primaryButton} disabled={claiming} onClick={onClaim}>
        {HW_STUDENT_LABELS.claim}
      </button>
    </>
  )
}
