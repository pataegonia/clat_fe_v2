import { isAxiosError } from '@/lib/api/http'
import { publicErrorMessage } from '@/services/homeworkPhotoPublic'

/** 서버 문구가 없을 때(네트워크 오류·시간 초과 등) */
export const NETWORK_MESSAGE = '인터넷 연결을 확인하고 다시 눌러 주세요'

/** 기기 비밀이 어느 링크에도 묶여 있지 않다(404) */
export const LINK_NOT_FOUND = 'HOMEWORK_PHOTO_LINK_NOT_FOUND'

/** HTTP 상태. 응답이 없으면(네트워크 오류·시간 초과) null */
export function errorStatus(e: unknown): number | null {
  return isAxiosError(e) ? (e.response?.status ?? null) : null
}

export function errorCode(e: unknown): string | null {
  if (!isAxiosError<{ error?: { code?: unknown } }>(e)) return null
  const code = e.response?.data?.error?.code
  return typeof code === 'string' ? code : null
}

/** 다시 해 볼 만한 실패: 네트워크 오류·시간 초과, 429, 5xx */
export function isRetryable(e: unknown): boolean {
  const status = errorStatus(e)
  return status === null || status === 429 || status >= 500
}

/** 서버 공통 IP 분당 제한(429)은 영어 문구라 이 글로 보인다. 이 기능의 429(하루 한도)는 서버 문구 그대로다. */
const THROTTLED_MESSAGE = '잠시 뒤 다시 해 주세요.'

/** 학생에게 보일 문구: 서버 error.message, 없으면 인터넷 연결 안내 */
export function errorMessage(e: unknown): string {
  if (errorStatus(e) === 429 && !errorCode(e)?.startsWith('HOMEWORK_PHOTO_')) {
    return THROTTLED_MESSAGE
  }
  return publicErrorMessage(e) ?? NETWORK_MESSAGE
}
