import { useEffect, useRef, useState } from 'react'
import { homeworkPhotoPublicService } from '@/services/homeworkPhotoPublic'
import { retakeText } from '@/lib/homeworkPhoto/labels'
import type { HwCreateSubmissionBody, HwPublicMe, HwPublicSubmission } from '@/types/homeworkPhoto'
import {
  LINK_NOT_FOUND,
  errorCode,
  errorMessage,
  errorStatus,
  isRetryable,
} from '../_lib/publicError'
import { resizeImage } from '../_lib/resizeImage'
import type { SubmitTarget } from '../_lib/targetLabel'

/** 결과 화면: 확인하는 동안 3초마다 다시 묻고, 90초가 지나면 '냈어요'로 끝낸다. */
const POLL_INTERVAL_MS = 3_000
const POLL_MAX_MS = 90_000

const DECODE_FAILED = '이 사진은 열 수 없어요. 다른 사진을 골라 주세요'

/** 넣을 수 있는 장수를 넘었을 때 */
export function tooManyPhotosText(maxPhotos: number): string {
  return `사진은 ${maxPhotos}장까지 넣을 수 있어요`
}

export type ComposedPhoto = { id: number; blob: Blob }

/** 결과 화면에 보일 것. AI 판정과 완성도는 학생에게 보이지 않는다. */
export type ResultView =
  | { kind: 'checking' }
  | { kind: 'retake'; lines: string[] }
  | { kind: 'done' }

export type SubmitResult = {
  submissionId: string
  /** 낸 숙제(예: '수요일 수업 숙제 · p.42~43') */
  label: string
  startedAt: number
  view: ResultView
}

/** 서버에 만든 초안과 거기에 이미 올린 사진 */
type Draft = { id: string; targetKey: string; uploadedIds: number[] }

type Options = {
  secret: string | null
  maxPhotos: number
  /** 제출 직전에 다시 읽은 /me를 넘긴다. 안내(AI 줄)를 먼저 확인해야 하면 false가 온다. */
  acceptMe: (me: HwPublicMe) => boolean
  /** 링크가 막혔다(401·403·없는 링크) */
  onBlocked: () => void
}

function resultView(submission: HwPublicSubmission): ResultView {
  if (submission.state === 'CHECKING') return { kind: 'checking' }
  if (submission.state === 'RETAKE' && submission.retake.length > 0) {
    const lines = submission.retake.map((item) => retakeText(item, submission.photo_count))
    return { kind: 'retake', lines }
  }
  return { kind: 'done' }
}

function draftBody(target: SubmitTarget): HwCreateSubmissionBody {
  if (target.lateId === null) return { class_id: target.classId, target: target.kind }
  return {
    class_id: target.classId,
    target: target.kind,
    late_lesson_student_data_id: target.lateId,
  }
}

/** 이미 들어간 제출이면 그 상태를, 아직 초안이거나 읽지 못하면 null */
async function submittedOrNull(
  secret: string,
  submissionId: string
): Promise<HwPublicSubmission | null> {
  try {
    const submission = await homeworkPhotoPublicService.status(secret, submissionId)
    return submission.state === 'DRAFT' ? null : submission
  } catch {
    return null
  }
}

/**
 * 사진 고르기 → 초안 만들기 → 사진 차례로 올리기 → 제출 → 결과 확인(blueprint §8.5).
 * 네트워크 오류 뒤 다시 누르면 같은 초안에 이어서 올린다. 초안이 없어졌으면(404·409) 새로 만든다.
 */
export function useSubmissionFlow({ secret, maxPhotos, acceptMe, onBlocked }: Options) {
  const [targetKey, setTargetKey] = useState<string | null>(null)
  const [photos, setPhotos] = useState<ComposedPhoto[]>([])
  const [preparing, setPreparing] = useState(false)
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const draftRef = useRef<Draft | null>(null)
  const nextPhotoIdRef = useRef(1)

  const selectTarget = (key: string | null) => {
    if (sending) return
    // 다른 숙제를 고르면 앞서 만든 초안은 버린다(서버가 다음 날 지운다).
    if (draftRef.current?.targetKey !== key) draftRef.current = null
    setTargetKey(key)
    setError(null)
  }

  /** 고른 사진을 줄여 넣는다. 넣을 수 있는 장수를 넘으면 앞에서부터 넣을 수 있는 만큼만 넣는다. */
  const addFiles = async (files: File[]) => {
    if (preparing || sending || files.length === 0) return
    const room = Math.max(0, maxPhotos - photos.length)
    setError(files.length > room ? tooManyPhotosText(maxPhotos) : null)
    const picked = files.slice(0, room)
    if (picked.length === 0) return
    setPreparing(true)
    let added: ComposedPhoto[] = []
    let failed = false
    for (const file of picked) {
      try {
        const blob = await resizeImage(file)
        added = [...added, { id: nextPhotoIdRef.current, blob }]
        nextPhotoIdRef.current += 1
      } catch {
        failed = true
      }
    }
    setPhotos((prev) => [...prev, ...added].slice(0, maxPhotos))
    setPreparing(false)
    if (failed) setError(DECODE_FAILED)
  }

  const removePhoto = (id: number) => {
    if (sending) return
    // 이미 올린 사진을 빼면 그 초안으로 내지 않는다(뺀 사진이 같이 나가지 않게).
    if (draftRef.current?.uploadedIds.includes(id)) draftRef.current = null
    setPhotos((prev) => prev.filter((photo) => photo.id !== id))
    setError(null)
  }

  const send = async (
    deviceSecret: string,
    target: SubmitTarget,
    list: ComposedPhoto[],
    canRestart: boolean
  ): Promise<HwPublicSubmission> => {
    let draft = draftRef.current?.targetKey === target.key ? draftRef.current : null
    if (!draft) {
      const created = await homeworkPhotoPublicService.createSubmission(
        deviceSecret,
        draftBody(target)
      )
      draft = { id: created.submission_id, targetKey: target.key, uploadedIds: [] }
      draftRef.current = draft
    }
    let step: 'upload' | 'submit' = 'upload'
    try {
      for (const [index, photo] of list.entries()) {
        if (draft.uploadedIds.includes(photo.id)) continue
        setProgress({ current: index + 1, total: list.length })
        await homeworkPhotoPublicService.uploadPhoto(deviceSecret, draft.id, photo.blob, index + 1)
        draft = { ...draft, uploadedIds: [...draft.uploadedIds, photo.id] }
        draftRef.current = draft
      }
      setProgress(null)
      step = 'submit'
      const submitted = await homeworkPhotoPublicService.submit(deviceSecret, draft.id)
      draftRef.current = null
      return submitted
    } catch (e) {
      const status = errorStatus(e)
      const draftGone = status === 409 || (status === 404 && errorCode(e) !== LINK_NOT_FOUND)
      if (!draftGone) throw e
      draftRef.current = null
      if (step === 'submit' && status === 409) {
        // 앞서 누른 제출이 이미 들어갔다(응답만 받지 못했다). 다시 내지 않고 그 제출을 본다.
        const submitted = await submittedOrNull(deviceSecret, draft.id)
        if (submitted) return submitted
      }
      if (!canRestart) throw e
      return send(deviceSecret, target, list, false)
    }
  }

  const submit = async (target: SubmitTarget) => {
    if (!secret || sending || preparing || photos.length === 0) return
    const list = photos
    setSending(true)
    setError(null)
    try {
      // 그사이 AI 확인 동의가 생겼으면, 사진이 AI로 가기 전에 안내(AI 줄)를 먼저 보여야 한다.
      const me = await homeworkPhotoPublicService.me(secret)
      if (!acceptMe(me)) return
      const submitted = await send(secret, target, list, true)
      setPhotos([])
      setResult({
        submissionId: submitted.submission_id,
        label: target.label,
        startedAt: Date.now(),
        view: resultView(submitted),
      })
    } catch (e) {
      const status = errorStatus(e)
      if (status === 401 || status === 403 || (status === 404 && errorCode(e) === LINK_NOT_FOUND)) {
        onBlocked()
        return
      }
      setError(errorMessage(e))
    } finally {
      setSending(false)
      setProgress(null)
    }
  }

  const checkingId = result?.view.kind === 'checking' ? result.submissionId : null
  const startedAt = result?.startedAt ?? 0

  useEffect(() => {
    if (!checkingId || !secret) return
    let cancelled = false
    let timer: number | undefined
    const settle = (view: ResultView) => {
      setResult((prev) => (prev?.submissionId === checkingId ? { ...prev, view } : prev))
    }
    const poll = async () => {
      try {
        const submission = await homeworkPhotoPublicService.status(secret, checkingId)
        if (cancelled) return
        const view = resultView(submission)
        if (view.kind !== 'checking') {
          settle(view)
          return
        }
      } catch (e) {
        if (cancelled) return
        // 이미 낸 숙제다. 다시 물어도 안 되는 실패면 기다리지 않고 '냈어요'로 끝낸다.
        if (!isRetryable(e)) {
          settle({ kind: 'done' })
          return
        }
      }
      if (Date.now() - startedAt >= POLL_MAX_MS) {
        settle({ kind: 'done' })
        return
      }
      timer = window.setTimeout(poll, POLL_INTERVAL_MS)
    }
    timer = window.setTimeout(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [checkingId, startedAt, secret])

  const clearCompose = () => {
    draftRef.current = null
    setPhotos([])
    setError(null)
    setResult(null)
  }

  return {
    targetKey,
    photos,
    preparing,
    sending,
    progress,
    error,
    result,
    selectTarget,
    addFiles,
    removePhoto,
    submit,
    /** '다시 찍기': 같은 숙제로 새로 찍는다. */
    retake: clearCompose,
    /** 결과 화면에서 처음으로 */
    finish: () => {
      clearCompose()
      setTargetKey(null)
    },
  }
}

export type SubmissionFlow = ReturnType<typeof useSubmissionFlow>
