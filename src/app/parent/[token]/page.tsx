'use client'

import { Suspense, use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  parentDashboardService,
  type ParentDashboardData,
  type ParentLessonListItem,
  type ParentNoticeItem,
  type ParentReportDetail,
  type ParentReportListItem,
} from '@/services/parentDashboard'
import ParentDashboardView from '../_components/ParentDashboardView'
import { ReportNumbers, ReportSummaryView } from '@/components/report/ReportView'
import { useTutorial } from '@/features/tutorial/TutorialProvider'
import * as styles from './parentDashboard.css'

function shiftDay(dateStr: string, days: number) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  date.setDate(date.getDate() - days)
  return format(date, 'yyyy-MM-dd')
}

function tutorialPastLessons(className: string, lessonDate: string): ParentLessonListItem[] {
  return [
    {
      lesson_id: -2,
      lesson_date: shiftDay(lessonDate, 14),
      class_name: className,
      template_name: '튜토리얼 틀',
    },
    {
      lesson_id: -1,
      lesson_date: shiftDay(lessonDate, 7),
      class_name: className,
      template_name: '튜토리얼 틀',
    },
  ]
}

function tutorialNotices(lessonDate: string): ParentNoticeItem[] {
  return [
    {
      batch_id: -2,
      sent_at: shiftDay(lessonDate, 10),
      body: '다음 주 휴강 안내예요. 수업은 그다음 주에 만나요.',
    },
    {
      batch_id: -1,
      sent_at: shiftDay(lessonDate, 3),
      body: '준비물 안내예요. 교재를 챙겨 주세요.',
    },
  ]
}

type Tab = 'lesson' | 'timeline' | 'notices' | 'reports'

function formatDay(value: string) {
  const parsed = parseISO(value.slice(0, 10))
  if (Number.isNaN(parsed.getTime())) return value
  return format(parsed, 'M월 d일 (E)', { locale: ko })
}

function ParentDashboardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()
  const search = useSearchParams()
  const lessonParam = search.get('lesson')
  const lessonId = lessonParam ? Number(lessonParam) : undefined
  // 보고서 도착 알림톡 링크는 ?tab=reports로 보고서 탭을 바로 연다
  const [tab, setTab] = useState<Tab>(() => (search.get('tab') === 'reports' ? 'reports' : 'lesson'))
  const [data, setData] = useState<ParentDashboardData | null>(null)
  const [lessons, setLessons] = useState<ParentLessonListItem[]>([])
  const [notices, setNotices] = useState<ParentNoticeItem[]>([])
  const [reports, setReports] = useState<ParentReportListItem[]>([])
  const [report, setReport] = useState<ParentReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const tour = useTutorial()
  const showSamples = tour.status === 'in_progress'
  const sampleDate = data?.lesson_date ?? new Date().toISOString().slice(0, 10)
  const sampleClass = data?.class_name ?? '클랫반'
  const displayLessons =
    showSamples && lessons.length < 2
      ? [...tutorialPastLessons(sampleClass, sampleDate), ...lessons]
      : lessons
  const displayNotices =
    showSamples && notices.length === 0 ? tutorialNotices(sampleDate) : notices

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErrorMsg(null)
    parentDashboardService
      .getByToken(token, Number.isFinite(lessonId) ? lessonId : undefined)
      .then((res) => {
        if (cancelled) return
        if (res.legacy_redirect && res.token) {
          const next = res.lesson_id
            ? `/parent/${res.token}?lesson=${res.lesson_id}`
            : `/parent/${res.token}`
          router.replace(next)
          return
        }
        setData(res)
        if (!lessonParam && res.lesson_id) {
          router.replace(`/parent/${token}?lesson=${res.lesson_id}`)
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const msg =
          (e as { response?: { data?: { error?: { message?: string }; message?: string } } })?.response
            ?.data?.error?.message ||
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          '학부모 대시보드 정보를 불러오지 못했어요.'
        setErrorMsg(msg)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lessonId, lessonParam, router, token])

  useEffect(() => {
    let cancelled = false
    parentDashboardService
      .listLessons(token)
      .then((res) => {
        if (!cancelled) setLessons(res.lessons)
      })
      .catch(() => {
        if (!cancelled) setLessons([])
      })
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (tab !== 'notices') return
    let cancelled = false
    parentDashboardService
      .listNotices(token)
      .then((res) => {
        if (!cancelled) setNotices(res.notices)
      })
      .catch(() => {
        if (!cancelled) setNotices([])
      })
    return () => {
      cancelled = true
    }
  }, [tab, token])

  useEffect(() => {
    if (tab !== 'reports') return
    let cancelled = false
    setReport(null)
    parentDashboardService
      .listReports(token)
      .then((res) => {
        if (!cancelled) setReports(res.reports)
      })
      .catch(() => {
        if (!cancelled) setReports([])
      })
    return () => {
      cancelled = true
    }
  }, [tab, token])

  const openReport = (reportId: number) => {
    parentDashboardService
      .getReport(token, reportId)
      .then(setReport)
      .catch(() => setReport(null))
  }

  const chrome = (
    <div className={styles.chrome}>
      <div className={styles.tabRow}>
        {(
          [
            ['lesson', '이번 수업'],
            ['timeline', '지난 수업'],
            ['notices', '공지'],
            ['reports', '보고서'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? `${styles.tabButton} ${styles.tabButtonOn}` : styles.tabButton}
            data-tour={`parent-tab-${id}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {lessons.length > 0 ? (
        <select
          className={styles.lessonSelect}
          value={data?.lesson_id ?? ''}
          onChange={(event) => {
            const next = event.target.value
            if (!next) return
            setTab('lesson')
            router.replace(`/parent/${token}?lesson=${next}`)
          }}
        >
          {lessons.map((lesson) => (
            <option key={lesson.lesson_id} value={lesson.lesson_id}>
              {formatDay(lesson.lesson_date)} {lesson.class_name}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  )

  return (
    <div className={styles.page}>
      {loading ? <div className={styles.stateBox}>불러오는 중...</div> : null}
      {!loading && errorMsg ? <div className={styles.stateBox}>{errorMsg}</div> : null}
      {!loading && !errorMsg && data && tab === 'lesson' ? (
        <ParentDashboardView data={data} header={chrome} />
      ) : null}
      {!loading && !errorMsg && data && tab !== 'lesson' ? (
        <div className={styles.frame}>
          {chrome}
          {tab === 'timeline' ? (
            <div data-tour="parent-timeline">
              {displayLessons.map((lesson) => (
                <button
                  key={lesson.lesson_id}
                  type="button"
                  className={styles.listCard}
                  onClick={() => {
                    setTab('lesson')
                    if (lesson.lesson_id > 0) {
                      router.replace(`/parent/${token}?lesson=${lesson.lesson_id}`)
                    }
                  }}
                >
                  <div className={styles.listTitle}>{formatDay(lesson.lesson_date)}</div>
                  <div className={styles.listMeta}>
                    {lesson.class_name} · {lesson.template_name}
                  </div>
                </button>
              ))}
              {displayLessons.length === 0 ? <div className={styles.stateBox}>아직 수업이 없어요.</div> : null}
            </div>
          ) : null}
          {tab === 'notices' ? (
            <div data-tour="parent-notices">
              {displayNotices.map((notice) => (
                <div key={notice.batch_id} className={styles.listCard}>
                  <div className={styles.listMeta}>{formatDay(notice.sent_at)}</div>
                  <div className={styles.noticeBody}>{notice.body}</div>
                </div>
              ))}
              {displayNotices.length === 0 ? <div className={styles.stateBox}>받은 공지가 없어요.</div> : null}
            </div>
          ) : null}
          {tab === 'reports' && report ? (
            <div className={styles.listCard}>
              <button type="button" className={styles.tabButton} onClick={() => setReport(null)}>
                ← 보고서 목록
              </button>
              <div className={styles.listTitle}>{`${report.student_name} 학생 ${report.label} 보고서`}</div>
              <div className={styles.listMeta}>{`${formatDay(report.period_start)} ~ ${formatDay(report.period_end)}`}</div>
              <ReportNumbers snapshot={report.snapshot} />
              {report.summary ? (
                <>
                  <div className={styles.listTitle}>선생님 총평</div>
                  <ReportSummaryView summary={report.summary} />
                </>
              ) : null}
            </div>
          ) : null}
          {tab === 'reports' && !report ? (
            <div>
              {reports.map((item) => (
                <button key={item.id} type="button" className={styles.listCard} onClick={() => openReport(item.id)}>
                  <div className={styles.listTitle}>{`${item.label} 보고서`}</div>
                  <div className={styles.listMeta}>{`${formatDay(item.period_start)} ~ ${formatDay(item.period_end)}`}</div>
                </button>
              ))}
              {reports.length === 0 ? <div className={styles.stateBox}>아직 받은 보고서가 없어요.</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default function Page(props: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<div className={styles.stateBox}>불러오는 중...</div>}>
      <ParentDashboardPage {...props} />
    </Suspense>
  )
}
