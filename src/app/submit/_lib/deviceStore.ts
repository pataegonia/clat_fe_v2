import { isSecretShape, randomSecret } from './randomSecret'

/**
 * 링크마다 따로 두는 기기 비밀과 본 안내(localStorage, 키 'homework-photo:v1:' + 링크 이름표).
 * 사생활 보호 모드처럼 저장소를 쓸 수 없으면 이번 방문 동안만 메모리에 둔다.
 */
const PREFIX = 'homework-photo:v1:'

const memory = new Map<string, string>()

function read(key: string): string | null {
  try {
    const stored = window.localStorage.getItem(key)
    if (stored !== null) return stored
  } catch {
    // 저장소를 쓸 수 없다: 메모리를 본다.
  }
  return memory.get(key) ?? null
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
    memory.delete(key)
  } catch {
    memory.set(key, value)
  }
}

function remove(key: string): void {
  memory.delete(key)
  try {
    window.localStorage.removeItem(key)
  } catch {
    // 메모리에서만 지운다.
  }
}

/** 저장한 기기 비밀. 모양이 틀린 값은 지우고 없는 것으로 본다. */
export function readSecret(k: string): string | null {
  const stored = read(PREFIX + k)
  if (stored === null) return null
  if (isSecretShape(stored)) return stored
  remove(PREFIX + k)
  return null
}

/**
 * 저장한 비밀이 있으면 그것을, 없으면 새로 만들어 먼저 저장한 뒤 돌려준다.
 * 저장한 비밀은 바꾸지 않는다. 같은 비밀로 다시 묶으면 서버가 받아 주므로,
 * 다시 눌러도 이 브라우저가 막히지 않는다.
 */
export function ensureSecret(k: string): string {
  const stored = readSecret(k)
  if (stored !== null) return stored
  const secret = randomSecret()
  write(PREFIX + k, secret)
  return secret
}

/** 없는 링크(404)일 때만 지운다. 그 비밀은 어느 링크에도 묶이지 않았다. */
export function removeSecret(k: string): void {
  remove(PREFIX + k)
}

/** 학생이 본 첫 안내: AI 줄까지 봤으면 'ai', 아니면 'basic' */
export type NoticeSeen = 'basic' | 'ai'

function noticeKey(k: string): string {
  return `${PREFIX}${k}:notice`
}

export function readNoticeSeen(k: string): NoticeSeen | null {
  const stored = read(noticeKey(k))
  return stored === 'basic' || stored === 'ai' ? stored : null
}

export function storeNoticeSeen(k: string, seen: NoticeSeen): void {
  write(noticeKey(k), seen)
}
