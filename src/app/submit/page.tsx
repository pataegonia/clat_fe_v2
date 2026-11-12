'use client'

import BlockedScreen from './_components/BlockedScreen'
import HomeScreen from './_components/HomeScreen'
import IntroScreen from './_components/IntroScreen'
import ResultScreen from './_components/ResultScreen'
import { useSubmissionFlow } from './_hooks/useSubmissionFlow'
import { useSubmitSession } from './_hooks/useSubmitSession'
import * as styles from './submit.css'

const REOPEN_MESSAGE = '받은 링크를 다시 눌러 열어 주세요'

/**
 * 학생 숙제 사진 제출 화면(/submit#t=토큰). 로그인 없이 열린다(proxy의 공개 경로).
 * 토스트가 없는 화면이라 모든 안내는 화면 안에 보인다.
 */
export default function SubmitPage() {
  const session = useSubmitSession()
  const { state } = session
  const flow = useSubmissionFlow({
    secret: session.secret,
    maxPhotos: state.kind === 'ready' ? state.me.max_photos : 0,
    acceptMe: session.acceptMe,
    onBlocked: session.block,
  })

  // 홈 화면은 열 때마다 /me를 다시 읽는다(그사이 AI 확인 동의가 생겼을 수 있다).
  const backHome = (sameTarget: boolean) => {
    if (sameTarget) flow.retake()
    else flow.finish()
    session.reloadMe()
  }

  switch (state.kind) {
    case 'loading':
      return <p className={styles.loadingText}>불러오는 중…</p>
    case 'intro':
      return <IntroScreen claiming={state.claiming} error={state.error} onClaim={session.claim} />
    case 'reopen':
      return <BlockedScreen message={REOPEN_MESSAGE} />
    case 'blocked':
      return <BlockedScreen />
    case 'meError':
      return <BlockedScreen message={state.message} onRetry={session.reloadMe} />
    case 'ready':
      return flow.result ? (
        <ResultScreen
          result={flow.result}
          onRetake={() => backHome(true)}
          onHome={() => backHome(false)}
        />
      ) : (
        <HomeScreen
          me={state.me}
          noticeRequired={session.noticeRequired}
          onNoticeConfirm={session.acknowledgeNotice}
          flow={flow}
        />
      )
  }
}
