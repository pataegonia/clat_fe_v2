/**
 * 링크 토큰으로 만드는 브라우저 저장소 이름표(16자 hex). 비밀이 아니다.
 * 주소창에 토큰 대신 ?k=로 남겨, 새로 고침과 형제 링크(한 휴대폰에 링크 여러 개)를
 * 구분하는 데만 쓴다.
 */

/** FNV-1a 32비트 */
function fnv1a32(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function hex8(value: number): string {
  return value.toString(16).padStart(8, '0')
}

export function linkKey(token: string): string {
  return hex8(fnv1a32(token)) + hex8(fnv1a32(`${token}#`))
}

const LINK_KEY_PATTERN = /^[0-9a-f]{16}$/

export function isLinkKey(value: string): boolean {
  return LINK_KEY_PATTERN.test(value)
}
