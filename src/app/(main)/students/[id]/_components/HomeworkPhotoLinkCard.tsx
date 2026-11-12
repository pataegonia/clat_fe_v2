'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import Button from '@/components/common/Button'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useToastStore } from '@/stores/toastStore'
import { HW_LINK_BLOCKED_LABELS } from '@/lib/homeworkPhoto/labels'
import type { HwLinkStatus } from '@/types/homeworkPhoto'
import * as styles from '../studentDashboard.css'
import type { StudentHomeworkPhoto } from '../_hooks/useStudentHomeworkPhoto'

const NEED_CONSENT_HINT = '학부모 사진 제출 동의를 기록하면 링크를 만들 수 있어요.'

type ConfirmKind = 'recreate' | 'revoke'

const CONFIRMS: Record<ConfirmKind, { title: string; descriptions: string[]; label: string }> = {
  recreate: {
    title: '링크를 다시 만들까요?',
    descriptions: ['이전 링크와 묶인 휴대폰은 바로 끊겨요.'],
    label: '다시 만들기',
  },
  revoke: {
    title: '링크를 끊을까요?',
    descriptions: ['학생이 이 링크로 더 낼 수 없어요.'],
    label: '끊기',
  },
}

function formatTime(iso: string): string {
  return format(parseISO(iso), 'M월 d일 HH:mm')
}

function firstOpenedText(link: HwLinkStatus): string {
  if (link.claimed_at) return formatTime(link.claimed_at)
  if (!link.expires_at) return '아직 열지 않음'
  return `아직 열지 않음 · ${format(parseISO(link.expires_at), 'M월 d일')}까지 열어야 해요`
}

function blockedText(link: HwLinkStatus): string {
  const count = `${link.blocked_attempts}번`
  return link.last_blocked_at ? `${count} · 마지막 ${formatTime(link.last_blocked_at)}` : count
}

/** 처음 연 시각·마지막 사용·제출 수·막힌 시도(링크가 퍼졌는지 알아보는 용도)와 쓸 수 없는 까닭 */
function LinkStatusLines({ link }: { link: HwLinkStatus }) {
  const rows: Array<[string, string]> = [
    ['처음 연 시각', firstOpenedText(link)],
    ['마지막 사용', link.last_used_at ? formatTime(link.last_used_at) : '-'],
    ['제출 수', `${link.submit_count}건`],
    ['막힌 시도', blockedText(link)],
  ]
  return (
    <>
      <dl className={styles.hwInfoList}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.hwInfoRow}>
            <dt className={styles.hwInfoLabel}>{label}</dt>
            <dd className={styles.hwInfoValue}>{value}</dd>
          </div>
        ))}
      </dl>
      {!link.alive && link.blocked_reason ? (
        <p className={styles.hwWarn}>{HW_LINK_BLOCKED_LABELS[link.blocked_reason]}</p>
      ) : null}
    </>
  )
}

/** 방금 만든 링크. 이 화면에만 한 번 보인다(다시 열면 사라진다). */
function CreatedLinkBox({ url }: { url: string }) {
  const addToast = useToastStore((s) => s.addToast)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      addToast({ variant: 'success', message: '복사했어요.' })
    } catch {
      // http://<LAN IP>처럼 안전하지 않은 주소에서는 클립보드를 쓸 수 없다.
      addToast({
        variant: 'error',
        message: '복사하지 못했어요. 링크를 길게 눌러 복사해 주세요.',
      })
    }
  }
  return (
    <div className={styles.hwUrlBox}>
      <p className={styles.hwUrl}>{url}</p>
      <div className={styles.hwActions}>
        <Button type="button" variant="secondary" size="sm" onClick={() => void copy()}>
          복사
        </Button>
      </div>
      <p className={styles.memoHint}>
        링크는 지금 한 번만 보여요. 복사해 학생에게 1:1로 보내 주세요.
      </p>
    </div>
  )
}

type CardProps = { homeworkPhoto: StudentHomeworkPhoto }

/**
 * 학생 상세의 "제출 링크" 카드. 링크를 만들고(다시 만들면 이전 링크는 끊긴다) 끊는다.
 * 기능을 켰거나 아직 끊지 않은 링크가 있을 때만 보인다. 만든 주소는 이 컴포넌트 상태에만 둔다.
 */
export function HomeworkPhotoLinkCard({ homeworkPhoto }: CardProps) {
  const { state, busy, createLink, revokeLink } = homeworkPhoto
  const [shownUrl, setShownUrl] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null)
  if (!state) return null
  const { enabled, link } = state
  if (!enabled && link === null) return null
  const canCreate = state.effective.upload

  const create = async () => {
    const url = await createLink()
    if (url) setShownUrl(url)
  }
  const revoke = async () => {
    if (await revokeLink()) setShownUrl(null)
  }
  const onConfirm = () => {
    const kind = confirm
    setConfirm(null)
    if (kind === 'recreate') void create()
    if (kind === 'revoke') void revoke()
  }
  const dialog = confirm ? CONFIRMS[confirm] : null

  return (
    <section className={styles.memoCard}>
      <div>
        <h2 className={styles.memoTitle}>제출 링크</h2>
      </div>
      {link ? <LinkStatusLines link={link} /> : null}
      {shownUrl ? <CreatedLinkBox url={shownUrl} /> : null}
      <div className={styles.hwActions}>
        {enabled ? (
          <Button
            type="button"
            variant={link ? 'ghost' : 'primary'}
            size="sm"
            disabled={busy || !canCreate}
            onClick={() => {
              if (link) setConfirm('recreate')
              else void create()
            }}
          >
            {link ? '링크 다시 만들기' : '링크 만들기'}
          </Button>
        ) : null}
        {link ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => setConfirm('revoke')}
          >
            링크 끊기
          </Button>
        ) : null}
      </div>
      {enabled && !canCreate ? <p className={styles.memoHint}>{NEED_CONSENT_HINT}</p> : null}
      <ConfirmModal
        isOpen={dialog !== null}
        onClose={() => setConfirm(null)}
        onConfirm={onConfirm}
        title={dialog?.title ?? ''}
        descriptions={dialog?.descriptions}
        confirmLabel={dialog?.label}
        cancelLabel="취소"
        confirmVariant="danger"
      />
    </section>
  )
}
