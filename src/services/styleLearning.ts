import axiosInstance from '@/lib/api/axiosInstance'

/** AI가 내 말투 배우기(기능 체험, /style-learning). 선생님만 본다. 숫자는 모두 서버가 센다. */

/** OFF: AI 키가 없음 / WAITING: 하루 몫을 넘게 써서 resume_at에 이어서 배운다 */
export type StyleLearningStatus = 'OFF' | 'IDLE' | 'RUNNING' | 'WAITING' | 'FAILED'

export interface StyleHabit {
  id: number
  text: string
}

/** 그대로 보낸 비율의 한쪽(배우기 전 또는 배운 뒤). 보낸 글이 적으면 rate는 null */
export interface StyleEffectSide {
  sent: number
  unchanged: number
  rate: number | null
}

/** 고친 글 원문은 주지 않는다. */
export interface StyleLearningState {
  pair_count: number
  /** 지운 학생·반의 고친 글까지 모은 기록이 하나라도 있으면 true(모은 기록 지우기를 쓸 수 있다) */
  has_records: boolean
  min_pairs: number
  max_habits: number
  habits: StyleHabit[]
  learned_at: string | null
  learning: { status: StyleLearningStatus; resume_at: string | null }
  /** 꺼져 있거나 배운 적이 없으면 null */
  effect: { before: StyleEffectSide; after: StyleEffectSide } | null
}

export const styleLearningService = {
  async get(): Promise<StyleLearningState> {
    const { data } = await axiosInstance.get('/style-learning')
    return (data.data ?? data) as StyleLearningState
  },

  /** 다시 배우기. 짝이 모자라거나 습관이 꽉 찼으면 400 */
  async relearn(): Promise<StyleLearningState> {
    const { data } = await axiosInstance.post('/style-learning/relearn')
    return (data.data ?? data) as StyleLearningState
  },

  async removeHabit(id: number): Promise<StyleLearningState> {
    const { data } = await axiosInstance.delete(`/style-learning/habits/${id}`)
    return (data.data ?? data) as StyleLearningState
  },

  /** 모은 기록 지우기: 짝과 습관(지운 것 포함)을 모두 지운다. */
  async clear(): Promise<StyleLearningState> {
    const { data } = await axiosInstance.delete('/style-learning')
    return (data.data ?? data) as StyleLearningState
  },
}
