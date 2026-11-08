import axiosInstance from '@/lib/api/axiosInstance'
import type { FeedbackReviewIssue, FeedbackReviewStatus } from '@/services/lesson'

/** 주간·월간 보고서 (선생님). 숫자는 서버가 계산하고 AI는 월간 총평 문장만 쓴다. */

export type ReportKind = 'WEEKLY' | 'MONTHLY'
export type ReportStatus = 'DRAFT' | 'READY' | 'APPROVED' | 'PUBLISHED' | 'FAILED'

export interface ReportClassSection {
  class_id: number
  class_name: string
  lessons: number
  attendance: {
    recorded: number
    present: number
    late: number
    absent: number
    other: number
    rate: number | null
  }
  homework: { total: number; completed: number; rate: number | null }
  scores: Array<{ date: string; item_name: string; display: string; percent: number | null }>
  average_score: number | null
}

export interface ReportSnapshot {
  period: { type: ReportKind; from: string; to: string }
  classes: ReportClassSection[]
}

export interface ReportSummary {
  strengths: string
  improvements: string
  next_goals: string
}

export interface TeacherReport {
  id: number
  student_id: number
  student_name: string
  period_type: ReportKind
  period_start: string
  period_end: string
  label: string
  status: ReportStatus
  snapshot: ReportSnapshot
  summary: ReportSummary | null
  summary_source: 'TEACHER' | 'AI' | null
  review: { status: FeedbackReviewStatus; issues: FeedbackReviewIssue[] } | null
  approved_at: string | null
  published_at: string | null
}

export interface ReportList {
  period_type: ReportKind
  period_start: string | null
  label: string | null
  reports: TeacherReport[]
}

const unwrap = <T,>(data: { data?: T } | T): T => ((data as { data?: T }).data ?? data) as T

export const reportService = {
  async periods(kind: ReportKind): Promise<Array<{ period_start: string; label: string }>> {
    const { data } = await axiosInstance.get('/reports/periods', { params: { type: kind } })
    return unwrap(data)
  },

  async list(kind: ReportKind, periodStart?: string): Promise<ReportList> {
    const { data } = await axiosInstance.get('/reports', {
      params: { type: kind, ...(periodStart ? { period_start: periodStart } : {}) },
    })
    return unwrap(data)
  },

  async generate(kind: ReportKind, periodStart: string): Promise<void> {
    await axiosInstance.post('/reports/generate', { type: kind, period_start: periodStart })
  },

  async updateSummary(id: number, summary: ReportSummary): Promise<TeacherReport> {
    const { data } = await axiosInstance.put(`/reports/${id}`, summary)
    return unwrap(data)
  },

  async regenerate(id: number): Promise<void> {
    await axiosInstance.post(`/reports/${id}/regenerate`)
  },

  async publish(
    ids: number[],
  ): Promise<{ published_count: number; notification?: ReportNotification }> {
    const { data } = await axiosInstance.post('/reports/publish', { ids })
    return unwrap(data)
  },
}

/** 공개할 때 보낸 학부모 알림톡 결과. 템플릿 승인 전에는 enabled=false라 아무것도 보내지 않는다. */
export interface ReportNotification {
  enabled: boolean
  queued_count: number
  failed?: boolean
}

/** 공개 안내 뒤에 붙일 알림톡 문구. 알림을 안 쓰거나 보낼 사람이 없으면 빈 문자열. */
export function reportNotificationNote(notification?: ReportNotification): string {
  if (!notification?.enabled) return ''
  if (notification.failed) return ' 알림톡은 보내지 못했어요.'
  if (notification.queued_count === 0) return ''
  return ` 학부모에게 알림톡 ${notification.queued_count}건을 보냈어요.`
}
