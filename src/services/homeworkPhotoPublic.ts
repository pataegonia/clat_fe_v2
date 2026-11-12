import publicAxios from '@/lib/api/publicAxios'
import type {
  HwClaimBody,
  HwClaimResult,
  HwCreatedSubmission,
  HwCreateSubmissionBody,
  HwPublicMe,
  HwPublicSubmission,
  HwUploadedPhoto,
} from '@/types/homeworkPhoto'

/**
 * 사진 숙제 학생 API(/public/homework-photo, 로그인 없음). 학생 제출 화면(/submit)이 쓴다.
 * 모든 요청에 기기 비밀을 헤더로 붙인다(주소에 넣으면 오류 로그에 남는다).
 */

/** 기기 비밀 헤더(백엔드 DEVICE_HEADER) */
const DEVICE_HEADER = 'X-Homework-Device'
/** 사진 한 장 올리기 제한 시간 */
const UPLOAD_TIMEOUT_MS = 60_000

function deviceHeaders(secret: string) {
  return { [DEVICE_HEADER]: secret }
}

function submissionPath(submissionId: string) {
  return `/public/homework-photo/submissions/${encodeURIComponent(submissionId)}`
}

export const homeworkPhotoPublicService = {
  /** 링크 토큰을 이 브라우저의 기기 비밀에 묶는다. 같은 비밀로 다시 보내도 된다. */
  async claim(secret: string, token: string): Promise<HwClaimResult> {
    const body: HwClaimBody = { token }
    const { data } = await publicAxios.post('/public/homework-photo/claim', body, {
      headers: deviceHeaders(secret),
    })
    return (data.data ?? data) as HwClaimResult
  },

  async me(secret: string): Promise<HwPublicMe> {
    const { data } = await publicAxios.get('/public/homework-photo/me', {
      headers: deviceHeaders(secret),
    })
    return (data.data ?? data) as HwPublicMe
  },

  /** 낼 숙제(반, 오늘·다음·늦게)를 정해 제출을 시작한다(DRAFT). */
  async createSubmission(
    secret: string,
    body: HwCreateSubmissionBody
  ): Promise<HwCreatedSubmission> {
    const { data } = await publicAxios.post('/public/homework-photo/submissions', body, {
      headers: deviceHeaders(secret),
    })
    return (data.data ?? data) as HwCreatedSubmission
  },

  /**
   * 사진 한 장 올리기(multipart, 필드 file). Content-Type을 multipart로 밝혀야 한다:
   * publicAxios 기본값(JSON) 그대로면 axios가 FormData를 JSON으로 바꿔 파일이 빠진다.
   * 브라우저가 boundary를 붙인 값으로 바꿔 보낸다.
   */
  async uploadPhoto(
    secret: string,
    submissionId: string,
    blob: Blob,
    index: number
  ): Promise<HwUploadedPhoto> {
    const form = new FormData()
    form.append('file', blob, `photo-${index}.jpg`)
    const { data } = await publicAxios.post(`${submissionPath(submissionId)}/photos`, form, {
      headers: { ...deviceHeaders(secret), 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT_MS,
    })
    return (data.data ?? data) as HwUploadedPhoto
  },

  async submit(secret: string, submissionId: string): Promise<HwPublicSubmission> {
    const { data } = await publicAxios.post(`${submissionPath(submissionId)}/submit`, undefined, {
      headers: deviceHeaders(secret),
    })
    return (data.data ?? data) as HwPublicSubmission
  },

  async status(secret: string, submissionId: string): Promise<HwPublicSubmission> {
    const { data } = await publicAxios.get(submissionPath(submissionId), {
      headers: deviceHeaders(secret),
    })
    return (data.data ?? data) as HwPublicSubmission
  },
}

type ErrorResponse = { response?: { data?: { error?: { message?: unknown } } } }

/** 서버가 보낸 오류 문구(error.message). 없으면(네트워크 오류 등) null */
export function publicErrorMessage(e: unknown): string | null {
  const message = (e as ErrorResponse | null)?.response?.data?.error?.message
  return typeof message === 'string' && message.trim() !== '' ? message : null
}
