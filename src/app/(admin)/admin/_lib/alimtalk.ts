import type { AdminAlimtalkBatchMessage, AdminAlimtalkBatchType } from '@/types/admin'

export function batchTypeLabel(type: AdminAlimtalkBatchType | string): string {
  if (type === 'LESSON') return '수업'
  if (type === 'ATTENDANCE') return '출결'
  if (type === 'BROADCAST') return '공지'
  if (type === 'TEST') return '테스트'
  if (type === 'REPORT') return '보고서'
  return type
}

export function batchTitle(row: {
  batch_type: string
  class_name: string | null
  lesson_date: string | null
}): string {
  if (row.batch_type === 'BROADCAST') return '전체 공지'
  if (row.batch_type === 'REPORT') return '보고서 알림'
  if (row.class_name) return row.class_name
  return '알림톡 발송'
}

export type GroupedRecipient = {
  student_id: number
  student_name: string
  student?: AdminAlimtalkBatchMessage
  parent?: AdminAlimtalkBatchMessage
}

export function groupBatchMessages(messages: AdminAlimtalkBatchMessage[]): GroupedRecipient[] {
  const map = new Map<number, GroupedRecipient>()
  for (const msg of messages) {
    const cur = map.get(msg.student_id) ?? {
      student_id: msg.student_id,
      student_name: msg.student_name,
    }
    cur.student_name = msg.student_name
    if (msg.phone_type === 'STUDENT') cur.student = msg
    else cur.parent = msg
    map.set(msg.student_id, cur)
  }
  return [...map.values()].sort((a, b) => a.student_name.localeCompare(b.student_name, 'ko'))
}
