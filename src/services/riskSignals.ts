import axiosInstance from '@/lib/api/axiosInstance'

/** 살펴볼 학생(위험 감지, GET /risk-signals). 선생님만 본다. 학부모에게는 어떤 형태로도 보이지 않는다. */

export type RiskCategory = 'LEARNING' | 'ENGAGEMENT'
export type RiskDecision = 'ACKNOWLEDGED' | 'NOT_APPLICABLE'

export interface RiskSignal {
  code: string
  category: RiskCategory
  message: string
  dates: string[]
  evidence_key: string
  class_id: number | null
  class_name: string | null
  review: { decision: RiskDecision; reviewed_at: string } | null
}

export interface RiskSignalList {
  period: { from: string; to: string }
  students: Array<{ student_id: number; name: string; signals: RiskSignal[] }>
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
