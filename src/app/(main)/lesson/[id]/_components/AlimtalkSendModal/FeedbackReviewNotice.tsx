'use client'

import Text from '@/components/common/Text'
import type { FeedbackReviewIssue, ParentPreviewResult } from '@/services/lesson'
import * as styles from './AlimtalkSendModal.css'

export const REVIEW_ISSUE_LABEL: Record<FeedbackReviewIssue['type'], string> = {
  CONTRADICTION: '기록과 다름',
  UNSUPPORTED: '근거 없음',
  WRONG_SUBJECT: '주어 오류',
}

/** AI 검수가 짚은 문장 목록: 종류, 피드백 문장 그대로, 이유 */
export function FeedbackReviewIssues({ issues }: { issues: FeedbackReviewIssue[] }) {
  return (
    <ul className={styles.warningList}>
      {issues.map((issue, index) => (
        <li key={`${issue.type}-${index}`}>
          <strong>{REVIEW_ISSUE_LABEL[issue.type]}</strong>
          {` “${issue.sentence}”`}
          {issue.reason ? ` — ${issue.reason}` : ''}
        </li>
      ))}
    </ul>
  )
}

/** 대시보드 미리보기 위에 붙는 검수 결과. 문제 없음·검수 대상 아님이면 아무것도 그리지 않는다. */
export default function FeedbackReviewNotice({ review }: { review: ParentPreviewResult['review'] }) {
  if (!review || review.status === 'passed') return null
  if (review.status === 'unchecked') {
    return (
      <div className={styles.warningBox} role="status">
        <Text variant="titleSm" color="gray900">
          AI 검수를 하지 못했어요
        </Text>
        <Text variant="bodyMd" color="gray700">
          문제가 없다는 뜻은 아니에요. 보내기 전에 피드백을 한 번 읽어 봐 주세요.
        </Text>
      </div>
    )
  }
  return (
    <div className={styles.warningBox} role="status">
      <Text variant="titleSm" color="gray900">
        {`수업 기록과 맞지 않을 수 있는 문장 ${review.issues.length}개`}
      </Text>
      <FeedbackReviewIssues issues={review.issues} />
      <Text variant="bodyMd" color="gray700">
        다시 만들거나, 피드백을 눌러 직접 고칠 수 있어요. 그대로 보내도 돼요.
      </Text>
    </div>
  )
}
