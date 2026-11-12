'use client'

import { useState } from 'react'
import ChevronLeftIcon from '@/assets/icons/icon-chevron-left.svg'
import ChevronRightIcon from '@/assets/icons/icon-chevron-right.svg'
import { useHomeworkPhotoBlob } from '@/hooks/lesson/useHomeworkPhotoBlob'
import { HW_LESSON_LABELS } from '@/lib/homeworkPhoto/labels'
import type { HwHiddenBy, HwPhoto } from '@/types/homeworkPhoto'
import * as styles from './HomeworkPhotoSidePanel.css'

const LOADING_TEXT = '불러오는 중…'
const LOAD_FAILED_TEXT = '사진을 불러오지 못했어요.'
const REVEAL_TEXT = '눌러서 보기'

type PhotoViewerProps = {
  photos: HwPhoto[]
  /** 숨긴 제출의 사진은 흐리게 가리고, 한 번 더 눌러야 보인다(§4 숨긴 사진). */
  hidden: HwHiddenBy | null
}

/** 제출 한 건의 사진을 한 장씩 크게 보인다(이전·다음, n / 전체). */
export default function PhotoViewer({ photos, hidden }: PhotoViewerProps) {
  const ordered = [...photos].sort((a, b) => a.ordinal - b.ordinal)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const position = Math.min(index, ordered.length - 1)
  const current = ordered[position] ?? null
  const blob = useHomeworkPhotoBlob(current?.id ?? null)
  if (!current) return null

  const blurred = hidden !== null && !revealed
  const photoClass = blurred ? `${styles.photo} ${styles.photoBlurred}` : styles.photo
  return (
    <div className={styles.viewer}>
      <div className={styles.stage}>
        {blob.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blob.url} alt={`사진 ${position + 1}`} className={photoClass} />
        ) : (
          <span className={styles.stageText}>{blob.failed ? LOAD_FAILED_TEXT : LOADING_TEXT}</span>
        )}
        {blurred ? (
          <button type="button" className={styles.reveal} onClick={() => setRevealed(true)}>
            {hidden === 'MODERATION' ? (
              <span className={styles.revealTag}>{HW_LESSON_LABELS.moderationHidden}</span>
            ) : null}
            {REVEAL_TEXT}
          </button>
        ) : null}
      </div>
      {ordered.length > 1 ? (
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="이전 사진"
            disabled={position === 0}
            onClick={() => setIndex(Math.max(0, position - 1))}
          >
            <ChevronLeftIcon width={20} height={20} />
          </button>
          <span className={styles.navCount}>
            {position + 1} / {ordered.length}
          </span>
          <button
            type="button"
            className={styles.navButton}
            aria-label="다음 사진"
            disabled={position >= ordered.length - 1}
            onClick={() => setIndex(Math.min(ordered.length - 1, position + 1))}
          >
            <ChevronRightIcon width={20} height={20} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
