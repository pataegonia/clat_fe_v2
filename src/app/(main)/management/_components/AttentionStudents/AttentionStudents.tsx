'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import Chip from '@/components/common/Chip'
import Button from '@/components/common/Button'
import { useToastStore } from '@/stores/toastStore'
import {
  riskSignalService,
  type CommentAnalysisState,
  type RiskCategory,
  type RiskDecision,
  type RiskSignal,
} from '@/services/riskSignals'
import * as styles from './AttentionStudents.css'

/** AI가 수업 기록을 읽는 동안 목록을 다시 불러오는 간격 */
const ANALYSIS_POLL_MS = 5_000

const CATEGORY_LABEL: Record<RiskCategory, string> = {
  LEARNING: '학습',
  ENGAGEMENT: '출결·연락',
}

const DECISION_LABEL: Record<RiskDecision, string> = {
  ACKNOWLEDGED: '확인함',
  NOT_APPLICABLE: '해당 없음',
}

/** AI가 수업 기록·메모를 읽는 중이거나, 나중에 이어서 읽거나, 읽지 못한 글이 있을 때만 알린다. */
function analysisNotices(state: CommentAnalysisState): string[] {
  const notices: string[] = []
  if (state.status === 'RUNNING') {
    notices.push(`AI가 수업 기록·메모 ${state.remaining}건을 읽고 있어요. 다 읽으면 목록에 더해져요.`)
  }
  if (state.status === 'WAITING' && state.resume_at) {
    notices.push(
      `수업 기록·메모 ${state.remaining}건은 ${format(parseISO(state.resume_at), 'M/d HH:mm')}에 이어서 읽어요.`,
    )
  }
  if (state.failed > 0) {
    notices.push(
      `수업 기록·메모 ${state.failed}건은 AI가 읽지 못해 목록에서 빠져 있어요. 몇 시간 뒤 다시 읽어요.`,
    )
  }
  return notices
}

/**
 * 학생·반 관리의 "살펴볼 학생" 탭 (ref/ai-features-plan.md 7장).
 * 이유와 근거 날짜를 보여 주고, 선생님이 "확인함 / 해당 없음"을 고른다. 고른 결과로 기준을 조정한다.
 */
export default function AttentionStudents() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const [includeReviewed, setIncludeReviewed] = useState(false)
  const queryKey = ['risk-signals', includeReviewed] as const
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => riskSignalService.list(includeReviewed),
    refetchInterval: (query) =>
      query.state.data?.comment_analysis?.status === 'RUNNING' ? ANALYSIS_POLL_MS : false,
  })
  const notices = data ? analysisNotices(data.comment_analysis) : []
  const aiOn = data != null && data.comment_analysis.status !== 'OFF'
  const review = useMutation({
    mutationFn: (input: { studentId: number; signal: RiskSignal; decision: RiskDecision }) =>
      riskSignalService.review({
        student_id: input.studentId,
        code: input.signal.code,
        evidence_key: input.signal.evidence_key,
        decision: input.decision,
      }),
    onSuccess: (_, input) => {
      void queryClient.invalidateQueries({ queryKey: ['risk-signals'] })
      addToast({
        variant: 'success',
        message:
          input.decision === 'ACKNOWLEDGED'
            ? '확인했어요. 같은 근거로는 다시 보이지 않아요.'
            : '해당 없음으로 남겼어요. 기준을 다듬는 데 써요.',
      })
    },
    onError: () => addToast({ variant: 'error', message: '확인 결과를 남기지 못했어요.' }),
  })

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Text variant="bodyMd" color="gray500">
          최근 60일 수업 기록에서 살펴보면 좋을 학생이에요. 이유와 날짜를 보고 &apos;확인함&apos; 또는
          &apos;해당 없음&apos;을 눌러 주세요. 학부모에게는 보이지 않아요.
          {aiOn ? " 'AI 분석'은 AI가 수업 기록과 메모를 읽고 찾은 것이라 틀릴 수 있어요." : null}
        </Text>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={includeReviewed}
            onChange={(event) => setIncludeReviewed(event.target.checked)}
          />
          <Text variant="bodyMd" color="gray700">
            확인한 것도 보기
          </Text>
        </label>
      </div>

      {notices.map((notice) => (
        <Text key={notice} variant="bodyMd" color="gray700">
          {notice}
        </Text>
      ))}
      {isLoading ? (
        <Text variant="bodyMd" color="gray500">
          불러오는 중…
        </Text>
      ) : null}
      {isError ? (
        <Text variant="bodyMd" color="error500">
          목록을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.
        </Text>
      ) : null}
      {data && data.students.length === 0 ? (
        <Text variant="bodyMd" color="gray500">
          지금 살펴볼 학생이 없어요.
        </Text>
      ) : null}

      <ul className={styles.list}>
        {data?.students.map((student) => (
          <li key={student.student_id} className={styles.card}>
            <Link href={`/students/${student.student_id}`} className={styles.name}>
              {student.name}
            </Link>
            <ul className={styles.signals}>
              {student.signals.map((signal) => (
                <li key={`${signal.code}-${signal.evidence_key}`} className={styles.signal}>
                  <div className={styles.signalText}>
                    <Chip
                      variant={signal.category === 'LEARNING' ? 'active' : 'inProgress'}
                      label={signal.source === 'AI' ? 'AI 분석' : CATEGORY_LABEL[signal.category]}
                    />
                    <Text variant="bodyMd">{signal.message}</Text>
                    {signal.class_name ? (
                      <Text variant="labelSm" color="gray500">
                        {signal.class_name}
                      </Text>
                    ) : null}
                  </div>
                  <div className={styles.actions}>
                    {signal.review ? (
                      <Chip variant="default" label={DECISION_LABEL[signal.review.decision]} />
                    ) : null}
                    {(['ACKNOWLEDGED', 'NOT_APPLICABLE'] as const)
                      .filter((decision) => signal.review?.decision !== decision)
                      .map((decision) => (
                        <Button
                          key={decision}
                          variant={decision === 'ACKNOWLEDGED' ? 'outlined' : 'ghost'}
                          size="sm"
                          disabled={review.isPending}
                          onClick={() =>
                            review.mutate({ studentId: student.student_id, signal, decision })
                          }
                        >
                          {signal.review
                            ? `${DECISION_LABEL[decision]}으로 바꾸기`
                            : DECISION_LABEL[decision]}
                        </Button>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
