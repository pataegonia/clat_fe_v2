'use client'

import { HW_PUBLIC_STATE_LABELS, retakeText } from '@/lib/homeworkPhoto/labels'
import type { HwPublicState, HwPublicSubmission } from '@/types/homeworkPhoto'
import { dayLabel } from '../_lib/targetLabel'
import * as styles from '../submit.css'

type ChipTone = keyof typeof styles.stateChip

const STATE_TONES: Record<HwPublicState, ChipTone> = {
  DRAFT: 'plain',
  CHECKING: 'plain',
  RETAKE: 'warn',
  SUBMITTED: 'plain',
  CONFIRMED: 'done',
  RETURNED: 'warn',
}

/** 다시 찍기 안내와 다시 내기 요청 이유. 그 밖의 상태에는 덧붙일 말이 없다. */
function detailLines(item: HwPublicSubmission): string[] {
  if (item.state === 'RETAKE') return item.retake.map((r) => retakeText(r, item.photo_count))
  if (item.state === 'RETURNED' && item.return_reason) return [item.return_reason]
  return []
}

/** 내 지난 제출(최근 것부터). AI 판정과 완성도는 보이지 않는다. */
export default function RecentSubmissions({ items }: { items: HwPublicSubmission[] }) {
  if (items.length === 0) return null
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>내 지난 제출</h2>
      <ul className={styles.recentList}>
        {items.map((item) => (
          <li key={item.submission_id} className={styles.recentItem}>
            <div className={styles.recentHead}>
              <span className={styles.recentTitle}>{dayLabel(item.target_date)}</span>
              <span className={styles.stateChip[STATE_TONES[item.state]]}>
                {HW_PUBLIC_STATE_LABELS[item.state]}
              </span>
            </div>
            <p className={styles.recentMeta}>{item.class_name}</p>
            {detailLines(item).map((line, index) => (
              <p key={index} className={styles.recentDetail}>
                {line}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  )
}
