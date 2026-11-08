'use client'

import { useState } from 'react'
import { format, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import { useToastStore } from '@/stores/toastStore'
import { reportNotificationNote, reportService, type ReportKind } from '@/services/reports'
import ReportCard from './_components/ReportCard'
import * as styles from './reports.css'

/** 바로 앞의 끝난 기간 시작일: 지난주 월요일, 지난달 1일 */
function previousPeriodStart(kind: ReportKind): string {
  const now = new Date()
  const start =
    kind === 'WEEKLY' ? startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) : startOfMonth(subMonths(now, 1))
  return format(start, 'yyyy-MM-dd')
}

const KIND_TABS: Array<{ kind: ReportKind; label: string }> = [
  { kind: 'MONTHLY', label: '월간' },
  { kind: 'WEEKLY', label: '주간' },
]

/** 보고서 (ref/ai-features-plan.md 8장): 월간은 AI 총평을 확인하고 공개, 주간은 숫자만 자동 공개 */
export default function ReportsPage() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const [kind, setKind] = useState<ReportKind>('MONTHLY')
  const [periodStart, setPeriodStart] = useState<string | undefined>(undefined)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const periods = useQuery({ queryKey: ['reports', 'periods', kind], queryFn: () => reportService.periods(kind) })
  const list = useQuery({
    queryKey: ['reports', 'list', kind, periodStart ?? 'latest'],
    queryFn: () => reportService.list(kind, periodStart),
    // AI가 총평을 쓰는 동안만 다시 불러온다
    refetchInterval: (query) => (query.state.data?.reports.some((report) => report.status === 'DRAFT') ? 3000 : false),
  })
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['reports'] })

  const generate = useMutation({
    mutationFn: () => reportService.generate(kind, previousPeriodStart(kind)),
    onSuccess: () => {
      setPeriodStart(undefined)
      setTimeout(refresh, 1500)
      addToast({ variant: 'success', message: '보고서를 만들고 있어요. 잠시 뒤 목록에 나와요.' })
    },
    onError: () => addToast({ variant: 'error', message: '보고서를 만들지 못했어요.' }),
  })
  const publish = useMutation({
    mutationFn: (ids: number[]) => reportService.publish(ids),
    onSuccess: (result) => {
      setSelected(new Set())
      refresh()
      addToast({
        variant: 'success',
        message: `${result.published_count}명 보고서를 학부모에게 공개했어요.${reportNotificationNote(result.notification)}`,
      })
    },
    onError: () => addToast({ variant: 'error', message: '공개하지 못했어요.' }),
  })

  const reports = list.data?.reports ?? []
  const publishable = (status: string) => status === 'READY' || status === 'APPROVED'
  const waiting = reports.filter((report) => publishable(report.status)).length

  return (
    <div className={styles.page}>
      <Text variant="display" as="h1">
        보고서
      </Text>
      <div className={styles.tabs}>
        {KIND_TABS.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            className={kind === tab.kind ? styles.tabActive : styles.tab}
            onClick={() => {
              setKind(tab.kind)
              setPeriodStart(undefined)
              setSelected(new Set())
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Text variant="bodyMd" color="gray500">
        {kind === 'MONTHLY'
          ? '월간 보고서는 숫자와 AI가 쓴 총평을 담아요. 확인하고 공개해야 학부모에게 보여요. 지난달 보고서는 매달 3일에 자동으로 만들어져요.'
          : '주간 보고서는 출석률·과제 완료율·점수만 담아 만들 때 바로 학부모에게 공개돼요. 지난주 보고서는 매주 화요일에 자동으로 만들어져요.'}
      </Text>

      <div className={styles.toolbar}>
        {periods.data && periods.data.length > 0 ? (
          <select
            className={styles.select}
            value={list.data?.period_start ?? ''}
            onChange={(event) => {
              setPeriodStart(event.target.value || undefined)
              setSelected(new Set())
            }}
            aria-label="기간"
          >
            {periods.data.map((period) => (
              <option key={period.period_start} value={period.period_start}>
                {period.label}
              </option>
            ))}
          </select>
        ) : null}
        <Button variant="secondary" size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}>
          {kind === 'MONTHLY' ? '지난달 보고서 만들기' : '지난주 보고서 만들기'}
        </Button>
        {kind === 'MONTHLY' ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => publish.mutate([...selected])}
            disabled={selected.size === 0 || publish.isPending}
          >
            {`선택한 ${selected.size}명 공개`}
          </Button>
        ) : null}
        {kind === 'MONTHLY' && waiting > 0 ? (
          <Text variant="bodyMd" color="gray700">{`공개를 기다리는 보고서 ${waiting}개`}</Text>
        ) : null}
      </div>

      {list.isLoading ? (
        <Text variant="bodyMd" color="gray500">
          불러오는 중…
        </Text>
      ) : null}
      {!list.isLoading && reports.length === 0 ? (
        <Text variant="bodyMd" color="gray500">
          아직 보고서가 없어요. 위 버튼으로 바로 만들 수 있어요.
        </Text>
      ) : null}

      <ul className={styles.list}>
        {reports.map((report) => (
          <ReportCard
            key={`${report.id}-${report.status}-${report.summary_source ?? ''}`}
            report={report}
            selectable={kind === 'MONTHLY' && publishable(report.status)}
            selected={selected.has(report.id)}
            onToggle={() =>
              setSelected((prev) => {
                const next = new Set(prev)
                if (next.has(report.id)) next.delete(report.id)
                else next.add(report.id)
                return next
              })
            }
            onChanged={refresh}
          />
        ))}
      </ul>
    </div>
  )
}
