'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Button from '@/components/common/Button'
import Dropdown from '@/components/common/Dropdown'
import Modal from '@/components/common/Modal'
import Text from '@/components/common/Text'
import { studentService } from '@/services/student'
import { hwKeys } from '@/lib/homeworkPhoto/queryKeys'
import { HW_ACTION_LABELS } from '@/lib/homeworkPhoto/labels'
import type { HwSubmissionView } from '@/types/homeworkPhoto'
import * as styles from './HomeworkPhotoSidePanel.css'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

type MoveDialogProps = {
  submission: HwSubmissionView
  busy: boolean
  onCancel: () => void
  onConfirm: (classId: number, targetDate: string) => void
}

/**
 * 다른 수업으로 옮기기: 대상(반, 수업 날짜)만 바꾼다. 처리가 아니다.
 * 옮긴 수업 표에서 다시 제안이나 확인 필요로 보인다(§8 처리, §10).
 */
export default function MoveDialog({ submission, busy, onCancel, onConfirm }: MoveDialogProps) {
  const [classValue, setClassValue] = useState(String(submission.class_id))
  const [targetDate, setTargetDate] = useState(submission.target_date)
  const classes = useQuery({
    queryKey: [...hwKeys.all, 'student-classes', submission.student_id] as const,
    queryFn: async () => (await studentService.getStudent(submission.student_id)).classes,
  })

  const options = (classes.data ?? []).map((c) => ({ label: c.name, value: String(c.id) }))
  const classId = options.some((option) => option.value === classValue) ? Number(classValue) : null
  const changed = classId !== submission.class_id || targetDate !== submission.target_date
  const valid = classId !== null && DATE_PATTERN.test(targetDate) && changed

  return (
    <Modal isOpen onClose={busy ? () => {} : onCancel} size="sm">
      <div className={styles.dialogBody}>
        <Text variant="headingMd" as="h2">
          {HW_ACTION_LABELS.move}
        </Text>
        <Text variant="bodyMd" color="gray500">
          옮긴 수업 표에서 다시 제안이나 확인 필요로 보여요.
        </Text>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>반</span>
          {classes.isPending ? (
            <Text variant="bodyMd" color="gray500">
              불러오는 중…
            </Text>
          ) : classes.isError ? (
            <Text variant="bodyMd" color="gray500">
              반 목록을 불러오지 못했어요.
            </Text>
          ) : (
            <Dropdown options={options} value={classValue} onChange={setClassValue} fullWidth />
          )}
        </div>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>수업 날짜</span>
          <input
            type="date"
            className={styles.dateInput}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            disabled={busy}
          />
        </label>
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
          onClick={() => {
            if (classId !== null) onConfirm(classId, targetDate)
          }}
        >
          옮기기
        </Button>
      </div>
    </Modal>
  )
}
