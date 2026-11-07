import publicAxios from '@/lib/api/publicAxios'
import type { ReportKind, ReportSnapshot, ReportSummary } from '@/services/reports'

export type ParentReportListItem = {
  id: number
  period_type: ReportKind
  period_start: string
  period_end: string
  label: string
}

export type ParentReportDetail = ParentReportListItem & {
  student_name: string
  snapshot: ReportSnapshot
  /** 월간: 선생님이 승인한 총평. 주간은 null */
  summary: ReportSummary | null
}

type ParentLessonSummary = {
  attendance: string | null
  scores: Array<{ name: string; value: string }>
  extra_items: Array<{ name: string; value: string }>
}

export type ParentDashboardData = {
  legacy_redirect?: boolean
  token?: string
  lesson_id?: number
  student_name: string
  class_name: string
  academy_name: string
  lesson_date: string
  lesson_summary: ParentLessonSummary
  ai_feedback: string | null
  ai_feedback_status: 'ready' | 'pending' | 'failed'
  show_ai_label?: boolean
  incomplete_items: Array<{
    item_name: string
    note?: string | null
    lesson_date: string
    class_name: string
    template_name: string
  }>
  recent_lessons: Array<{
    lesson_date: string
    class_name: string
    template_name: string
    attendance: string | null
    scores: Array<{ item_name: string; value: string }>
  }>
}

export type ParentLessonListItem = {
  lesson_id: number
  lesson_date: string
  class_name: string
  template_name: string
}

export type ParentNoticeItem = {
  batch_id: number
  sent_at: string
  body: string
}

function unwrapData<T>(input: unknown): T {
  let cur: unknown = input
  for (let i = 0; i < 4; i += 1) {
    if (cur && typeof cur === 'object' && 'data' in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>).data
      continue
    }
    break
  }
  return cur as T
}

export const parentDashboardService = {
  async getByToken(token: string, lessonId?: number): Promise<ParentDashboardData> {
    const { data } = await publicAxios.get(`/parent/${encodeURIComponent(token)}`, {
      params: lessonId ? { lesson: lessonId } : undefined,
    })
    return unwrapData<ParentDashboardData>(data)
  },

  async listLessons(token: string, page = 1): Promise<{ lessons: ParentLessonListItem[]; has_more: boolean }> {
    const { data } = await publicAxios.get(`/parent/${encodeURIComponent(token)}/lessons`, {
      params: { page },
    })
    return unwrapData<{ lessons: ParentLessonListItem[]; has_more: boolean }>(data)
  },

  async listNotices(token: string): Promise<{ notices: ParentNoticeItem[] }> {
    const { data } = await publicAxios.get(`/parent/${encodeURIComponent(token)}/notices`)
    return unwrapData<{ notices: ParentNoticeItem[] }>(data)
  },

  async listReports(token: string): Promise<{ reports: ParentReportListItem[] }> {
    const { data } = await publicAxios.get(`/parent/${encodeURIComponent(token)}/reports`)
    return unwrapData<{ reports: ParentReportListItem[] }>(data)
  },

  async getReport(token: string, reportId: number): Promise<ParentReportDetail> {
    const { data } = await publicAxios.get(`/parent/${encodeURIComponent(token)}/reports/${reportId}`)
    return unwrapData<ParentReportDetail>(data)
  },
}

