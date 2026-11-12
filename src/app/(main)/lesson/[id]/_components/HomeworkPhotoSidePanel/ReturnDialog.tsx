'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import Text from '@/components/common/Text'
import Textarea from '@/components/common/Textarea'
import { HW_ACTION_LABELS } from '@/lib/homeworkPhoto/labels'
import * as styles from './HomeworkPhotoSidePanel.css'

/** 다시 내기 요청 이유 최대 글자 수(백엔드 RETURN_REASON_MAX와 같다) */
const RETURN_REASON_MAX = 200

type ReturnDialogProps = {
  busy: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
}

/** 다시 내기 요청: 이유를 적어 학생에게 돌려보낸다. 숙제 칸에 미완료를 쓰지 않는다(§10). */
export default function ReturnDialog({ busy, onCancel, onConfirm }: ReturnDialogProps) {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()
  const valid = trimmed.length > 0 && trimmed.length <= RETURN_REASON_MAX
  return (
    <Modal isOpen onClose={busy ? () => {} : onCancel} size="sm">
      <div className={styles.dialogBody}>
        <Text variant="headingMd" as="h2">
          {HW_ACTION_LABELS.return}
        </Text>
        <Text variant="bodyMd" color="gray500">
          학생이 링크를 열면 이 이유가 보여요.
        </Text>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={RETURN_REASON_MAX}
          rows={3}
          placeholder="예: 7번부터 빈칸이에요. 다 풀고 다시 내 주세요."
          aria-label="다시 내기 요청 이유"
          disabled={busy}
        />
        <span className={styles.counter}>
          {trimmed.length}/{RETURN_REASON_MAX}
        </span>
      </div>
      <div className={styles.dialogActions}>
        <Button
          type="button"
          variant="ghost"
          size="md"
          fullWidth
          disabled={busy}
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          fullWidth
          disabled={!valid || busy}
          onClick={() => onConfirm(trimmed)}
        >
          요청하기
        </Button>
      </div>
    </Modal>
  )
}
