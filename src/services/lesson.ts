import axiosInstance from '@/lib/api/axiosInstance'
import type { CommonSuggestionsResponse } from '@/types/commonSuggestion'

export interface LessonSummary {
  id?: number | null
  lesson_record_id: number | null
  class_id: number
  class_name: string
  academy_name: string
  template_id: number
  template_name: string
  progress_rate: number
  input_count: number
  total_students: number
  status: 'DRAFT' | 'SAVED'
  is_adhoc: boolean
  alimtalk_sent?: boolean
  alimtalk_delivery_mode?: 'mock' | 'live' | null
}

export interface LessonItemDetail {
  id: number
  source?: 'template' | 'adhoc'
  name: string
  item_type: 'TEXT' | 'NUMBER' | 'SELECT' | 'COMPLETE' | 'ATTENDANCE' | 'SCORE'
  is_common: boolean
  include_in_message: boolean
  send_to_parent?: boolean
  send_to_student?: boolean
  is_partial?: boolean
  sort_order: number
  options?: { id: number; label: string; sort_order: number }[]
}

export interface LessonDetail {
  id: number
  class_id: number
  class_name: string
  academy_name: string
  template_id: number
  template_name: string
  lesson_date: string
  status: 'DRAFT' | 'SAVED'
  is_adhoc: boolean
  attendance_locked?: boolean
  attendance_extra_options?: Array<{ id: number; label: string; sort_order: number }>
  common_data: CommonDataItem[]
  student_data: StudentData[]
  guest_students?: Array<{ student_id: number; student_name: string }>
  excluded_student_ids?: number[]
  roster_student_ids?: number[]
  items: LessonItemDetail[]
  send_schedule?: LessonSendSchedule | null
  send_schedule_cancel_notice?: boolean
  send_schedule_cancelled?: boolean
  updated_at?: string
}

export interface LessonListResponse {
  data: LessonSummary[]
  meta: { total: number }
}

export interface CommonDataItem {
  template_item_id?: number
  adhoc_item_id?: number
  source?: 'template' | 'adhoc'
  value: string
}

export interface StudentDataItem {
  template_item_id?: number
  adhoc_item_id?: number
  source?: 'template' | 'adhoc'
  value: string
  is_completed?: boolean | null
}

export interface StudentData {
  student_id: number
  student_name?: string
  items: StudentDataItem[]
}

/** POST /lessons (UpsertLessonDto, no lesson_id) */
export interface CreateLessonBody {
  class_id: number
  template_id: number
  lesson_date: string
  is_adhoc: boolean
  status: 'DRAFT' | 'SAVED'
  common_data: CommonDataItem[]
  student_data: StudentData[]
}

/** PUT /lessons/:id body (UpdateLessonDto) */
export interface UpdateLessonBody {
  template_id?: number
  status?: 'DRAFT' | 'SAVED'
  common_data?: CommonDataItem[]
  student_data?: StudentData[]
}

/** 발송 전 규칙 검사 경고. 보내기 전에 보여 주기만 하고 발송은 막지 않는다. */
export type SendWarningCode =
  | 'EMPTY_ITEM'
  | 'ABSENT_WITH_SCORE'
  | 'SCORE_OVER_MAX'
  | 'MEANINGLESS_TEXT'

export interface SendWarning {
  code: SendWarningCode
  item_name: string | null
  message: string
}

export interface LessonPreviewRow {
  student_id: number
  student_name: string
  phone: string
  parent_phone: string
  parent_phone_2?: string
  message: string
  message_for_parent: string
  student_char_count?: number
  parent_char_count?: number
  warnings?: SendWarning[]
}

/** GET /lessons/:id/preview — envelope data field is { data: LessonPreviewRow[], common_warnings } */
export interface LessonPreviewResult {
  data: LessonPreviewRow[]
  /** 공통 항목 경고 (학생마다 같아서 한 번만 온다) */
  common_warnings?: SendWarning[]
}

export type LessonSendChannel = 'STUDENT' | 'PARENT' | 'BOTH'

export interface LessonSendSchedule {
  scheduled_at: string
  channel: LessonSendChannel
  student_ids: number[]
}

export interface LessonSendScheduleCard {
  lesson_record_id: number
  class_name: string
  lesson_date: string
  scheduled_at: string
  channel: LessonSendChannel
  student_count: number
}

export interface SendLessonResult {
  batch_id: number
  status: 'queued' | 'done'
  total_count: number
  delivery_mode: 'mock' | 'live'
}

export type ParentPreviewStatusValue = 'pending' | 'ready' | 'failed'

/** AI 피드백 LLM 검수에서 짚은 문장 (가드레일 2차) */
export interface FeedbackReviewIssue {
  type: 'CONTRADICTION' | 'UNSUPPORTED' | 'WRONG_SUBJECT'
  /** 피드백에 있는 문장 그대로 */
  sentence: string
  reason: string
}

/** null이면 검수 대상이 아니다(선생님이 쓰거나 고친 글, 아직 안 만든 글). unchecked는 "검수 못 함"이지 "문제 없음"이 아니다. */
export type FeedbackReviewStatus = 'passed' | 'flagged' | 'unchecked'

export interface ParentPreviewStatusItem {
  student_id: number
  status: ParentPreviewStatusValue
  stale: boolean
  unwritten?: boolean
  review_status?: FeedbackReviewStatus | null
  review_issue_count?: number
  review_issues?: FeedbackReviewIssue[]
}

export interface ParentPreviewStatusResult {
  lesson_updated_at: string
  feedback_mode?: 'AUTO' | 'ASSIST' | 'MANUAL'
  ready_count: number
  total_count: number
  items: ParentPreviewStatusItem[]
}

export interface ParentPreviewLessonSummary {
  attendance: string | null
  scores: Array<{ name: string; value: string }>
  extra_items: Array<{ name: string; value: string }>
}

export interface ParentPreviewResult {
  student_id: number
  student_name: string
  class_name: string
  academy_name: string
  lesson_date: string
  lesson_summary: ParentPreviewLessonSummary
  ai_feedback: string | null
  ai_feedback_status: ParentPreviewStatusValue
  stale: boolean
  feedback_mode?: 'AUTO' | 'ASSIST' | 'MANUAL'
  teacher_note?: string | null
  feedback_source?: 'AI' | 'ASSIST' | 'MANUAL'
  edited_at?: string | null
  show_ai_label?: boolean
  review?: { status: FeedbackReviewStatus; issues: FeedbackReviewIssue[] } | null
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

export interface CreateLessonAdhocItemBody {
  name: string
  is_common: boolean
  item_type?: 'TEXT' | 'SCORE' | 'SELECT' | 'COMPLETE'
  options?: string[]
}

/** POST .../send returns `{ data: SendLessonResult }` from service → double `data` with TransformInterceptor. */
function unwrapSendLessonResult(res: { data?: unknown }): SendLessonResult {
  const inner = res.data as SendLessonResult | { data: SendLessonResult } | undefined
  if (
    inner &&
    typeof inner === 'object' &&
    'data' in inner &&
    inner.data &&
    typeof inner.data === 'object' &&
    'batch_id' in inner.data
  ) {
    return inner.data
  }
  return inner as SendLessonResult
}

/** GET /lessons — TransformInterceptor 이중 data 래핑 대응 */
function unwrapLessonListResponse(res: { data?: unknown }): LessonListResponse {
  const inner = res.data as LessonListResponse | { data: LessonSummary[]; meta?: { total: number } } | undefined
  if (inner && typeof inner === 'object' && Array.isArray(inner.data)) {
    return {
      data: inner.data,
      meta: inner.meta ?? { total: inner.data.length },
    }
  }
  if (inner && typeof inner === 'object' && 'data' in inner) {
    const nested = (inner as { data: LessonListResponse | LessonSummary[] }).data
    if (nested && typeof nested === 'object' && Array.isArray((nested as LessonListResponse).data)) {
      const list = nested as LessonListResponse
      return { data: list.data, meta: list.meta ?? { total: list.data.length } }
    }
  }
  return { data: [], meta: { total: 0 } }
}

export type LessonPollUnchanged = { unchanged: true; updated_at: string }

async function getLesson(id: number): Promise<LessonDetail>
async function getLesson(
  id: number,
  opts: { updatedAfter: string },
): Promise<LessonDetail | LessonPollUnchanged>
async function getLesson(
  id: number,
  opts?: { updatedAfter?: string },
): Promise<LessonDetail | LessonPollUnchanged> {
  const { data } = await axiosInstance.get(`/lessons/${id}`, {
    params: opts?.updatedAfter ? { updated_after: opts.updatedAfter } : undefined,
  })
  return data.data
}

export const lessonService = {
  async getLessons(date: string): Promise<LessonListResponse> {
    const { data } = await axiosInstance.get('/lessons', { params: { date } })
    return unwrapLessonListResponse(data)
  },

  getLesson,

  async createLesson(dto: CreateLessonBody): Promise<LessonDetail> {
    const { data } = await axiosInstance.post('/lessons', dto)
    return data.data
  },

  async updateLesson(lessonId: number, dto: UpdateLessonBody): Promise<LessonDetail> {
    const { data } = await axiosInstance.put(`/lessons/${lessonId}`, dto)
    return data.data
  },

  async saveLesson(id: number): Promise<void> {
    await axiosInstance.post(`/lessons/${id}/save`)
  },

  async previewLesson(id: number): Promise<LessonPreviewResult> {
    const { data } = await axiosInstance.get(`/lessons/${id}/preview`)
    return data.data as LessonPreviewResult
  },

  async sendLesson(
    lessonId: number,
    studentIds: number[],
    channel: LessonSendChannel = 'BOTH',
  ): Promise<SendLessonResult> {
    const { data } = await axiosInstance.post(`/lessons/${lessonId}/send`, {
      student_ids: studentIds,
      channel,
    })
    return unwrapSendLessonResult(data)
  },

  async listSendSchedules(): Promise<LessonSendScheduleCard[]> {
    const { data } = await axiosInstance.get('/lessons/send-schedules')
    const body = data.data as { data?: LessonSendScheduleCard[] } | LessonSendScheduleCard[]
    if (Array.isArray(body)) return body
    return body.data ?? []
  },

  async createSendSchedule(
    lessonId: number,
    studentIds: number[],
    channel: LessonSendChannel,
    scheduledAt: string,
  ): Promise<{ send_schedule: LessonSendSchedule; updated_at: string }> {
    const { data } = await axiosInstance.post(`/lessons/${lessonId}/send-schedule`, {
      student_ids: studentIds,
      channel,
      scheduled_at: scheduledAt,
    })
    return data.data as { send_schedule: LessonSendSchedule; updated_at: string }
  },

  async cancelSendSchedule(
    lessonId: number,
  ): Promise<{ send_schedule: null; updated_at: string }> {
    const { data } = await axiosInstance.delete(`/lessons/${lessonId}/send-schedule`, {
      data: {},
    })
    return data.data as { send_schedule: null; updated_at: string }
  },

  async dismissSendScheduleNotice(
    lessonId: number,
  ): Promise<{ send_schedule_cancel_notice: false; updated_at: string }> {
    const { data } = await axiosInstance.delete(`/lessons/${lessonId}/send-schedule-notice`, {
      data: {},
    })
    return data.data as { send_schedule_cancel_notice: false; updated_at: string }
  },

  async enqueueParentPreview(
    lessonId: number,
    studentIds: number[],
    force = false,
  ): Promise<{ queued_count: number; skipped_count: number }> {
    const { data } = await axiosInstance.post(`/lessons/${lessonId}/parent-preview`, {
      student_ids: studentIds,
      force,
    })
    return (data.data ?? data) as { queued_count: number; skipped_count: number }
  },

  async getParentPreviewStatus(
    lessonId: number,
    studentIds: number[],
  ): Promise<ParentPreviewStatusResult> {
    const { data } = await axiosInstance.get(`/lessons/${lessonId}/parent-preview/status`, {
      params: studentIds.length ? { student_ids: studentIds.join(',') } : undefined,
    })
    return (data.data ?? data) as ParentPreviewStatusResult
  },

  async saveParentPreview(
    lessonId: number,
    studentId: number,
    body: { teacher_note?: string | null; ai_feedback?: string | null },
  ): Promise<ParentPreviewResult> {
    const { data } = await axiosInstance.put(
      `/lessons/${lessonId}/parent-preview/${studentId}`,
      body,
    )
    return (data.data ?? data) as ParentPreviewResult
  },

  async getParentPreview(lessonId: number, studentId: number): Promise<ParentPreviewResult> {
    const { data } = await axiosInstance.get(`/lessons/${lessonId}/parent-preview`, {
      params: { student_id: studentId },
    })
    return (data.data ?? data) as ParentPreviewResult
  },

  async deleteLesson(id: number): Promise<void> {
    await axiosInstance.delete(`/lessons/${id}`)
  },

  async getCommonSuggestions(lessonId: number): Promise<CommonSuggestionsResponse> {
    const { data } = await axiosInstance.get(`/lessons/${lessonId}/common-suggestions`)
    const payload = data.data as CommonSuggestionsResponse | { items: CommonSuggestionsResponse['items'] }
    if (payload && Array.isArray(payload.items)) {
      return { items: payload.items }
    }
    return { items: [] }
  },

  async addLessonItem(lessonId: number, body: CreateLessonAdhocItemBody): Promise<LessonItemDetail> {
    const { data } = await axiosInstance.post(`/lessons/${lessonId}/lesson-items`, body)
    return data.data ?? data
  },

  async removeLessonItem(lessonId: number, itemId: number): Promise<void> {
    await axiosInstance.delete(`/lessons/${lessonId}/lesson-items/${itemId}`)
  },

  async excludeTemplateItem(lessonId: number, templateItemId: number): Promise<void> {
    await axiosInstance.post(`/lessons/${lessonId}/lesson-items/${templateItemId}/exclude`)
  },

  async updateItemOrder(
    lessonId: number,
    body: { items: Array<{ source: 'template' | 'adhoc'; id: number }> },
  ): Promise<LessonItemDetail[]> {
    const { data } = await axiosInstance.put(`/lessons/${lessonId}/item-order`, body)
    const payload = data.data as { items?: LessonItemDetail[] } | LessonItemDetail[]
    if (Array.isArray(payload)) return payload
    return payload.items ?? []
  },

  async setItemPartial(
    lessonId: number,
    body: { source: 'template' | 'adhoc'; id: number; is_partial: boolean },
  ): Promise<LessonItemDetail[]> {
    const { data } = await axiosInstance.put(`/lessons/${lessonId}/item-partial`, body)
    const payload = data.data as { items?: LessonItemDetail[] } | LessonItemDetail[]
    if (Array.isArray(payload)) return payload
    return payload.items ?? []
  },

  async addLessonStudents(
    lessonId: number,
    studentIds: number[],
  ): Promise<{ added_count: number; students: Array<{ student_id: number; student_name: string }> }> {
    const { data } = await axiosInstance.post(`/lessons/${lessonId}/students`, {
      student_ids: studentIds,
    })
    const payload = data.data as
      | { added_count: number; students: Array<{ student_id: number; student_name: string }> }
      | undefined
    return {
      added_count: payload?.added_count ?? 0,
      students: payload?.students ?? [],
    }
  },

  async removeLessonStudent(
    lessonId: number,
    studentId: number,
  ): Promise<{ student_id: number; student_name: string }> {
    const { data } = await axiosInstance.delete(`/lessons/${lessonId}/students/${studentId}`)
    const payload = data.data as { student_id: number; student_name: string } | undefined
    return {
      student_id: payload?.student_id ?? studentId,
      student_name: payload?.student_name ?? '',
    }
  },

  async addAttendanceOption(
    lessonId: number,
    label: string,
  ): Promise<{ id: number; label: string; sort_order: number }> {
    const { data } = await axiosInstance.post(`/lessons/${lessonId}/attendance-options`, {
      label,
    })
    return data.data ?? data
  },

  async removeAttendanceOption(
    lessonId: number,
    optionId: number,
  ): Promise<{ success: boolean; cleared_count: number }> {
    const { data } = await axiosInstance.delete(
      `/lessons/${lessonId}/attendance-options/${optionId}`,
    )
    return data.data ?? data
  },
}
