'use client'

import Text from '@/components/common/Text'
import LessonAlimtalkFramePreview from '@/components/message/LessonAlimtalkFramePreview'
import { stripParentDashboardPreviewLine } from '@/lib/lessonAlimtalkFrame'
import type { LessonPreviewRow, SendWarning } from '@/services/lesson'
import { listParentPhones } from '@/lib/parentPhones'
import * as styles from './AlimtalkSendModal.css'

/** 발송 전 규칙 검사 결과. 막지 않고 알려만 준다. */
function SendWarnings({ warnings }: { warnings: SendWarning[] }) {
  if (warnings.length === 0) return null
  return (
    <div className={styles.warningBox} role="note" aria-label="보내기 전에 확인할 내용">
      <Text variant="titleSm" color="gray900">
        보내기 전에 확인해 주세요
      </Text>
      <ul className={styles.warningList}>
        {warnings.map((warning, index) => (
          <li key={`${warning.code}-${warning.item_name ?? ''}-${index}`}>{warning.message}</li>
        ))}
      </ul>
      <Text variant="labelSm" color="gray600">
        고치지 않아도 그대로 보낼 수 있어요.
      </Text>
    </div>
  )
}

const CHAR_LIMIT = 1000

function CharCount({ count }: { count: number | undefined }) {
  if (typeof count !== 'number') return null
  const over = count > CHAR_LIMIT
  return (
    <Text variant="labelSm" color={over ? 'error500' : 'gray500'} className={styles.lengthLine}>
      {`${count.toLocaleString('ko-KR')}자 / 1,000자`}
    </Text>
  )
}

function hasPhone(value: string | null | undefined) {
  return Boolean(value && String(value).replace(/\D/g, '').length >= 8)
}

interface AlimtalkMessagePreviewProps {
  focused: LessonPreviewRow | undefined
  frameHeader: string
  sendToParent: boolean
  sendToStudent: boolean
  /** 공통 항목 경고. 모든 학생 문자에 해당한다. */
  commonWarnings: SendWarning[]
}

export default function AlimtalkMessagePreview({
  focused,
  frameHeader,
  sendToParent,
  sendToStudent,
  commonWarnings,
}: AlimtalkMessagePreviewProps) {
  if (!focused) {
    return (
      <Text variant="bodyMd" color="gray500">
        왼쪽에서 학생을 선택하면 미리보기가 표시돼요.
      </Text>
    )
  }

  return (
    <div>
      <Text variant="titleMd">메시지 미리보기</Text>
      <SendWarnings warnings={[...(focused.warnings ?? []), ...commonWarnings]} />
      {sendToStudent ? (
        <div>
          <div className={styles.previewSectionLabel}>학생용</div>
          <div className={styles.previewBox}>
            {hasPhone(focused.phone) ? (
              <LessonAlimtalkFramePreview header={frameHeader} body={focused.message || ''} />
            ) : (
              '학생 연락처가 없어 이 채널로는 발송되지 않아요.'
            )}
          </div>
          {hasPhone(focused.phone) ? (
            <CharCount count={focused.student_char_count} />
          ) : null}
        </div>
      ) : null}
      {sendToParent ? (
        <div>
          <div className={styles.previewSectionLabel}>학부모용</div>
          <div className={styles.previewBox}>
            {listParentPhones(focused).some((phone) => hasPhone(phone)) ? (
              <LessonAlimtalkFramePreview
                header={frameHeader}
                body={stripParentDashboardPreviewLine(focused.message_for_parent || '')}
              />
            ) : (
              '학부모 연락처가 없어 이 채널로는 발송되지 않아요.'
            )}
          </div>
          {listParentPhones(focused).some((phone) => hasPhone(phone)) ? (
            <CharCount count={focused.parent_char_count} />
          ) : null}
        </div>
      ) : null}
      {!sendToParent && !sendToStudent ? (
        <Text variant="bodyMd" color="gray500">
          학부모 또는 학생 중 받을 대상을 골라 주세요.
        </Text>
      ) : null}
    </div>
  )
}
