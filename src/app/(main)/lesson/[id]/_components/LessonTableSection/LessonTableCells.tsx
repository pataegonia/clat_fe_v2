'use client'

import { useLayoutEffect, useRef } from 'react'

import type { Attendance, CompletionStatus } from '@/types/lessonStudent'
import { joinScoreStorage, splitScoreStorage } from '@/lib/lessonScore'
import { isCoreAttendanceLabel } from '@/lib/attendanceLabels'
import { HW_CELL_LABELS, HW_LESSON_LABELS, photoBadgeText } from '@/lib/homeworkPhoto/labels'
import type { HwRowView } from '@/lib/homeworkPhoto/rowState'
import {
  aiMarkStyle,
  cellButtonGroupStyle,
  cellButtonRecipe,
  extraCellButtonStyle,
  hwBadgeRecipe,
  hwBadgeRowStyle,
  scoreInputStyle,
  textCellAreaStyle,
  textCellWrapStyle,
} from './LessonTable.css'

export function AttendanceCell({
  value,
  extraLabels = [],
  onChange,
  tourAnchor,
}: {
  value: Attendance
  extraLabels?: string[]
  onChange: (v: Attendance) => void
  tourAnchor?: string
}) {
  const extras = extraLabels.filter((label) => label && !isCoreAttendanceLabel(label))
  const orphan =
    value && !isCoreAttendanceLabel(value) && !extras.includes(value) ? value : null
  const extraButtons = orphan ? [...extras, orphan] : extras

  return (
    <div className={cellButtonGroupStyle}>
      <button
        type="button"
        className={cellButtonRecipe({ variant: value === '출석' ? 'attend' : 'default' })}
        onClick={() => onChange(value === '출석' ? null : '출석')}
        data-tour={tourAnchor}
      >
        출석
      </button>
      <button
        type="button"
        className={cellButtonRecipe({ variant: value === '지각' ? 'late' : 'default' })}
        onClick={() => onChange(value === '지각' ? null : '지각')}
      >
        지각
      </button>
      <button
        type="button"
        className={cellButtonRecipe({ variant: value === '결석' ? 'absent' : 'default' })}
        onClick={() => onChange(value === '결석' ? null : '결석')}
      >
        결석
      </button>
      {extraButtons.map((label) => (
        <button
          type="button"
          key={label}
          className={`${cellButtonRecipe({ variant: value === label ? 'extraOn' : 'default' })} ${extraCellButtonStyle}`}
          onClick={() => onChange(value === label ? null : label)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function CompletionCell({
  value,
  onChange,
  suggestion = null,
  aiMark = false,
}: {
  value: CompletionStatus
  onChange: (v: CompletionStatus) => void
  /** 빈 칸에 연하게 보이는 AI 제안(사진 숙제 AI 확인). 저장 전이고, 누르면 그 값이 저장된다. */
  suggestion?: '완료' | '미완료' | null
  /** 적용한 AI 제안 그대로인 칸 */
  aiMark?: boolean
}) {
  const suggested = value === null ? suggestion : null
  return (
    <div className={cellButtonGroupStyle}>
      <button
        className={cellButtonRecipe({
          variant: value === '완료' ? 'done' : suggested === '완료' ? 'suggested' : 'default',
        })}
        onClick={() => onChange(value === '완료' ? null : '완료')}
      >
        {suggested === '완료' ? HW_CELL_LABELS.suggestComplete : '완료'}
      </button>
      <button
        className={cellButtonRecipe({
          variant: value === '미완료' ? 'undone' : suggested === '미완료' ? 'suggested' : 'default',
        })}
        onClick={() => onChange(value === '미완료' ? null : '미완료')}
      >
        {suggested === '미완료' ? HW_CELL_LABELS.suggestIncomplete : '미완료'}
      </button>
      {aiMark ? <span className={aiMarkStyle}>{HW_CELL_LABELS.aiMark}</span> : null}
    </div>
  )
}

/**
 * 사진 숙제 표시: '사진 2 · 9/12', '확인 필요'(여럿이면 '확인 필요 3'), 'AI 확인 중'.
 * 숙제 칸 버튼 아래(숙제 칸이 없으면 이름 칸)에 두고, 누르면 그 학생의 옆 창이 열린다.
 */
export function HomeworkPhotoBadges({ row, onOpen }: { row: HwRowView; onOpen: () => void }) {
  const showPhoto = row.ownSubmissionId !== null
  const showReview = row.reviewCount > 0
  const showChecking = row.ownState === 'CHECKING'
  if (!showPhoto && !showReview && !showChecking) return null
  return (
    <div className={hwBadgeRowStyle}>
      {showPhoto ? (
        <button type="button" className={hwBadgeRecipe({ tone: 'photo' })} onClick={onOpen}>
          {photoBadgeText(row.photoCount, row.completeness)}
        </button>
      ) : null}
      {showReview ? (
        <button type="button" className={hwBadgeRecipe({ tone: 'review' })} onClick={onOpen}>
          {row.reviewCount > 1
            ? `${HW_LESSON_LABELS.review} ${row.reviewCount}`
            : HW_LESSON_LABELS.review}
        </button>
      ) : null}
      {showChecking ? (
        <button type="button" className={hwBadgeRecipe({ tone: 'checking' })} onClick={onOpen}>
          {HW_LESSON_LABELS.checking}
        </button>
      ) : null}
    </div>
  )
}

export function SelectCell({
  options,
  value,
  onChange,
}: {
  options: { id: number; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className={cellButtonGroupStyle}>
      {options.map((opt) => (
        <button
          key={opt.id}
          className={cellButtonRecipe({ variant: value === opt.label ? 'attend' : 'default' })}
          onClick={() => onChange(value === opt.label ? '' : opt.label)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function ScoreEarnedCell({
  value,
  columnMax,
  onChange,
  onBlur,
}: {
  value: string
  columnMax: string
  onChange: (v: string) => void
  onBlur?: () => void
}) {
  const { earned } = splitScoreStorage(value)
  return (
    <input
      className={scoreInputStyle}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={earned}
      onChange={(ev) => onChange(joinScoreStorage(ev.target.value, columnMax))}
      onBlur={() => onBlur?.()}
      placeholder="—"
      aria-label="얻은 점수"
    />
  )
}

export function TextInputCell({
  value,
  onChange,
  onBlur,
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const area = areaRef.current
    if (!wrap || !area) return

    const fit = () => {
      const left = wrap.getBoundingClientRect().left
      const maxW = Math.max(96, Math.floor(window.innerWidth - Math.max(0, left) - 16))
      wrap.style.maxWidth = `${maxW}px`
      area.style.height = 'auto'
      area.style.height = `${Math.max(24, area.scrollHeight)}px`
    }

    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [value])

  return (
    <div ref={wrapRef} className={textCellWrapStyle}>
      <textarea
        ref={areaRef}
        className={textCellAreaStyle}
        rows={1}
        value={value}
        placeholder="—"
        onChange={(ev) => onChange(ev.target.value)}
        onBlur={() => onBlur?.()}
      />
    </div>
  )
}
