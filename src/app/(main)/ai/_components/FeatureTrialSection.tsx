'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useToastStore } from '@/stores/toastStore'
import {
  featureTrialService,
  type FeatureTrial,
  type FeatureTrialKey,
} from '@/services/featureTrials'
import { hwKeys } from '@/lib/homeworkPhoto/queryKeys'
import { HW_FEATURE_LABEL } from '@/lib/homeworkPhoto/labels'
import * as styles from '../aiSettings.css'
import * as css from './featureTrial.css'
import { StyleLearningPanel } from './StyleLearningPanel'
import { HomeworkPhotoPanel } from './HomeworkPhotoPanel'

type TrialMeta = {
  label: string
  help: string
  onToast: string
  offToast: string
  /** 있으면 끄기 전에 이 내용으로 한 번 묻는다. 켜기는 묻지 않는다. */
  confirmOff?: { title: string; descriptions: string[] }
}

/** 화면에 두는 기능 체험. 서버가 여기 없는 체험을 주면 보이지 않는다. */
const TRIALS: Record<FeatureTrialKey, TrialMeta> = {
  STYLE_LEARNING: {
    label: 'AI가 내 말투 배우기',
    help: 'AI 초안을 고쳐 저장한 글을 모아 자주 고치는 말투를 찾고, 보내기 전에 만드는 초안에 반영해요',
    onToast: 'AI가 내 말투 배우기를 켰어요.',
    offToast: 'AI가 내 말투 배우기를 껐어요. 모은 기록은 그대로 있어요.',
  },
  HOMEWORK_PHOTO: {
    label: HW_FEATURE_LABEL,
    help: '학생이 링크로 낸 숙제 사진을 AI가 먼저 살펴보고, 수업 표 숙제 칸에 완료·미완료를 제안해요. 선생님이 적용해야 저장돼요',
    onToast: '사진 숙제 AI 확인을 켰어요.',
    offToast: '사진 숙제 AI 확인을 껐어요. 학생 링크는 모두 끊겼어요.',
    // 끄면 학생 링크가 모두 끊기고, 다시 켜도 살아나지 않는다(기획 §4).
    confirmOff: {
      title: '사진 숙제 AI 확인을 끌까요?',
      descriptions: [
        '끄면 학생 링크가 모두 끊겨요.',
        '다시 켜도 살아나지 않아 링크를 새로 만들어 보내야 해요.',
      ],
    },
  },
}

type TrialItemProps = {
  trial: FeatureTrial
  manualMode: boolean
  busy: boolean
  onToggle: () => void
}

/** 체험 하나: 이름과 켜기·끄기 스위치(AiMiscSection과 같은 모양), 설명, 체험별 상태 */
function TrialItem({ trial, manualMode, busy, onToggle }: TrialItemProps) {
  const { label, help } = TRIALS[trial.key]
  return (
    <div className={css.trial}>
      <div className={styles.toggleRow}>
        <h3 className={css.trialTitle}>{label}</h3>
        <button
          type="button"
          className={`${styles.toggle} ${trial.enabled ? styles.toggleOn : styles.toggleOff}`}
          onClick={onToggle}
          aria-label={label}
          aria-pressed={trial.enabled}
          disabled={busy}
        >
          <span
            className={`${styles.toggleKnob} ${
              trial.enabled ? styles.toggleKnobOn : styles.toggleKnobOff
            }`}
          />
        </button>
      </div>
      <p className={styles.toggleHelp}>{help}</p>
      {trial.key === 'STYLE_LEARNING' ? (
        <StyleLearningPanel enabled={trial.enabled} manualMode={manualMode} />
      ) : trial.key === 'HOMEWORK_PHOTO' ? (
        <HomeworkPhotoPanel enabled={trial.enabled} />
      ) : null}
    </div>
  )
}

type TrialOffConfirmProps = {
  /** 끄기 전에 묻는 체험. null이면 창이 닫혀 있다. */
  trialKey: FeatureTrialKey | null
  onCancel: () => void
  onConfirm: (key: FeatureTrialKey) => void
}

/** 끄면 되돌릴 수 없는 체험(confirmOff가 있는 체험)을 끄기 전에 묻는다. */
function TrialOffConfirm({ trialKey, onCancel, onConfirm }: TrialOffConfirmProps) {
  const meta = trialKey ? TRIALS[trialKey].confirmOff : undefined
  return (
    <ConfirmModal
      isOpen={trialKey !== null && meta !== undefined}
      onClose={onCancel}
      onConfirm={() => {
        if (trialKey) onConfirm(trialKey)
      }}
      title={meta?.title ?? ''}
      descriptions={meta?.descriptions}
      confirmLabel="끄기"
      cancelLabel="취소"
      confirmVariant="danger"
    />
  )
}

/**
 * AI 조교 화면의 "기능 체험" 칸. 켜고 끄면 바로 서버에 반영되고, 위 저장 버튼(AI 설정)과는 따로다.
 * manualMode는 지금 고른 피드백 방식(저장 전 값)이 직접 쓰기인지로, 말투 배우기 안내에만 쓴다.
 */
export function FeatureTrialSection({ manualMode }: { manualMode: boolean }) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const [confirmOffKey, setConfirmOffKey] = useState<FeatureTrialKey | null>(null)
  const { data, isPending, isError } = useQuery({
    queryKey: ['feature-trials'],
    queryFn: () => featureTrialService.list(),
  })
  const toggle = useMutation({
    mutationFn: (input: { key: FeatureTrialKey; enabled: boolean }) =>
      featureTrialService.setEnabled(input.key, input.enabled),
    onSuccess: (_, input) => {
      const { onToast, offToast } = TRIALS[input.key]
      addToast({ variant: 'success', message: input.enabled ? onToast : offToast })
    },
    onError: () => addToast({ variant: 'error', message: '기능 체험을 바꾸지 못했어요.' }),
    // 성공해도 실패해도 서버 값을 다시 읽고, 스위치가 그 값을 보일 때까지 막는다(promise를 돌려준다).
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['feature-trials'] }),
        queryClient.invalidateQueries({ queryKey: ['style-learning'] }),
        queryClient.invalidateQueries({ queryKey: hwKeys.all }),
      ]),
  })
  const onToggle = (trial: FeatureTrial) => {
    if (trial.enabled && TRIALS[trial.key].confirmOff) setConfirmOffKey(trial.key)
    else toggle.mutate({ key: trial.key, enabled: !trial.enabled })
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>기능 체험</h2>
      <p className={css.intro}>
        써 보는 기능이에요. 켜고 끄면 바로 적용되고, 위 저장 버튼과는 따로예요
      </p>
      {isPending ? <Text color="gray500">불러오는 중…</Text> : null}
      {isError ? (
        <Text color="error500">기능 체험을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</Text>
      ) : null}
      {data
        ?.filter((trial) => Object.hasOwn(TRIALS, trial.key))
        .map((trial) => (
          <TrialItem
            key={trial.key}
            trial={trial}
            manualMode={manualMode}
            busy={toggle.isPending}
            onToggle={() => onToggle(trial)}
          />
        ))}
      {/* 운영에서 사진 숙제를 꺼 두면 체험이 목록에 없다. 남은 사진이 있으면 지울 수 있게 둔다. */}
      {data && !data.some((trial) => trial.key === 'HOMEWORK_PHOTO') ? (
        <HomeworkPhotoPanel enabled={false} leftoverOnly />
      ) : null}
      <TrialOffConfirm
        trialKey={confirmOffKey}
        onCancel={() => setConfirmOffKey(null)}
        onConfirm={(key) => {
          setConfirmOffKey(null)
          toggle.mutate({ key, enabled: false })
        }}
      />
    </section>
  )
}
