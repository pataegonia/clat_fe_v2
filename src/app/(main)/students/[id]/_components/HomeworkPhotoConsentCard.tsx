'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Button from '@/components/common/Button'
import ConfirmModal from '@/components/common/ConfirmModal'
import Input from '@/components/common/Input'
import {
  HW_CONSENT_METHOD_LABELS,
  HW_CONSENT_SCOPE_LABELS,
  HW_CONSENTER_LABELS,
} from '@/lib/homeworkPhoto/labels'
import type { HwConsenter, HwConsentRecord, HwConsentScope } from '@/types/homeworkPhoto'
import * as styles from '../studentDashboard.css'
import type { StudentHomeworkPhoto } from '../_hooks/useStudentHomeworkPhoto'

const SCOPES: HwConsentScope[] = ['UPLOAD', 'AI']
const CONSENTERS: HwConsenter[] = ['GUARDIAN', 'STUDENT']
/** 학부모(법정대리인) 동의만 링크와 AI를 켠다(기획 §6). */
const STUDENT_ONLY_WARNING = '학생 본인 동의만으로는 켜지지 않아요.'

const WITHDRAW_CONFIRM: Record<HwConsentScope, { title: string; descriptions: string[] }> = {
  UPLOAD: {
    title: '사진 제출 동의를 철회할까요?',
    descriptions: ['링크가 끊기고 사진과 AI 결과가 지워져요.'],
  },
  AI: {
    title: 'AI 확인 동의를 철회할까요?',
    descriptions: ['AI가 읽은 결과가 지워지고, 처리하지 않은 제출은 확인 필요로 보여요.'],
  },
}

/** 지금 살아 있는(철회하지 않은) 동의. 목록이 최신순이라 처음 찾은 것이다. */
function activeConsent(consents: HwConsentRecord[], scope: HwConsentScope) {
  return consents.find((c) => c.scope === scope && c.withdrawn_at === null) ?? null
}

function consentText(consent: HwConsentRecord): string {
  const who = HW_CONSENTER_LABELS[consent.consenter]
  const method = HW_CONSENT_METHOD_LABELS[consent.method]
  return `동의함 · ${who} · ${method} · ${consent.consented_on}`
}

type RecordFormProps = {
  busy: boolean
  onCancel: () => void
  onSubmit: (consenter: HwConsenter, consentedOn: string) => void
}

/** 동의 기록: 누가(학부모·학생 본인), 받은 방법(학원 서면 동의), 받은 날(오늘까지) */
function ConsentRecordForm({ busy, onCancel, onSubmit }: RecordFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [consenter, setConsenter] = useState<HwConsenter>('GUARDIAN')
  const [consentedOn, setConsentedOn] = useState(today)
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(consentedOn) && consentedOn <= today
  return (
    <div className={styles.hwForm}>
      <div className={styles.hwField}>
        <span className={styles.hwFieldLabel}>누가</span>
        <div role="radiogroup" aria-label="누가" className={styles.hwChipRow}>
          {CONSENTERS.map((option) => {
            const selected = consenter === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                className={selected ? `${styles.hwChip} ${styles.hwChipSelected}` : styles.hwChip}
                onClick={() => setConsenter(option)}
              >
                {HW_CONSENTER_LABELS[option]}
              </button>
            )
          })}
        </div>
        {consenter === 'STUDENT' ? <p className={styles.hwWarn}>{STUDENT_ONLY_WARNING}</p> : null}
      </div>
      <div className={styles.hwField}>
        <span className={styles.hwFieldLabel}>받은 방법</span>
        <span className={styles.hwText}>{HW_CONSENT_METHOD_LABELS.WRITTEN}</span>
      </div>
      <label className={styles.hwField}>
        <span className={styles.hwFieldLabel}>받은 날</span>
        <Input
          type="date"
          value={consentedOn}
          max={today}
          onChange={(e) => setConsentedOn(e.target.value)}
        />
      </label>
      <div className={styles.hwActions}>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
          취소
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => onSubmit(consenter, consentedOn)}
          disabled={busy || !validDate}
        >
          기록
        </Button>
      </div>
    </div>
  )
}

type ConsentRowProps = {
  scope: HwConsentScope
  active: HwConsentRecord | null
  busy: boolean
  recording: boolean
  onStartRecord: () => void
  onCancelRecord: () => void
  onRecord: (consenter: HwConsenter, consentedOn: string) => void
  onWithdraw: () => void
}

/** 동의 한 가지(사진 제출 또는 AI 확인): 지금 상태와 기록·철회 */
function ConsentRow(props: ConsentRowProps) {
  const { scope, active, busy, recording } = props
  return (
    <div className={styles.hwSection}>
      <div className={styles.hwRowHead}>
        <span className={styles.hwRowLabel}>{HW_CONSENT_SCOPE_LABELS[scope]}</span>
        <div className={styles.hwActions}>
          {!recording ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={props.onStartRecord}
              disabled={busy}
            >
              {active ? '다시 기록' : '동의 기록'}
            </Button>
          ) : null}
          {active ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={props.onWithdraw}
              disabled={busy}
            >
              철회
            </Button>
          ) : null}
        </div>
      </div>
      <p className={styles.hwText}>{active ? consentText(active) : '동의 없음'}</p>
      {active?.consenter === 'STUDENT' ? (
        <p className={styles.hwWarn}>{STUDENT_ONLY_WARNING}</p>
      ) : null}
      {recording ? (
        <ConsentRecordForm busy={busy} onCancel={props.onCancelRecord} onSubmit={props.onRecord} />
      ) : null}
    </div>
  )
}

type CardProps = { homeworkPhoto: StudentHomeworkPhoto }

/**
 * 학생 상세의 "사진 숙제 동의" 카드. 범위(사진 제출, AI 확인)마다 학원 서면 동의를 기록하고 철회한다.
 * 기능을 켰거나 철회하지 않은 동의가 남아 있을 때만 보인다.
 */
export function HomeworkPhotoConsentCard({ homeworkPhoto }: CardProps) {
  const { state, busy, setConsent } = homeworkPhoto
  const [recordScope, setRecordScope] = useState<HwConsentScope | null>(null)
  const [withdrawScope, setWithdrawScope] = useState<HwConsentScope | null>(null)
  if (!state) return null
  const hasActive = state.consents.some((c) => c.withdrawn_at === null)
  if (!state.enabled && !hasActive) return null

  const record = async (scope: HwConsentScope, consenter: HwConsenter, consentedOn: string) => {
    const ok = await setConsent({
      scope,
      action: 'RECORD',
      consenter,
      method: 'WRITTEN',
      consented_on: consentedOn,
    })
    if (ok) setRecordScope(null)
  }
  const withdraw = withdrawScope ? WITHDRAW_CONFIRM[withdrawScope] : null

  return (
    <section className={styles.memoCard}>
      <div>
        <h2 className={styles.memoTitle}>사진 숙제 동의</h2>
      </div>
      {SCOPES.map((scope) => (
        <ConsentRow
          key={scope}
          scope={scope}
          active={activeConsent(state.consents, scope)}
          busy={busy}
          recording={recordScope === scope}
          onStartRecord={() => setRecordScope(scope)}
          onCancelRecord={() => setRecordScope(null)}
          onRecord={(consenter, consentedOn) => void record(scope, consenter, consentedOn)}
          onWithdraw={() => setWithdrawScope(scope)}
        />
      ))}
      <ConfirmModal
        isOpen={withdraw !== null}
        onClose={() => setWithdrawScope(null)}
        onConfirm={() => {
          const scope = withdrawScope
          setWithdrawScope(null)
          if (scope) void setConsent({ scope, action: 'WITHDRAW' })
        }}
        title={withdraw?.title ?? ''}
        descriptions={withdraw?.descriptions}
        confirmLabel="철회"
        cancelLabel="취소"
        confirmVariant="danger"
      />
    </section>
  )
}
