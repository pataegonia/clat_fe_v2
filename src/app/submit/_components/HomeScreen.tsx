'use client'

import { useState } from 'react'
import { HW_PUBLIC_STATE_LABELS } from '@/lib/homeworkPhoto/labels'
import type { HwPublicMe } from '@/types/homeworkPhoto'
import type { SubmissionFlow } from '../_hooks/useSubmissionFlow'
import { dayLabel, findTarget } from '../_lib/targetLabel'
import * as styles from '../submit.css'
import { NoticeLines } from './IntroScreen'
import PhotoComposer from './PhotoComposer'
import RecentSubmissions from './RecentSubmissions'
import TargetPicker from './TargetPicker'

type HomeScreenProps = {
  me: HwPublicMe
  /** 안내를 (다시) 확인해야 한다. 그때까지 숙제 고르기와 제출을 막는다. */
  noticeRequired: boolean
  onNoticeConfirm: () => void
  flow: SubmissionFlow
}

/** 이름, 첫 안내, 다시 내기 요청, 낼 숙제 고르기와 사진 넣기, 내 지난 제출 */
export default function HomeScreen({ me, noticeRequired, onNoticeConfirm, flow }: HomeScreenProps) {
  const [noticeReopened, setNoticeReopened] = useState(false)
  const selected = findTarget(me, flow.targetKey)
  const returned = me.returned_notice

  const confirmNotice = () => {
    onNoticeConfirm()
    setNoticeReopened(false)
  }

  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>숙제 내기</p>
        <h1 className={styles.title}>{me.student_name}</h1>
      </header>

      {noticeRequired || noticeReopened ? (
        <section className={styles.card}>
          <NoticeLines ai={me.ai_notice} />
          <button type="button" className={styles.primaryButton} onClick={confirmNotice}>
            확인
          </button>
        </section>
      ) : (
        <button type="button" className={styles.textButton} onClick={() => setNoticeReopened(true)}>
          안내 다시 보기
        </button>
      )}

      {returned ? (
        <section className={styles.banner}>
          <p className={styles.bannerTitle}>{HW_PUBLIC_STATE_LABELS.RETURNED}</p>
          <p className={styles.bannerMeta}>
            {`${dayLabel(returned.target_date)} · ${returned.class_name}`}
          </p>
          <p className={styles.bannerText}>{returned.reason}</p>
        </section>
      ) : null}

      <TargetPicker
        classes={me.classes}
        selected={selected}
        disabled={noticeRequired || flow.sending}
        onSelect={flow.selectTarget}
      />

      {selected ? (
        <PhotoComposer
          flow={flow}
          maxPhotos={me.max_photos}
          locked={noticeRequired}
          onSubmit={() => void flow.submit(selected)}
        />
      ) : null}

      <RecentSubmissions items={me.recent} />
    </>
  )
}
