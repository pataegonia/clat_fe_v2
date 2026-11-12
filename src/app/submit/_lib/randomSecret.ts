/** 링크 토큰과 기기 비밀의 모양: 32바이트를 base64url로 쓴 43자 */
const SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function isSecretShape(value: string): boolean {
  return SECRET_PATTERN.test(value)
}

/**
 * 이 브라우저의 기기 비밀(32바이트 난수, base64url 43자).
 * crypto.getRandomValues는 http://<LAN IP> 같은 안전하지 않은 주소에서도 된다
 * (randomUUID·subtle과 다르다).
 */
export function randomSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
