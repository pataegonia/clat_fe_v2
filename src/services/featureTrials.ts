import axiosInstance from '@/lib/api/axiosInstance'

/** 기능 체험 (GET /feature-trials, PUT /feature-trials/:key). 선생님마다 켜고 끄며, 바꾸면 바로 적용된다. */

export type FeatureTrialKey = 'STYLE_LEARNING'

export interface FeatureTrial {
  key: FeatureTrialKey
  enabled: boolean
}

export const featureTrialService = {
  async list(): Promise<FeatureTrial[]> {
    const { data } = await axiosInstance.get('/feature-trials')
    return (data.data ?? data) as FeatureTrial[]
  },

  async setEnabled(key: FeatureTrialKey, enabled: boolean): Promise<FeatureTrial> {
    const { data } = await axiosInstance.put(`/feature-trials/${key}`, { enabled })
    return (data.data ?? data) as FeatureTrial
  },
}
