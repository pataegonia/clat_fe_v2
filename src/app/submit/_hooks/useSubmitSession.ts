import { useCallback, useEffect, useRef, useState } from 'react'
import { homeworkPhotoPublicService } from '@/services/homeworkPhotoPublic'
import type { HwPublicMe } from '@/types/homeworkPhoto'
import {
  ensureSecret,
  readNoticeSeen,
  readSecret,
  removeSecret,
  storeNoticeSeen,
  type NoticeSeen,
} from '../_lib/deviceStore'
import { isLinkKey, linkKey } from '../_lib/linkKey'
import { errorMessage, errorStatus } from '../_lib/publicError'
import { isSecretShape } from '../_lib/randomSecret'

export type SessionState =
  | { kind: 'loading' }
  /**
   * 이 브라우저가 아직 링크를 묶지 않았다.
   * 묶기가 네트워크 등으로 실패해도 여기 남아 다시 누를 수 있다.
   */
  | { kind: 'intro'; claiming: boolean; error: string | null }
  /** 토큰 없이 열었는데 이 링크로 묶인 적이 없다: '받은 링크를 다시 눌러 열어 주세요' */
  | { kind: 'reopen' }
  /** 쓸 수 없는 링크: '선생님께 새 링크를 받아 주세요' */
  | { kind: 'blocked' }
  /** /me를 읽지 못했다(네트워크·시간 초과·429·5xx): 문구와 '다시 시도' */
  | { kind: 'meError'; message: string }
  | { kind: 'ready'; me: HwPublicMe }

/** 처음 열 때 주소에서 읽은 것 */
type Boot = { token: string | null; k: string | null; badToken: boolean }

const SUBMIT_PATH = '/submit'

/**
 * 주소의 #t=토큰을 읽고 곧바로 주소에서 지운다(토큰은 메모리에만 둔다).
 * 토큰이 없으면 ?k=를 읽는다.
 */
function readLocation(): Boot {
  const token = new URLSearchParams(window.location.hash.slice(1)).get('t')
  if (token !== null) {
    if (!isSecretShape(token)) {
      window.history.replaceState(null, '', SUBMIT_PATH)
      return { token: null, k: null, badToken: true }
    }
    const k = linkKey(token)
    window.history.replaceState(null, '', `${SUBMIT_PATH}?k=${k}`)
    return { token, k, badToken: false }
  }
  const k = new URLSearchParams(window.location.search).get('k')
  return { token: null, k: k !== null && isLinkKey(k) ? k : null, badToken: false }
}

/** 안내를 보여야 하나: 아직 본 적이 없거나, AI 확인 동의가 생겼는데 AI 줄을 본 적이 없다 */
function noticeNeeded(me: HwPublicMe, seen: NoticeSeen | null): boolean {
  return seen === null || (me.ai_notice && seen !== 'ai')
}

/**
 * 학생 제출 화면의 링크 묶기와 /me(기획 §13, blueprint §8.5).
 * 기기 비밀은 링크마다 한 번만 만들고 그 뒤로는 다시 쓴다.
 * 같은 비밀로 다시 묶기는 서버가 받아 주므로,
 * 실패한 묶기를 다시 보내도 이 브라우저가 스스로 막히지 않는다.
 */
export function useSubmitSession() {
  const [state, setState] = useState<SessionState>({ kind: 'loading' })
  const [secret, setSecret] = useState<string | null>(null)
  const [noticeSeen, setNoticeSeen] = useState<NoticeSeen | null>(null)
  const bootRef = useRef<Boot | null>(null)
  /** 마지막에 시작한 요청만 화면을 바꾼다(먼저 시작한 요청의 늦은 응답은 버린다). */
  const opRef = useRef(0)

  const loadMe = useCallback(async (deviceSecret: string) => {
    const op = ++opRef.current
    setState({ kind: 'loading' })
    try {
      const me = await homeworkPhotoPublicService.me(deviceSecret)
      if (op === opRef.current) setState({ kind: 'ready', me })
    } catch (e) {
      if (op !== opRef.current) return
      const status = errorStatus(e)
      // 404: 묶기가 서버에 닿지 않았다. 비밀은 두고, 링크를 다시 열면 그 비밀로 묶는다.
      if (status === 404) setState({ kind: 'reopen' })
      else if (status === 401 || status === 403) setState({ kind: 'blocked' })
      else setState({ kind: 'meError', message: errorMessage(e) })
    }
  }, [])

  const claimWith = useCallback(
    async (token: string, k: string, deviceSecret: string, fromIntro: boolean) => {
      const op = ++opRef.current
      setSecret(deviceSecret)
      setState(fromIntro ? { kind: 'intro', claiming: true, error: null } : { kind: 'loading' })
      try {
        await homeworkPhotoPublicService.claim(deviceSecret, token)
      } catch (e) {
        if (op !== opRef.current) return
        const status = errorStatus(e)
        if (status === 404) {
          // 없는 링크: 이 비밀은 어디에도 묶이지 않았다.
          removeSecret(k)
          setSecret(null)
          setState({ kind: 'blocked' })
        } else if (status === 401 || status === 403) {
          // 묶인 비밀은 잠깐의 403(기능을 잠시 끈 때 등) 뒤에도 써야 하므로 지우지 않는다.
          setState({ kind: 'blocked' })
        } else {
          setState({ kind: 'intro', claiming: false, error: errorMessage(e) })
        }
        return
      }
      if (op === opRef.current) await loadMe(deviceSecret)
    },
    [loadMe]
  )

  useEffect(() => {
    // 개발 모드에서 effect가 두 번 돌아도 주소는 한 번만 읽는다
    // (두 번째에는 토큰이 이미 주소에 없다).
    if (!bootRef.current) bootRef.current = readLocation()
    const { token, k, badToken } = bootRef.current
    const stored = k ? readSecret(k) : null
    if (k) setNoticeSeen(readNoticeSeen(k))
    if (badToken) {
      setState({ kind: 'blocked' })
    } else if (token && k) {
      // 이 브라우저가 이미 '이 휴대폰으로 내기'를 눌렀던 링크면 안내 없이 같은 비밀로 바로 묶는다.
      if (stored) void claimWith(token, k, stored, false)
      else setState({ kind: 'intro', claiming: false, error: null })
    } else if (stored) {
      setSecret(stored)
      void loadMe(stored)
    } else {
      setState({ kind: 'reopen' })
    }
    return () => {
      opRef.current += 1
    }
  }, [claimWith, loadMe])

  /** '이 휴대폰으로 내기': 비밀을 (없을 때만) 만들어 먼저 저장하고 묶는다. */
  const claim = useCallback(() => {
    const boot = bootRef.current
    if (!boot?.token || !boot.k) return
    void claimWith(boot.token, boot.k, ensureSecret(boot.k), true)
  }, [claimWith])

  /** 홈 화면을 열 때마다, 그리고 '다시 시도' */
  const reloadMe = useCallback(() => {
    if (secret) void loadMe(secret)
    else setState({ kind: 'reopen' })
  }, [secret, loadMe])

  /** 제출 직전에 다시 읽은 /me를 반영한다. 안내(AI 줄)를 먼저 확인해야 하면 false */
  const acceptMe = useCallback(
    (me: HwPublicMe): boolean => {
      setState((prev) => (prev.kind === 'ready' ? { kind: 'ready', me } : prev))
      return !noticeNeeded(me, noticeSeen)
    },
    [noticeSeen]
  )

  /** 안내 '확인': AI 줄을 보였으면 'ai', 아니면 'basic'을 남긴다. */
  const acknowledgeNotice = useCallback(() => {
    const k = bootRef.current?.k
    if (state.kind !== 'ready' || !k) return
    const seen: NoticeSeen = state.me.ai_notice ? 'ai' : 'basic'
    storeNoticeSeen(k, seen)
    setNoticeSeen(seen)
  }, [state])

  /** 제출하다 링크가 막혔다(401·403·없는 링크). 비밀은 지우지 않는다. */
  const block = useCallback(() => {
    opRef.current += 1
    setState({ kind: 'blocked' })
  }, [])

  return {
    state,
    secret,
    noticeRequired: state.kind === 'ready' && noticeNeeded(state.me, noticeSeen),
    claim,
    reloadMe,
    acceptMe,
    acknowledgeNotice,
    block,
  }
}
