'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useToastStore } from '@/stores/toastStore'
import { homeworkPhotoService } from '@/services/homeworkPhoto'
import { hwKeys } from '@/lib/homeworkPhoto/queryKeys'
import { HW_FEATURE_LABEL } from '@/lib/homeworkPhoto/labels'
import * as css from './featureTrial.css'

type PanelProps = {
  /** 선생님이 이 체험을 켰는지 */
  enabled: boolean
  /** 체험이 목록에 없을 때(운영에서 꺼 둠) 남은 사진을 지우는 칸만 둔다. 이때는 제목도 함께 보인다. */
  leftoverOnly?: boolean
}

/** 사진 모두 지우기. 되돌릴 수 없어 한 번 더 묻고, 닫은 뒤에 지운다. */
function ClearPhotosButton({ disabled, onClear }: { disabled: boolean; onClear: () => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(true)}
        disabled={disabled}
      >
        사진 모두 지우기
      </Button>
      <ConfirmModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          onClear()
        }}
        title="사진을 모두 지울까요?"
        descriptions={[
          '받은 숙제 사진과 AI가 읽은 결과가 모두 지워져요.',
          '숙제 칸에 저장한 값은 그대로예요.',
          '지운 뒤에는 되돌릴 수 없어요.',
        ]}
        confirmLabel="지우기"
        cancelLabel="취소"
        confirmVariant="danger"
      />
    </>
  )
}

/**
 * 기능 체험 "사진 숙제 AI 확인"의 상태 칸: 받은 사진 수와 사진 모두 지우기.
 * 지우기는 체험을 꺼 두어도 된다. 꺼져 있고 받은 사진도 없으면 아무것도 보이지 않는다.
 */
export function HomeworkPhotoPanel({ enabled, leftoverOnly = false }: PanelProps) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const { data, isPending } = useQuery({
    queryKey: hwKeys.status,
    queryFn: () => homeworkPhotoService.status(),
    // 학생이 낸 사진은 이 캐시를 바꾸지 않으므로 들어올 때마다 다시 읽는다.
    refetchOnMount: 'always',
  })
  const clear = useMutation({
    mutationFn: () => homeworkPhotoService.deleteAll(),
    onSuccess: () => addToast({ variant: 'success', message: '사진을 모두 지웠어요.' }),
    onError: () => addToast({ variant: 'error', message: '사진을 지우지 못했어요.' }),
    // 성공해도 실패해도 다시 읽고, 다 읽을 때까지 버튼을 막는다(promise를 돌려준다).
    onSettled: () => queryClient.invalidateQueries({ queryKey: hwKeys.all }),
  })

  // 남은 사진 칸은 체험 목록에 없는 기능이라 불러오는 중이거나 못 읽었을 때 아무것도 보이지 않는다.
  if (isPending) return leftoverOnly ? null : <Text color="gray500">불러오는 중…</Text>
  if (!data) {
    if (leftoverOnly) return null
    return (
      <Text color="error500">받은 사진 수를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</Text>
    )
  }
  if (!enabled && data.photo_count === 0) return null

  const panel = (
    <div className={css.panel}>
      <div className={css.photoRow}>
        <Text variant="bodyMd">{`받은 사진 ${data.photo_count}장`}</Text>
        <ClearPhotosButton
          disabled={data.photo_count === 0 || clear.isPending}
          onClear={() => clear.mutate()}
        />
      </div>
    </div>
  )
  if (!leftoverOnly) return panel
  return (
    <div className={css.trial}>
      <h3 className={css.trialTitle}>{HW_FEATURE_LABEL}</h3>
      {panel}
    </div>
  )
}
