'use client'

import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import { queryKeys } from '@/lib/queryKeys'
import {
  briefingService,
  type BriefingAiSummary,
  type BriefingLessonRef,
  type TodayBriefing as Briefing,
} from '@/services/briefing'
import * as styles from './TodayBriefing.css'

const BRIEFING_POLL_MS = 60_000
/** AI 요약을 만드는 동안 더 자주 확인한다. */
const SUMMARY_POLL_MS = 4_000

/** 'YYYY-MM-DD' → 'M/D' */
function shortDate(date: string) {
  const [, month, day] = date.split('-')
  return `${Number(month)}/${Number(day)}`
}

type TodoLine = {
  key: string
  label: string
  links: Array<{ key: string; href: string; text: string }>
  more: number
}

const lessonLinks = (items: BriefingLessonRef[]) =>
  items.map((item) => ({
    key: `lesson-${item.lesson_id}`,
    href: `/lesson/${item.lesson_id}`,
    text: `${item.class_name} ${shortDate(item.lesson_date)}`,
  }))

function todoLines(todos: Briefing['todos']): TodoLine[] {
  const lines: TodoLine[] = []
  const { unsaved_lessons: unsaved, unsent_lessons: unsent, failed_messages: failed } = todos
  if (unsaved.total > 0) {
    lines.push({
      key: 'unsaved',
      label: `저장하지 않은 지난 수업 ${unsaved.total}개`,
      links: lessonLinks(unsaved.items),
      more: unsaved.total - unsaved.items.length,
    })
  }
  if (unsent.total > 0) {
    lines.push({
      key: 'unsent',
      label: `알림톡을 보내지 않은 수업 ${unsent.total}개`,
      links: lessonLinks(unsent.items),
      more: unsent.total - unsent.items.length,
    })
  }
  if (failed.total > 0) {
    lines.push({
      key: 'failed',
      label: `보내지 못한 문자가 있는 발송 ${failed.total}건`,
      links: failed.items.map((batch) => ({
        key: `batch-${batch.batch_id}`,
        href: batch.lesson_id ? `/lesson/${batch.lesson_id}` : '/alimtalk',
        text: `${batch.class_name ?? '전체 공지'} (${batch.fail_count}건 실패)`,
      })),
      more: failed.total - failed.items.length,
    })
  }
  if (todos.cancelled_schedules.total > 0) {
    lines.push({
      key: 'cancelled',
      label: `입력이 바뀌어 예약이 취소된 수업 ${todos.cancelled_schedules.total}개`,
      links: lessonLinks(todos.cancelled_schedules.items),
      more: todos.cancelled_schedules.total - todos.cancelled_schedules.items.length,
    })
  }
  const ai = todos.ai_feedback
  if (ai.pending + ai.failed > 0) {
    const parts = [ai.pending > 0 ? `만드는 중 ${ai.pending}명` : '', ai.failed > 0 ? `실패 ${ai.failed}명` : '']
    lines.push({
      key: 'ai',
      label: `AI 피드백 ${parts.filter(Boolean).join(' · ')}`,
      links: lessonLinks(ai.lessons),
      more: 0,
    })
  }
  return lines
}

/** 학생 메모·지난 수업 기록 AI 요약. 선생님만 보는 보조 정보라 틀릴 수 있다고 함께 적는다. */
function AiSummary({ summary }: { summary: BriefingAiSummary }) {
  const queryClient = useQueryClient()
  const retry = useMutation({
    mutationFn: () => briefingService.retrySummary(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.briefing.today }),
  })
  const lines = summary.status === 'FAILED' ? null : summary.lines
  return (
    <div className={styles.section}>
      <div className={styles.summaryHeader}>
        <Text variant="titleSm" color="gray700" as="h3">
          AI 요약
        </Text>
        <Text variant="labelSm" color="gray500">
          학생 메모와 지난 수업 기록을 AI가 줄였어요. 틀릴 수 있어요.
        </Text>
      </div>
      {lines ? (
        <ul className={styles.list}>
          {lines.map((line, index) => (
            <li key={`${index}-${line}`}>
              <Text variant="bodyMd">{line}</Text>
            </li>
          ))}
        </ul>
      ) : null}
      {summary.status === 'PENDING' ? (
        <Text variant="bodyMd" color="gray500">
          {lines ? '기록이 바뀌어 다시 요약하는 중이에요…' : '요약하는 중이에요…'}
        </Text>
      ) : null}
      {summary.status === 'FAILED' ? (
        <div className={styles.summaryFailed}>
          <Text variant="bodyMd" color="gray500">
            {summary.fail_reason === 'LIMITED'
              ? '오늘 AI 사용 한도를 다 써서 요약하지 못했어요.'
              : '요약을 만들지 못했어요.'}
          </Text>
          {summary.fail_reason === 'LIMITED' ? null : (
            <Button variant="ghost" size="sm" disabled={retry.isPending} onClick={() => retry.mutate()}>
              다시 요약
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

/**
 * 수업 입력 화면의 오늘 브리핑 (ref/ai-features-plan.md 6장). 오늘 날짜를 골랐을 때만 보인다.
 * date는 화면에서 고른 날짜(YYYY-MM-DD). 서버의 오늘(한국 날짜)과 다르면(자정을 넘긴 창 등) 숨긴다.
 */
export default function TodayBriefing({ date }: { date: string }) {
  const { data, isError } = useQuery({
    queryKey: queryKeys.briefing.today,
    queryFn: () => briefingService.getToday(),
    refetchOnMount: 'always',
    refetchInterval: (query) =>
      query.state.data?.ai_summary?.status === 'PENDING' ? SUMMARY_POLL_MS : BRIEFING_POLL_MS,
  })
  // 브리핑은 보조 정보라 실패하면 조용히 숨긴다.
  if (isError || !data || data.date !== date) return null

  const lines = todoLines(data.todos)
  const studentClasses = data.classes.filter((cls) => cls.students.length > 0)
  const continueClasses = data.classes.filter(
    (cls) => (cls.previous_lesson?.common_items.length ?? 0) > 0,
  )
  const empty =
    lines.length === 0 && studentClasses.length === 0 && continueClasses.length === 0 && !data.ai_summary

  return (
    <section className={styles.card} aria-label="오늘 브리핑">
      <Text variant="headingSm" as="h2">
        오늘 브리핑
      </Text>
      {data.ai_summary ? <AiSummary summary={data.ai_summary} /> : null}
      {empty ? (
        <Text variant="bodyMd" color="gray500">
          오늘 챙길 일이 없어요.
        </Text>
      ) : null}

      {lines.length > 0 ? (
        <div className={styles.section}>
          <Text variant="titleSm" color="gray700" as="h3">
            할 일
          </Text>
          <ul className={styles.list}>
            {lines.map((line) => (
              <li key={line.key} className={styles.todoItem}>
                <Text variant="bodyMd">{line.label}</Text>
                <span className={styles.links}>
                  {line.links.map((link) => (
                    <Link key={link.key} href={link.href} className={styles.link}>
                      {link.text}
                    </Link>
                  ))}
                  {line.more > 0 ? (
                    <Text variant="labelSm" color="gray500">{`외 ${line.more}개`}</Text>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {studentClasses.length > 0 ? (
        <div className={styles.section}>
          <Text variant="titleSm" color="gray700" as="h3">
            오늘 올 학생
          </Text>
          {studentClasses.map((cls) => (
            <div key={cls.class_id} className={styles.classBlock}>
              <Text variant="labelSm" color="gray500">
                {cls.class_name}
              </Text>
              <ul className={styles.list}>
                {cls.students.map((student) => (
                  <li key={student.student_id} className={styles.studentItem}>
                    <Link href={`/students/${student.student_id}`} className={styles.studentName}>
                      {student.name}
                    </Link>
                    <Text variant="bodyMd" color="gray700">
                      {student.notes.map((note) => note.message).join(' · ')}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {continueClasses.length > 0 ? (
        <div className={styles.section}>
          <Text variant="titleSm" color="gray700" as="h3">
            이어서 할 것
          </Text>
          {continueClasses.map((cls) => (
            <div key={cls.class_id} className={styles.classBlock}>
              <Text variant="labelSm" color="gray500">
                {`${cls.class_name} · 지난 수업 ${shortDate(cls.previous_lesson!.lesson_date)}`}
              </Text>
              <ul className={styles.list}>
                {cls.previous_lesson!.common_items.map((item, index) => (
                  <li key={`${index}-${item.name}`}>
                    <Text variant="bodyMd">{`${item.name}: ${item.value}`}</Text>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
