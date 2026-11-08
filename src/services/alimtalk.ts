import axiosInstance from '@/lib/api/axiosInstance'
import type { SendWarning } from '@/services/lesson'

export type AlimtalkDeliveryMode = 'mock' | 'live'
export type AlimtalkMessageStatus = 'PENDING' | 'SUCCESS' | 'FAIL'
export type AlimtalkBatchRunStatus = 'queued' | 'sending' | 'done' | 'partial_fail'

export interface AlimtalkSettings {
  intro_text: string | null
  outro_text: string | null
  delivery_mode: AlimtalkDeliveryMode
}

export interface PutAlimtalkSettingsDto {
  intro_text?: string | null
  outro_text?: string | null
}

/** API envelope: { success, data: AlimtalkSettings }. Legacy BE nested an extra `{ data: settings }` inside. */
function unwrapAlimtalkSettings(res: { data?: unknown }): AlimtalkSettings {
  const inner = res.data as AlimtalkSettings | { data: AlimtalkSettings } | undefined
  if (inner && typeof inner === 'object' && 'data' in inner && inner.data && typeof inner.data === 'object') {
    const nested = inner.data as AlimtalkSettings
    if ('delivery_mode' in nested) return nested
  }
  return inner as AlimtalkSettings
}

export type AlimtalkBatchType = 'LESSON' | 'ATTENDANCE' | 'BROADCAST' | 'TEST' | 'REPORT'

export type AlimtalkTestKind = 'LESSON' | 'ATTENDANCE' | 'BROADCAST'

export interface AlimtalkTestStatus {
  phone: string | null
  remaining: number
  limit: number
  delivery_mode: AlimtalkDeliveryMode
}

export type BroadcastChannel = 'STUDENT' | 'PARENT' | 'BOTH'

export type BroadcastNoticeType = 'MAKEUP' | 'SCHEDULE' | 'PREP' | 'PROGRESS'

export interface AlimtalkBatchListItem {
  batch_id: number
  type: AlimtalkBatchType
  delivery_mode: AlimtalkDeliveryMode
  sent_at: string
  total_count: number
  success_count: number
  fail_count: number
  lesson_record_id: number | null
  attendance_session_id: number | null
  body_text?: string | null
  notice_type?: BroadcastNoticeType | null
  class_name: string | null
  template_name: string | null
}

export interface AlimtalkBatchesMeta {
  total: number
  page: number
  limit: number
}

export interface AlimtalkBatchMessage {
  message_id: number
  student_id: number | null
  student_name: string
  phone_type: 'STUDENT' | 'PARENT'
  phone: string
  message_body: string
  status: AlimtalkMessageStatus
  error_message: string | null
  parent_dashboard_token: string | null
  token_expires_at: string | null
  ai_feedback: string | null
}

export interface AlimtalkBatchDetail {
  batch_id: number
  type: AlimtalkBatchType
  delivery_mode: AlimtalkDeliveryMode
  sent_at: string
  total_count: number
  success_count: number
  fail_count: number
  status: AlimtalkBatchRunStatus
  sent_count: number
  lesson_record_id: number | null
  attendance_session_id: number | null
  body_text?: string | null
  notice_type?: BroadcastNoticeType | null
  messages: AlimtalkBatchMessage[]
}

export interface BroadcastSendResult {
  batch_id: number
  status: 'queued' | 'done'
  total_count: number
  delivery_mode: AlimtalkDeliveryMode
}

function unwrapBatchList(res: { data?: unknown }): {
  data: AlimtalkBatchListItem[]
  meta: AlimtalkBatchesMeta
} {
  const empty: { data: AlimtalkBatchListItem[]; meta: AlimtalkBatchesMeta } = {
    data: [],
    meta: { total: 0, page: 1, limit: 20 },
  }
  const inner = res.data
  if (Array.isArray(inner)) {
    return { data: inner, meta: { total: inner.length, page: 1, limit: inner.length } }
  }
  if (!inner || typeof inner !== 'object') return empty

  const obj = inner as { data?: unknown; meta?: AlimtalkBatchesMeta }
  if (Array.isArray(obj.data)) {
    return {
      data: obj.data,
      meta: obj.meta ?? { total: obj.data.length, page: 1, limit: obj.data.length },
    }
  }
  if (obj.data && typeof obj.data === 'object' && 'data' in obj.data) {
    const nested = obj.data as { data?: AlimtalkBatchListItem[]; meta?: AlimtalkBatchesMeta }
    if (Array.isArray(nested.data)) {
      return {
        data: nested.data,
        meta: nested.meta ?? { total: nested.data.length, page: 1, limit: nested.data.length },
      }
    }
  }
  return empty
}

function unwrapBatchDetail(res: { data?: unknown }): AlimtalkBatchDetail {
  const inner = res.data as AlimtalkBatchDetail | { data: AlimtalkBatchDetail } | undefined
  if (
    inner &&
    typeof inner === 'object' &&
    'data' in inner &&
    inner.data &&
    typeof inner.data === 'object' &&
    'batch_id' in inner.data &&
    'messages' in inner.data
  ) {
    return inner.data as AlimtalkBatchDetail
  }
  return inner as AlimtalkBatchDetail
}

export const alimtalkService = {
  async getSettings(): Promise<AlimtalkSettings> {
    const { data } = await axiosInstance.get('/alimtalk/settings')
    return unwrapAlimtalkSettings(data)
  },

  async putSettings(dto: PutAlimtalkSettingsDto): Promise<AlimtalkSettings> {
    const { data } = await axiosInstance.put('/alimtalk/settings', dto)
    return unwrapAlimtalkSettings(data)
  },

  async getBatches(params?: {
    page?: number
    limit?: number
    type?: AlimtalkBatchType
    class_id?: number
    from?: string
    to?: string
  }): Promise<{ data: AlimtalkBatchListItem[]; meta: AlimtalkBatchesMeta }> {
    const { data } = await axiosInstance.get('/alimtalk/batches', { params })
    return unwrapBatchList(data)
  },

  async getBatchDetail(batchId: number): Promise<AlimtalkBatchDetail> {
    const { data } = await axiosInstance.get(`/alimtalk/batches/${batchId}`)
    return unwrapBatchDetail(data)
  },

  async sendBroadcast(dto: {
    student_ids: number[]
    channel: BroadcastChannel
    notice_type: BroadcastNoticeType
    body: string
  }): Promise<BroadcastSendResult> {
    const { data } = await axiosInstance.post('/alimtalk/broadcast', dto)
    const inner = data.data as BroadcastSendResult | { data: BroadcastSendResult } | undefined
    if (inner && typeof inner === 'object' && 'data' in inner && inner.data) {
      return inner.data as BroadcastSendResult
    }
    return inner as BroadcastSendResult
  },

  /** 전체 공지 발송 전 규칙 검사. 경고가 있어도 발송은 막지 않는다. */
  async checkBroadcast(body: string): Promise<SendWarning[]> {
    const { data } = await axiosInstance.post('/alimtalk/broadcast/check', { body })
    const inner = (data?.data ?? data) as { warnings?: SendWarning[] } | undefined
    return inner?.warnings ?? []
  },

  async getTestStatus(): Promise<AlimtalkTestStatus> {
    const { data } = await axiosInstance.get('/alimtalk/test')
    return (data.data ?? data) as AlimtalkTestStatus
  },

  async sendTest(dto: {
    kind: AlimtalkTestKind
    notice_type?: BroadcastNoticeType
    lesson?: {
      content?: string
      attendance?: string
      score?: string
      score_max?: string
      homework?: '완료' | '미완료'
    }
  }): Promise<BroadcastSendResult & { remaining: number }> {
    const { data } = await axiosInstance.post('/alimtalk/test', dto)
    return (data.data ?? data) as BroadcastSendResult & { remaining: number }
  },
}

const BATCH_POLL_MS = 2_000
const BATCH_POLL_LIMIT_MS = 10 * 60 * 1000

export async function pollBatchUntilSettled(
  batchId: number,
  onProgress: (sent: number, total: number) => void,
): Promise<AlimtalkBatchDetail> {
  const deadline = Date.now() + BATCH_POLL_LIMIT_MS
  for (;;) {
    const detail = await alimtalkService.getBatchDetail(batchId)
    onProgress(detail.sent_count, detail.total_count)
    if (detail.status === 'done' || detail.status === 'partial_fail') return detail
    if (Date.now() >= deadline) throw new Error('BATCH_POLL_TIMEOUT')
    await new Promise((resolve) => setTimeout(resolve, BATCH_POLL_MS))
  }
}
