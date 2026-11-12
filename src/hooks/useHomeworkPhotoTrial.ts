import { useQuery } from '@tanstack/react-query'
import { featureTrialService } from '@/services/featureTrials'

export type HomeworkPhotoTrial = {
  /** 선생님이 켰다 */
  enabled: boolean
  isLoading: boolean
}

/**
 * 사진 숙제 AI 확인을 쓸 수 있는지. AI 조교 화면과 같은 기능 체험 목록(['feature-trials'])을 읽는다.
 * 목록을 못 읽으면 꺼진 것으로 본다(새 화면을 보이지 않는다).
 */
export function useHomeworkPhotoTrial(): HomeworkPhotoTrial {
  const { data, isPending } = useQuery({
    queryKey: ['feature-trials'],
    queryFn: () => featureTrialService.list(),
  })
  const trial = data?.find((t) => t.key === 'HOMEWORK_PHOTO')
  return { enabled: trial?.enabled === true, isLoading: isPending }
}
