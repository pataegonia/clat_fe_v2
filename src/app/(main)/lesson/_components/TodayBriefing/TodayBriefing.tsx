'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import { queryKeys } from '@/lib/queryKeys'
import { briefingService, type BriefingLessonRef, type TodayBriefing as Briefing } from '@/services/briefing'
import * as styles from './TodayBriefing.css'

/** 'YYYY-MM-DD' → 'M/D' */
function shortDate(date: string) {
  const [, month, day] = date.split('-')
  return `${Number(month)}/${Number(day)}`
}

type TodoLine = {
  key: string
  label: string
  links: Array<{ href: string; text: string }>
  more: number
}

const lessonLinks = (items: BriefingLessonRef[]) =>
  items.map((item) => ({
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

/** 수업 입력 화면의 오늘 브리핑 (ref/ai-features-plan.md 6장). 오늘 날짜를 골랐을 때만 보인다. */
export default function TodayBriefing() {
  const { data, isError } = useQuery({
    queryKey: queryKeys.briefing.today,
    queryFn: () => briefingService.getToday(),
    refetchOnMount: 'always',
    refetchInterval: 60_000,
  })
  // 브리핑은 보조 정보라 실패하면 조용히 숨긴다.
  if (isError || !data) return null

  const lines = todoLines(data.todos)
  const studentClasses = data.classes.filter((cls) => cls.students.length > 0)
  const continueClasses = data.classes.filter(
    (cls) => (cls.previous_lesson?.common_items.length ?? 0) > 0,
  )
  const empty = lines.length === 0 && studentClasses.length === 0 && continueClasses.length === 0

  return (
    <section className={styles.card} aria-label="오늘 브리핑">
      <Text variant="headingSm" as="h2">
        오늘 브리핑
      </Text>
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
                    <Link key={`${link.href}-${link.text}`} href={link.href} className={styles.link}>
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
                {cls.previous_lesson!.common_items.map((item) => (
                  <li key={item.name}>
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
