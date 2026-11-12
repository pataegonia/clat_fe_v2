'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import CloseIcon from '@/assets/icons/icon-close.svg'
import { HW_STUDENT_LABELS } from '@/lib/homeworkPhoto/labels'
import {
  tooManyPhotosText,
  type ComposedPhoto,
  type SubmissionFlow,
} from '../_hooks/useSubmissionFlow'
import * as styles from '../submit.css'

/** JPEG·PNG·WebP만 받는다. iOS는 accept에 HEIC가 없으면 JPEG로 바꿔 넘긴다(기획 §12). */
const ACCEPT = 'image/jpeg,image/png,image/webp'

type PhotoThumbProps = {
  photo: ComposedPhoto
  index: number
  disabled: boolean
  onRemove: () => void
}

/** 미리보기 한 장. 미리보기 주소(object URL)는 이 칸이 만들고 치운다. */
function PhotoThumb({ photo, index, disabled, onRemove }: PhotoThumbProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo.blob])

  return (
    <li className={styles.thumb}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.thumbImage} src={url} alt={`사진 ${index}`} />
      ) : null}
      <button
        type="button"
        className={styles.thumbRemove}
        aria-label={`사진 ${index} 빼기`}
        disabled={disabled}
        onClick={onRemove}
      >
        <CloseIcon width={16} height={16} aria-hidden />
      </button>
    </li>
  )
}

type PhotoComposerProps = {
  flow: SubmissionFlow
  maxPhotos: number
  /** 안내를 먼저 확인해야 해서 제출을 막는다 */
  locked: boolean
  onSubmit: () => void
}

/** 사진 넣기(카메라·앨범), 장마다 미리보기와 빼기, 제출 */
export default function PhotoComposer({ flow, maxPhotos, locked, onSubmit }: PhotoComposerProps) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  const { photos, preparing, sending, progress, error } = flow
  const busy = preparing || sending
  const full = photos.length >= maxPhotos
  const submitLabel = progress
    ? `사진 올리는 중 ${progress.current}/${progress.total}`
    : HW_STUDENT_LABELS.submit

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    // 같은 사진을 다시 골라도 onChange가 오게 비운다.
    event.target.value = ''
    void flow.addFiles(files)
  }

  return (
    <section className={styles.section}>
      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={busy || full}
          onClick={() => cameraRef.current?.click()}
        >
          {HW_STUDENT_LABELS.camera}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={busy || full}
          onClick={() => albumRef.current?.click()}
        >
          {HW_STUDENT_LABELS.album}
        </button>
      </div>
      <input
        ref={cameraRef}
        className={styles.hiddenInput}
        type="file"
        accept={ACCEPT}
        capture="environment"
        tabIndex={-1}
        aria-hidden
        onChange={pick}
      />
      <input
        ref={albumRef}
        className={styles.hiddenInput}
        type="file"
        accept={ACCEPT}
        multiple
        tabIndex={-1}
        aria-hidden
        onChange={pick}
      />
      {preparing ? <p className={styles.statusText}>사진 준비 중…</p> : null}
      {full && !error ? <p className={styles.statusText}>{tooManyPhotosText(maxPhotos)}</p> : null}
      {photos.length > 0 ? (
        <ul className={styles.thumbGrid}>
          {photos.map((photo, index) => (
            <PhotoThumb
              key={photo.id}
              photo={photo}
              index={index + 1}
              disabled={sending}
              onRemove={() => flow.removePhoto(photo.id)}
            />
          ))}
        </ul>
      ) : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}
      <button
        type="button"
        className={styles.primaryButton}
        disabled={locked || busy || photos.length === 0}
        onClick={onSubmit}
      >
        {submitLabel}
      </button>
    </section>
  )
}
