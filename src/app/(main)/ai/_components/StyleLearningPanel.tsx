'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useToastStore } from '@/stores/toastStore'
import {
  styleLearningService,
  type StyleHabit,
  type StyleLearningState,
  type StyleLearningStatus,
} from '@/services/styleLearning'
import { extractApiErrorMessage } from '../_lib/aiSettingsShared'
import * as css from './featureTrial.css'

/** AI가 말투를 배우는 동안 상태를 다시 불러오는 간격 */
const LEARNING_POLL_MS = 4_000

/** 다시 배우기를 누를 수 없는 상태: AI 키 없음, 배우는 중, 다음 날로 미룸 */
const RELEARN_BLOCKED: StyleLearningStatus[] = ['OFF', 'RUNNING', 'WAITING']

type PanelProps = { enabled: boolean; manualMode: boolean }

/**
 * 다시 배우기·습관 지우기·모은 기록 지우기. 성공해도 실패해도 상태를 다시 불러오고,
 * 다 불러올 때까지 버튼을 막는다(onSettled가 promise를 돌려준다).
 */
function useStyleLearningActions() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const done = (message: string) => addToast({ variant: 'success', message })
  const fail = (message: string) => addToast({ variant: 'error', message })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['style-learning'] })

  const relearn = useMutation({
    mutationFn: () => styleLearningService.relearn(),
    onSuccess: () => done('말투를 다시 배우고 있어요.'),
    onError: (e) => fail(extractApiErrorMessage(e, '다시 배우기를 시작하지 못했어요.')),
    onSettled: refresh,
  })
  const removeHabit = useMutation({
    mutationFn: (id: number) => styleLearningService.removeHabit(id),
    onSuccess: () => done('습관을 지웠어요. 다음 초안부터 쓰지 않아요.'),
    onError: () => fail('습관을 지우지 못했어요.'),
    onSettled: refresh,
  })
  const clear = useMutation({
    mutationFn: () => styleLearningService.clear(),
    onSuccess: () => done('모은 기록을 지웠어요.'),
    onError: () => fail('모은 기록을 지우지 못했어요.'),
    onSettled: refresh,
  })
  return { relearn, removeHabit, clear }
}

/** 다시 배우기를 누를 수 있는지. 서버도 같은 조건으로 막는다(400). */
function canRelearn(state: StyleLearningState, enabled: boolean): boolean {
  return (
    enabled &&
    state.pair_count >= state.min_pairs &&
    state.habits.length < state.max_habits &&
    !RELEARN_BLOCKED.includes(state.learning.status)
  )
}

/** 꺼 둠·직접 쓰기·AI 키 없음 안내와 모은 고친 글 수 */
function StatusLines({ state, enabled, manualMode }: PanelProps & { state: StyleLearningState }) {
  const { pair_count, min_pairs } = state
  return (
    <>
      {!enabled ? (
        <Text color="gray500">
          꺼 두는 동안에는 고친 글을 모으지 않고, 배운 습관도 초안에 쓰지 않아요. 모은 기록은 지우기
          전까지 남아 있어요.
        </Text>
      ) : null}
      {enabled && manualMode ? (
        <Text color="gray700">직접 쓰기 모드에서는 AI 초안이 없어 고친 글을 모으지 않아요.</Text>
      ) : null}
      {state.learning.status === 'OFF' ? (
        <Text color="gray700">지금은 AI를 쓸 수 없어 말투를 배우지 않아요.</Text>
      ) : null}
      <Text variant="bodyMd">
        {pair_count < min_pairs
          ? `고친 글 ${pair_count}/${min_pairs}건 · ${min_pairs}건이 모이면 말투를 배워요`
          : `고친 글 ${pair_count}건`}
      </Text>
      {enabled ? (
        <Text variant="labelSm" color="gray500">
          인사말·맺음말과 점수·출결 같은 사실을 고친 것은 배우지 않아요
        </Text>
      ) : null}
    </>
  )
}

/** 배우는 중·미룸(켜져 있을 때만)과 실패(꺼 두어도 보인다) */
function ProgressLines({
  learning,
  enabled,
}: {
  learning: StyleLearningState['learning']
  enabled: boolean
}) {
  return (
    <>
      {enabled && learning.status === 'RUNNING' ? (
        <Text color="gray500">AI가 말투를 배우고 있어요…</Text>
      ) : null}
      {enabled && learning.status === 'WAITING' && learning.resume_at ? (
        <Text color="gray700">
          {`오늘 AI 사용량이 많아 ${format(parseISO(learning.resume_at), 'M/d HH:mm')}에 이어서 배워요.`}
        </Text>
      ) : null}
      {learning.status === 'FAILED' ? (
        <Text color="gray700">
          {enabled
            ? '말투를 배우지 못했어요. 다시 배우기를 눌러 주세요.'
            : '말투를 배우지 못했어요. 켜고 다시 배우기를 누르면 다시 배워요.'}
        </Text>
      ) : null}
    </>
  )
}

type HabitListProps = { habits: StyleHabit[]; removing: boolean; onRemove: (id: number) => void }

/** 찾은 습관 목록. 맞지 않는 습관은 하나씩 지운다(지우기 전까지 초안에 계속 쓴다). */
function HabitList({ habits, removing, onRemove }: HabitListProps) {
  return (
    <>
      <Text variant="titleSm" color="gray700" as="h4">
        찾은 말투 습관
      </Text>
      <Text variant="labelSm" color="gray500">
        AI가 찾은 습관이라 틀릴 수 있어요. 맞지 않는 습관은 지워 주세요(지우기 전까지 계속 써요)
      </Text>
      <ul className={css.habitList}>
        {habits.map((habit) => (
          <li key={habit.id} className={css.habitItem}>
            <Text>{habit.text}</Text>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`습관 지우기: ${habit.text}`}
              disabled={removing}
              onClick={() => onRemove(habit.id)}
            >
              지우기
            </Button>
          </li>
        ))}
      </ul>
    </>
  )
}

/** 찾은 습관(없으면 배운 적이 있을 때만 알림), 습관이 꽉 찼을 때 안내, 마지막으로 배운 때 */
function HabitLines({
  state,
  enabled,
  removing,
  onRemove,
}: Omit<HabitListProps, 'habits'> & {
  state: StyleLearningState
  enabled: boolean
}) {
  const { habits, max_habits, learned_at } = state
  return (
    <>
      {habits.length > 0 ? (
        <HabitList habits={habits} removing={removing} onRemove={onRemove} />
      ) : learned_at ? (
        <Text color="gray500">지금 초안에 쓰는 말투 습관이 없어요.</Text>
      ) : null}
      {enabled && habits.length >= max_habits ? (
        <Text variant="labelSm" color="gray500">
          {`습관은 ${max_habits}개까지 둬요. 맞지 않는 습관을 지우면 새로 배울 수 있어요`}
        </Text>
      ) : null}
      {learned_at ? (
        <Text variant="labelSm" color="gray500">
          {`마지막으로 배운 때 ${format(parseISO(learned_at), 'M/d HH:mm')}`}
        </Text>
      ) : null}
    </>
  )
}

/** 그대로 보낸 비율. 배우기 전·배운 뒤 모두 보낸 글이 충분할 때(rate가 있을 때)만 보인다. */
function EffectLines({ effect }: { effect: StyleLearningState['effect'] }) {
  if (!effect) return null
  const { before, after } = effect
  if (before.rate == null || after.rate == null) return null
  return (
    <div className={css.effect}>
      <Text variant="bodyMd">
        {`그대로 보낸 비율 배우기 전 ${Math.round(before.rate * 100)}% → 배운 뒤 ${Math.round(after.rate * 100)}%`}
      </Text>
      <Text variant="labelSm" color="gray500">
        {`AI 초안을 고치지 않고 보낸 비율이에요 · 보낸 글 ${before.sent}건, ${after.sent}건 기준`}
      </Text>
    </div>
  )
}

/** 모은 기록 지우기. 되돌릴 수 없어 한 번 더 묻고, 닫은 뒤에 지운다. */
function ClearButton({ disabled, onClear }: { disabled: boolean; onClear: () => void }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} disabled={disabled}>
        모은 기록 지우기
      </Button>
      <ConfirmModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          onClear()
        }}
        title="모은 기록을 지울까요?"
        descriptions={[
          '모은 고친 글과 배운 습관이 모두 지워져요.',
          '지운 뒤에는 되돌릴 수 없어요.',
        ]}
        confirmLabel="지우기"
        cancelLabel="취소"
        confirmVariant="danger"
      />
    </>
  )
}

/**
 * 기능 체험 "AI가 내 말투 배우기"의 상태 칸. 모은 고친 글 수·찾은 습관·그대로 보낸 비율을 보여 주고
 * 다시 배우기, 습관 지우기, 모은 기록 지우기를 둔다. 숫자와 상태는 모두 서버가 정한다.
 * 꺼져 있고 모은 기록도 없으면 아무것도 보이지 않는다.
 */
export function StyleLearningPanel({ enabled, manualMode }: PanelProps) {
  const { data, isPending } = useQuery({
    queryKey: ['style-learning'],
    queryFn: () => styleLearningService.get(),
    // 수업 화면에서 고친 글은 이 캐시를 바꾸지 않으므로 들어올 때마다 다시 읽는다.
    refetchOnMount: 'always',
    refetchInterval: (q) =>
      q.state.data?.learning.status === 'RUNNING' ? LEARNING_POLL_MS : false,
  })
  const { relearn, removeHabit, clear } = useStyleLearningActions()

  if (isPending) return <Text color="gray500">불러오는 중…</Text>
  // 다시 불러오기만 실패했으면 가진 상태를 그대로 보인다(열린 확인 창도 닫지 않는다).
  if (!data) {
    return (
      <Text color="error500">말투 배우기 상태를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</Text>
    )
  }
  const nothingSaved = !data.has_records
  if (!enabled && nothingSaved) return null

  return (
    <div className={css.panel}>
      <StatusLines state={data} enabled={enabled} manualMode={manualMode} />
      <ProgressLines learning={data.learning} enabled={enabled} />
      <HabitLines
        state={data}
        enabled={enabled}
        removing={removeHabit.isPending}
        onRemove={(id) => removeHabit.mutate(id)}
      />
      <EffectLines effect={data.effect} />
      <div className={css.actions}>
        <ClearButton disabled={nothingSaved || clear.isPending} onClear={() => clear.mutate()} />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => relearn.mutate()}
          disabled={!canRelearn(data, enabled) || relearn.isPending}
        >
          다시 배우기
        </Button>
      </div>
    </div>
  )
}
