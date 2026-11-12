import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { homeworkPhotoService } from '@/services/homeworkPhoto'
import { hwKeys } from '@/lib/homeworkPhoto/queryKeys'
import { useToastStore } from '@/stores/toastStore'
import type { HwConsentBody, HwStudentState } from '@/types/homeworkPhoto'

export type StudentHomeworkPhoto = {
  /** 동의와 링크 상태. 아직 못 읽었거나 읽지 못하면 null이고, 그때 카드는 보이지 않는다. */
  state: HwStudentState | null
  /** 바꾸는 중(다시 읽기까지). 두 카드의 버튼을 모두 막는다. */
  busy: boolean
  /** 동의 기록·철회. 성공하면 true */
  setConsent: (body: HwConsentBody) => Promise<boolean>
  /** 링크를 만들고 학생에게 보낼 주소를 돌려준다. 실패하면 null */
  createLink: () => Promise<string | null>
  /** 링크 끊기. 성공하면 true */
  revokeLink: () => Promise<boolean>
}

const CONSENT_FAIL: Record<HwConsentBody['action'], string> = {
  RECORD: '동의를 기록하지 못했어요.',
  WITHDRAW: '동의를 철회하지 못했어요.',
}

/** mutateAsync가 성공했는지만 돌려준다(실패 토스트는 onError가 띄운다). */
async function succeeded(run: Promise<unknown>): Promise<boolean> {
  try {
    await run
    return true
  } catch {
    return false
  }
}

/**
 * 학생 상세의 사진 숙제 동의와 제출 링크(GET /students/:id/homework-photo).
 * 기능을 꺼 두어도 읽는다(남은 동의를 철회하고 링크를 끊을 수 있게).
 */
export function useStudentHomeworkPhoto(studentId: number): StudentHomeworkPhoto {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const fail = (message: string) => () => addToast({ variant: 'error', message })
  const { data } = useQuery({
    queryKey: hwKeys.student(studentId),
    queryFn: () => homeworkPhotoService.getStudent(studentId),
    enabled: Number.isSafeInteger(studentId) && studentId > 0,
    // 학생이 링크를 열거나 내면 바뀌므로 들어올 때마다 다시 읽는다.
    refetchOnMount: 'always',
  })
  // 성공해도 실패해도 다시 읽고(동의는 수업 표의 AI 제안도 바꾼다), 다 읽을 때까지 버튼을 막는다.
  const refresh = () => queryClient.invalidateQueries({ queryKey: hwKeys.all })

  const consent = useMutation({
    mutationFn: (body: HwConsentBody) => homeworkPhotoService.setConsent(studentId, body),
    onError: (_error, body) => addToast({ variant: 'error', message: CONSENT_FAIL[body.action] }),
    onSettled: refresh,
  })
  const create = useMutation({
    mutationFn: () => homeworkPhotoService.createLink(studentId),
    // 링크 토큰은 만든 화면에서 한 번만 보인다. 결과를 캐시에 남기지 않는다.
    gcTime: 0,
    onError: fail('링크를 만들지 못했어요.'),
    onSettled: refresh,
  })
  const revoke = useMutation({
    mutationFn: () => homeworkPhotoService.revokeLink(studentId),
    onError: fail('링크를 끊지 못했어요.'),
    onSettled: refresh,
  })

  const createLink = async (): Promise<string | null> => {
    try {
      const created = await create.mutateAsync()
      create.reset()
      return created.url ?? `${window.location.origin}${created.path}`
    } catch {
      return null
    }
  }

  return {
    state: data ?? null,
    busy: consent.isPending || create.isPending || revoke.isPending,
    setConsent: (body) => succeeded(consent.mutateAsync(body)),
    createLink,
    revokeLink: () => succeeded(revoke.mutateAsync()),
  }
}
