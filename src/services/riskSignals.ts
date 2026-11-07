import axiosInstance from '@/lib/api/axiosInstance'

/** 살펴볼 학생(위험 감지, GET /risk-signals). 선생님만 본다. 학부모에게는 어떤 형태로도 보이지 않는다. */

export type RiskCategory = 'LEARNING' | 'ENGAGEMENT'
export type RiskDecision = 'ACKNOWLEDGED' | 'NOT_APPLICABLE'

export interface RiskSignal {
  code: string
  category: RiskCategory
  /** RULE: 기록 숫자로 계산 / AI: AI가 수업 기록·메모를 읽고 찾음(틀릴 수 있다) */
  source: 'RULE' | 'AI'
  message: string
  dates: string[]
  evidence_key: string
  class_id: number | null
  class_name: string | null
  review: { decision: RiskDecision; reviewed_at: string } | null
}

/** AI가 수업 기록·메모를 읽는 진행 상태. WAITING이면 resume_at에 이어서 읽는다. */
export interface CommentAnalysisState {
  status: 'OFF' | 'DONE' | 'RUNNING' | 'WAITING'
  remaining: number
  /** AI가 읽지 못해 목록에서 빠진 글 수. 시간이 지나면 다시 읽는다. */
  failed: number
  resume_at: string | null
}

export interface RiskSignalList {
  period: { from: string; to: string }
  students: Array<{ student_id: number; name: string; signals: RiskSignal[] }>
  comment_analysis: CommentAnalysisState
}

export const riskSignalService = {
  async list(includeReviewed: boolean): Promise<RiskSignalList> {
    const { data } = await axiosInstance.get('/risk-signals', {
      params: includeReviewed ? { include_reviewed: true } : undefined,
    })
    return (data.data ?? data) as RiskSignalList
  },

  async review(body: {
    student_id: number
    code: string
    evidence_key: string
    decision: RiskDecision
  }): Promise<void> {
    await axiosInstance.post('/risk-signals/reviews', body)
  },
}
