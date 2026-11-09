'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import { useToastStore } from '@/stores/toastStore'
import {
  featureTrialService,
  type FeatureTrial,
  type FeatureTrialKey,
} from '@/services/featureTrials'
import * as styles from '../aiSettings.css'
import * as css from './featureTrial.css'
import { StyleLearningPanel } from './StyleLearningPanel'

type TrialMeta = { label: string; help: string; onToast: string; offToast: string }

/** 화면에 두는 기능 체험. 서버가 여기 없는 체험을 주면 보이지 않는다. */
const TRIALS: Record<FeatureTrialKey, TrialMeta> = {
  STYLE_LEARNING: {
    label: 'AI가 내 말투 배우기',
    help: 'AI 초안을 고쳐 저장한 글을 모아 자주 고치는 말투를 찾고, 보내기 전에 만드는 초안에 반영해요',
    onToast: 'AI가 내 말투 배우기를 켰어요.',
    offToast: 'AI가 내 말투 배우기를 껐어요. 모은 기록은 그대로 있어요.',
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
      ) : null}
    </div>
  )
}

/**
 * AI 조교 화면의 "기능 체험" 칸. 켜고 끄면 바로 서버에 반영되고, 위 저장 버튼(AI 설정)과는 따로다.
 * manualMode는 지금 고른 피드백 방식(저장 전 값)이 직접 쓰기인지로, 말투 배우기 안내에만 쓴다.
 */
export function FeatureTrialSection({ manualMode }: { manualMode: boolean }) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
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
      ]),
  })

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
            onToggle={() => toggle.mutate({ key: trial.key, enabled: !trial.enabled })}
          />
        ))}
    </section>
  )
}
