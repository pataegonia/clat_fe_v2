'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Text from '@/components/common/Text'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useToastStore } from '@/stores/toastStore'
import { isTutorialGateOpen, setTutorialActionHandler, type TutorialAction } from './tutorialEvents'
import { tutorialApi, type TutorialScreen, type TutorialState } from './tutorialApi'
import {
  isOnPlace,
  PARENT_BEATS,
  placeHref,
  SCREEN_TOURS,
  screenForPath,
  TOTAL_STEPS,
  TUTORIAL_BEATS,
  type ScreenTourId,
  type TutorialBeat,
} from './tutorialSteps'
import { TutorialLayer } from './TutorialLayer'
import * as styles from './tutorial.css'

const DISMISS_KEY = 'clat-tutorial-start-dismissed'
const INTRO_CLOSED_KEY = 'clat-tutorial-intro-closed'

interface TutorialContextValue {
  status: TutorialState['status']
  step: number
  templateId: number | null
  classId: number | null
  lessonId: number | null
  studentId: number | null
  seenScreens: string[]
  hidden: boolean
  reopenTick: number
  dismissTick: number
  anchor: string | null
  screenTour: ScreenTourId | null
  ready: boolean
  /** 첫 로그인 튜토리얼이 끝나거나 닫히기 전에는 업데이트 모달을 열지 않는다. */
  holdWhatsNew: boolean
  requestReopen: () => void
  markSeen: (screen: TutorialScreen) => void
  replay: (screen: ScreenTourId) => void
  start: () => void
  resume: () => void
  restart: () => void
}

const TutorialContext = createContext<TutorialContextValue | null>(null)

const idleTour: TutorialContextValue = {
  status: 'none',
  step: 0,
  templateId: null,
  classId: null,
  lessonId: null,
  studentId: null,
  seenScreens: [],
  hidden: true,
  reopenTick: 0,
  dismissTick: 0,
  anchor: null,
  screenTour: null,
  ready: false,
  holdWhatsNew: false,
  requestReopen: () => {},
  markSeen: () => {},
  replay: () => {},
  start: () => {},
  resume: () => {},
  restart: () => {},
}

export function useTutorial(): TutorialContextValue {
  return useContext(TutorialContext) ?? idleTour
}

export default function TutorialProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() ?? ''
  const addToast = useToastStore((s) => s.addToast)
  const [state, setState] = useState<TutorialState>(tutorialApi.empty)
  const [ready, setReady] = useState(false)
  const [beatIndex, setBeatIndex] = useState(0)
  const [screenIndex, setScreenIndex] = useState(0)
  const [hidden, setHidden] = useState(false)
  const [follow, setFollow] = useState(false)
  const [located, setLocated] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const [doneOpen, setDoneOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reopenTick, setReopenTick] = useState(0)
  const [dismissTick, setDismissTick] = useState(0)
  const [replayScreen, setReplayScreen] = useState<ScreenTourId | null>(null)
  const [closedScreen, setClosedScreen] = useState<string | null>(null)
  const [forceKind, setForceKind] = useState<'restart' | 'finish' | null>(null)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [introDismissed, setIntroDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(INTRO_CLOSED_KEY) === '1'
  })
  const lastPush = useRef<{ href: string; at: number } | null>(null)
  const followedHref = useRef<string | null>(null)
  const returning = useRef(false)
  const pendingLeaveHref = useRef<string | null>(null)

  const onParent = pathname.startsWith('/parent')
  const beats =
    onParent && state.step === TOTAL_STEPS ? PARENT_BEATS : (TUTORIAL_BEATS[state.step] ?? [])
  const beat: TutorialBeat | null = beats[beatIndex] ?? null
  const screen = screenForPath(pathname)
  const screenBeats =
    state.status === 'completed' &&
    screen &&
    !doneOpen &&
    closedScreen !== screen &&
    (replayScreen === screen || !state.seen_screens.includes(screen))
      ? SCREEN_TOURS[screen]
      : []
  const screenBeat = screenBeats[screenIndex] ?? null
  const screenTour = screenBeat && screen ? screen : null

  useEffect(() => {
    let cancelled = false
    if (typeof window === 'undefined' || !localStorage.getItem('accessToken')) {
      setReady(true)
      return
    }
    if (state.status !== 'none') return
    tutorialApi
      .get()
      .then((next) => {
        if (cancelled) return
        setState(next)
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [pathname, state.status])

  useEffect(() => {
    setBeatIndex(0)
  }, [state.step])

  const wasParent = useRef(false)
  useEffect(() => {
    const now = pathname.startsWith('/parent')
    if (now && !wasParent.current && state.status === 'in_progress' && state.step === TOTAL_STEPS) {
      setBeatIndex(0)
    }
    wasParent.current = now
  }, [pathname, state.status, state.step])

  useEffect(() => {
    setScreenIndex(0)
  }, [screen])

  useEffect(() => {
    if (state.status !== 'completed' || !screenBeat?.href) return
    const href = screenBeat.href
    const sync = () => {
      if (isOnPlace(window.location.pathname, window.location.search, href)) return
      const now = Date.now()
      if (!lastPush.current || lastPush.current.href !== href || now - lastPush.current.at > 1500) {
        lastPush.current = { href, at: now }
        router.push(href)
      }
    }
    sync()
    const timer = window.setInterval(sync, 400)
    return () => window.clearInterval(timer)
  }, [router, screenBeat, state.status])

  const dismissIntro = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    sessionStorage.setItem(INTRO_CLOSED_KEY, '1')
    setIntroDismissed(true)
    setStartOpen(false)
  }, [])

  useEffect(() => {
    if (!ready || state.status !== 'none' || !state.auto_open || pathname !== '/home') return
    if (introDismissed || sessionStorage.getItem(DISMISS_KEY) === '1') return
    setStartOpen(true)
  }, [introDismissed, ready, state.status, state.auto_open, pathname])

  useEffect(() => {
    if (state.status !== 'in_progress') {
      followedHref.current = null
      returning.current = false
      setLocated(false)
      return
    }
    const sync = () => {
      if (!follow || leaveOpen) {
        if (!follow) {
          followedHref.current = null
          setLocated(false)
        }
        return
      }
      const path = window.location.pathname
      const search = window.location.search
      const parentOk = path.startsWith('/parent') && state.step === TOTAL_STEPS
      const mainBeats = TUTORIAL_BEATS[state.step] ?? []
      const mainBeat = mainBeats[Math.min(beatIndex, Math.max(mainBeats.length - 1, 0))] ?? null
      const href = mainBeat?.place ? placeHref(mainBeat.place, state) : null
      const here = parentOk || (href ? isOnPlace(path, search, href) : false)
      if (here) {
        if (href) followedHref.current = href
        returning.current = false
        lastPush.current = null
        setLocated(true)
        return
      }
      if (!href) {
        setLocated(false)
        return
      }
      if (returning.current || followedHref.current !== href) {
        followedHref.current = href
        returning.current = true
        const now = Date.now()
        if (!lastPush.current || lastPush.current.href !== href || now - lastPush.current.at > 1500) {
          lastPush.current = { href, at: now }
          router.push(href)
        }
        setLocated(false)
        return
      }
      setLocated(false)
    }
    sync()
    const timer = window.setInterval(sync, 400)
    return () => window.clearInterval(timer)
  }, [beatIndex, follow, leaveOpen, pathname, router, state])

  const fail = useCallback(
    (error: unknown, retry: 'restart' | 'finish' | null = null) => {
      const parsed = tutorialApi.readError(error)
      if (parsed.code === 'TUTORIAL_HAS_OTHER_STUDENTS' && retry) {
        setForceKind(retry)
        return
      }
      if (parsed.code === 'TUTORIAL_DONE') {
        void tutorialApi.get().then(setState).catch(() => {})
        return
      }
      addToast({ variant: 'error', message: parsed.message })
    },
    [addToast],
  )

  const apply = useCallback((next: TutorialState) => {
    setState(next)
    setHidden(false)
    setFollow(true)
    if (next.status === 'completed') {
      setFollow(false)
      setDoneOpen(true)
    }
  }, [])

  const run = useCallback(
    async (work: () => Promise<TutorialState>, retry: 'restart' | 'finish' | null = null) => {
      if (busy) return
      setBusy(true)
      try {
        apply(await work())
      } catch (error) {
        fail(error, retry)
      } finally {
        setBusy(false)
      }
    },
    [apply, busy, fail],
  )

  const goNext = useCallback(() => {
    const current = beats[beatIndex]
    if (!current) return
    if (current.finish) {
      void run(() => tutorialApi.complete())
      return
    }
    if (current.gate && !isTutorialGateOpen(current.gate)) return
    if (current.advance) {
      void run(() => tutorialApi.advance(current.advance as TutorialAction))
      return
    }
    if (beatIndex + 1 < beats.length) setBeatIndex((index) => index + 1)
  }, [beatIndex, beats, run])

  const skipBeat = useCallback(() => {
    const current = beats[beatIndex]
    if (current?.local) {
      setBeatIndex((index) => index + 1)
      return
    }
    if (state.step === 4 || state.step === 6) setDismissTick((tick) => tick + 1)
    if (onParent || state.step === TOTAL_STEPS) {
      void run(() => tutorialApi.complete())
      return
    }
    void run(() => tutorialApi.skip())
  }, [beatIndex, beats, onParent, run, state.step])

  useEffect(() => {
    setTutorialActionHandler((action, extra) => {
      if (state.status !== 'in_progress' || hidden || onParent) return false
      const index = beats.findIndex(
        (item, itemIndex) => itemIndex >= beatIndex && item.mode === 'action' && item.action === action,
      )
      if (index < 0) return false
      const matched = beats[index]
      if (action === 'lesson-input' && extra?.studentId !== state.student_id) return false
      if (matched?.local) {
        setBeatIndex(index + 1)
        return true
      }
      void run(() => tutorialApi.advance(action, extra))
      return true
    })
    return () => setTutorialActionHandler(null)
  }, [beatIndex, beats, hidden, onParent, run, state.status, state.student_id])

  const askLeave = () => {
    pendingLeaveHref.current = null
    setLeaveOpen(true)
  }

  useEffect(() => {
    if (state.status !== 'in_progress' || !follow) return
    const onClick = (event: MouseEvent) => {
      if (leaveOpen || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return
      const raw = anchor.getAttribute('href')
      if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (beat?.anchor && target.closest(`[data-tour="${beat.anchor}"]`)) return
      const parentOk = url.pathname.startsWith('/parent') && state.step === TOTAL_STEPS
      const mainBeats = TUTORIAL_BEATS[state.step] ?? []
      const mainBeat = mainBeats[Math.min(beatIndex, Math.max(mainBeats.length - 1, 0))] ?? null
      const href = mainBeat?.place ? placeHref(mainBeat.place, state) : null
      if (parentOk || (href && isOnPlace(url.pathname, url.search, href))) return
      event.preventDefault()
      event.stopPropagation()
      pendingLeaveHref.current = `${url.pathname}${url.search}`
      setLeaveOpen(true)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [beat?.anchor, beatIndex, follow, leaveOpen, state])

  const stayInTour = () => {
    pendingLeaveHref.current = null
    setLeaveOpen(false)
    setHidden(false)
    setFollow(true)
  }

  const finishFromLeave = () => {
    const next = pendingLeaveHref.current
    pendingLeaveHref.current = null
    setLeaveOpen(false)
    setFollow(false)
    followedHref.current = null
    returning.current = false
    void run(async () => {
      const done = await tutorialApi.complete()
      if (next) router.push(next)
      return done
    }, 'finish')
  }

  const dismissScreen = useCallback(
    (target: TutorialScreen) => {
      setClosedScreen(target)
      setReplayScreen((current) => (current === target ? null : current))
      void tutorialApi
        .seen(target)
        .then((next) => {
          setState(next)
          setClosedScreen((current) => (current === target ? null : current))
        })
        .catch((error) => fail(error))
    },
    [fail],
  )

  const replay = useCallback((target: ScreenTourId) => {
    setClosedScreen(null)
    setReplayScreen(target)
    setScreenIndex(0)
  }, [])

  const value = useMemo<TutorialContextValue>(
    () => ({
      status: state.status,
      step: state.step,
      templateId: state.template_id,
      classId: state.class_id,
      lessonId: state.lesson_id,
      studentId: state.student_id,
      seenScreens: state.seen_screens,
      hidden,
      reopenTick,
      dismissTick,
      anchor: beat?.anchor ?? null,
      screenTour,
      ready,
      holdWhatsNew:
        !ready ||
        doneOpen ||
        state.status === 'in_progress' ||
        (state.status === 'none' && state.auto_open && !introDismissed),
      requestReopen: () => setReopenTick((tick) => tick + 1),
      markSeen: dismissScreen,
      replay,
      start: () => void run(() => tutorialApi.start()),
      resume: () => void run(() => tutorialApi.resume()),
      restart: () => void run(() => tutorialApi.restart(), 'restart'),
    }),
    [
      beat?.anchor,
      dismissScreen,
      dismissTick,
      doneOpen,
      hidden,
      introDismissed,
      ready,
      reopenTick,
      replay,
      run,
      screenTour,
      state,
    ],
  )

  const showLayer = state.status === 'in_progress' && !hidden && located && Boolean(beat) && !leaveOpen && !forceKind
  const showScreen = Boolean(screenBeat) && state.status === 'completed' && !leaveOpen && !forceKind

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {showLayer && beat ? (
        <TutorialLayer
          beat={beat}
          stepLabel={onParent ? `학부모 ${beatIndex + 1}/${beats.length}` : `${state.step}/${TOTAL_STEPS}`}
          onNext={goNext}
          onSkip={skipBeat}
          onClose={askLeave}
          onReopen={() => setReopenTick((tick) => tick + 1)}
        />
      ) : null}
      {showScreen && screen && screenBeat ? (
        <TutorialLayer
          beat={screenBeat}
          stepLabel={`${screenIndex + 1}/${screenBeats.length}`}
          onNext={() => {
            if (screenIndex + 1 >= screenBeats.length) dismissScreen(screen)
            else setScreenIndex((index) => index + 1)
          }}
          onSkip={() => dismissScreen(screen)}
          onClose={() => dismissScreen(screen)}
          onReopen={() => setScreenIndex(0)}
        />
      ) : null}
      <Modal isOpen={startOpen} onClose={dismissIntro} size="sm">
        <div className={styles.dialogBody}>
          <Text variant="headingMd" as="h2">
            수업 문자를 받아 봐요
          </Text>
          <Text variant="bodyLg" color="gray500">
            튜토리얼 수업으로 틀, 출결, 결과 문자까지 해 봐요. 튜토리얼 학생은 끝나면 지워져요.
          </Text>
          <div className={styles.dialogActions}>
            <Button variant="ghost" size="md" fullWidth onClick={dismissIntro}>
              나중에 하기
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={busy}
              onClick={() => {
                sessionStorage.setItem(DISMISS_KEY, '1')
                setStartOpen(false)
                void run(() => tutorialApi.start())
              }}
            >
              시작하기
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={doneOpen} onClose={() => setDoneOpen(false)} size="sm">
        <div className={styles.dialogBody}>
          <Text variant="headingMd" as="h2">
            튜토리얼이 끝났습니다.
          </Text>
          <Text variant="bodyLg" color="gray500">
            학생을 등록해주세요
          </Text>
          <div className={styles.dialogActions}>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => {
                setDoneOpen(false)
                router.push('/home')
              }}
            >
              홈으로 가기
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setDoneOpen(false)
                router.push('/management?tab=students')
              }}
            >
              학생 등록하기
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={leaveOpen}
        onClose={stayInTour}
        onConfirm={finishFromLeave}
        title="벗어나면 튜토리얼이 끝나요"
        confirmLabel="끝내기"
        cancelLabel="계속하기"
        confirmVariant="danger"
      />

      <ConfirmModal
        isOpen={forceKind !== null}
        onClose={() => setForceKind(null)}
        onConfirm={() => {
          const kind = forceKind
          setForceKind(null)
          if (kind === 'finish') void run(() => tutorialApi.complete(true))
          else void run(() => tutorialApi.restart(true))
        }}
        title="튜토리얼 수업에 다른 학생이 있어요"
        descriptions={[
          forceKind === 'finish' ? '같이 지우고 튜토리얼을 끝낼까요?' : '지우고 처음부터 다시 할까요?',
        ]}
        confirmLabel={forceKind === 'finish' ? '지우고 끝내기' : '지우고 다시'}
        cancelLabel="취소"
        confirmVariant="danger"
      />
    </TutorialContext.Provider>
  )
}

export function TutorialReplayButton({ screen }: { screen: ScreenTourId }) {
  const tour = useTutorial()
  if (!tour.ready || tour.status !== 'completed') return null
  return (
    <Button variant="outlined" size="sm" onClick={() => tour.replay(screen)}>
      안내 다시 보기
    </Button>
  )
}

export function TutorialHomeCard() {
  const tour = useTutorial()
  if (!tour.ready) return null

  if (tour.status === 'completed') {
    return (
      <section className={styles.homeCard}>
        <div className={styles.homeCopy}>
          <Text variant="titleMd" as="p" className={styles.plainText}>
            튜토리얼을 끝냈어요
          </Text>
          <Text variant="bodyMd" color="gray700" as="p" className={styles.plainText}>
            다시하기 버튼으로 다시할 수 있습니다.
          </Text>
        </div>
        <div className={styles.homeActions}>
          <Button variant="secondary" size="md" onClick={tour.restart}>
            튜토리얼 다시 해보기
          </Button>
        </div>
      </section>
    )
  }

  if (tour.status === 'in_progress') {
    return (
      <section className={styles.homeCard}>
        <div className={styles.homeCopy}>
          <Text variant="titleMd" as="p" className={styles.plainText}>
            튜토리얼을 진행 중이에요
          </Text>
          <Text variant="bodyMd" color="gray700" as="p" className={styles.plainText}>
            {`${tour.step}/${TOTAL_STEPS}단계`}
          </Text>
        </div>
        <div className={styles.homeActions}>
          <Button variant="ghost" size="md" onClick={tour.restart}>
            처음부터
          </Button>
          <Button variant="primary" size="md" onClick={tour.resume}>
            이어하기
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.homeCard}>
      <div className={styles.homeCopy}>
        <Text variant="titleMd" as="p" className={styles.plainText}>
          튜토리얼을 시작해보세요
        </Text>
        <Text variant="bodyMd" color="gray700" as="p" className={styles.plainText}>
          전반적인 플로우를 따라갑니다.
        </Text>
      </div>
      <div className={styles.homeActions}>
        <Button variant="primary" size="md" onClick={tour.start}>
          튜토리얼 시작
        </Button>
      </div>
    </section>
  )
}
