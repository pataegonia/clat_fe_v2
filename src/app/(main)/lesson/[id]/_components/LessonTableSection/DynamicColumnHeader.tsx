'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { LessonStudent } from '@/types/lessonStudent'
import type { LessonItemDetail } from '@/services/lesson'
import {
  thStyle,
  scoreColHeaderStyle,
  scoreHeaderMaxRowStyle,
  scoreHeaderMaxLabelStyle,
  scoreHeaderMaxSuffixStyle,
  scoreHeaderAvgDividerStyle,
  scoreHeaderAvgValueStyle,
  scoreInputMaxStyle,
  completeColHeaderStyle,
  completeHeaderNoteInputStyle,
  colHeaderWrapStyle,
  colHeaderTitleBlockStyle,
  itemControlButtonStyle,
  partialChipRecipe,
  partialTooltipStyle,
} from './LessonTable.css'
import {
  applyScoreMaxToAllStudents,
  applyCompleteNoteToAllStudents,
  formatScoreColumnAverage,
  getScoreColumnAverage,
  getScoreColumnMax,
  getCompleteColumnNote,
  isScoreItem,
  isCompleteItem,
} from './lessonTableUtils'
import { canMarkLessonItemPartial } from '@/lib/lessonProgress'

const PARTIAL_TIP = '입력되지 않은 학생의 문자에 포함되지 않습니다'

interface DynamicColumnHeaderProps {
  item: LessonItemDetail
  students: LessonStudent[]
  onChange: (students: LessonStudent[]) => void
  canRemove: boolean
  onRemoveColumn?: (item: LessonItemDetail) => void
  onTogglePartial?: (item: LessonItemDetail, isPartial: boolean) => void
}

function PartialInputChip({
  item,
  isPartial,
  onToggle,
}: {
  item: LessonItemDetail
  isPartial: boolean
  onToggle: (item: LessonItemDetail, isPartial: boolean) => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const updatePos = () => {
    const el = buttonRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ x: rect.left + rect.width / 2, y: rect.top })
  }

  const show = () => {
    updatePos()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onMove = () => updatePos()
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={partialChipRecipe({ on: isPartial })}
        aria-pressed={isPartial}
        aria-label={`${item.name} 일부입력. ${PARTIAL_TIP}`}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={() => onToggle(item, !isPartial)}
      >
        일부입력
      </button>
      {open
        ? createPortal(
            <span
              className={partialTooltipStyle}
              role="tooltip"
              style={
                {
                  '--partial-tooltip-x': `${pos.x}px`,
                  '--partial-tooltip-y': `${pos.y}px`,
                } as CSSProperties
              }
            >
              {PARTIAL_TIP}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}

export function DynamicColumnHeader({
  item,
  students,
  onChange,
  canRemove,
  onRemoveColumn,
  onTogglePartial,
}: DynamicColumnHeaderProps) {
  const isScore = isScoreItem(item)
  const isComplete = isCompleteItem(item)
  const showPartial = canMarkLessonItemPartial(item) && onTogglePartial != null
  const isPartial = item.is_partial === true

  const titleRow = (
    <div className={colHeaderWrapStyle}>
      <div className={colHeaderTitleBlockStyle}>
        <span>{item.name}</span>
        {showPartial && onTogglePartial ? (
          <PartialInputChip item={item} isPartial={isPartial} onToggle={onTogglePartial} />
        ) : null}
      </div>
      {canRemove ? (
        <button
          type="button"
          className={itemControlButtonStyle}
          aria-label={`${item.name} 항목 제거`}
          onClick={() => onRemoveColumn?.(item)}
        >
          ×
        </button>
      ) : null}
    </div>
  )

  return (
    <th className={thStyle}>
      {isScore ? (
        <div className={scoreColHeaderStyle}>
          {titleRow}
          <div className={scoreHeaderMaxRowStyle}>
            <span className={scoreHeaderMaxLabelStyle}>만점</span>
            <input
              className={scoreInputMaxStyle}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={getScoreColumnMax(students, item)}
              onChange={(ev) =>
                onChange(applyScoreMaxToAllStudents(students, item, ev.target.value))
              }
              placeholder="100"
              aria-label="이 항목 만점"
            />
            <span className={scoreHeaderMaxSuffixStyle} aria-hidden>
              점
            </span>
            <span className={scoreHeaderAvgDividerStyle} aria-hidden>
              ·
            </span>
            <span className={scoreHeaderMaxLabelStyle}>평균</span>
            <span className={scoreHeaderAvgValueStyle}>
              {formatScoreColumnAverage(getScoreColumnAverage(students, item))}
            </span>
          </div>
        </div>
      ) : isComplete ? (
        <div className={completeColHeaderStyle}>
          {titleRow}
          <div className={scoreHeaderMaxRowStyle}>
            <span className={scoreHeaderMaxLabelStyle}>내용</span>
            <input
              className={completeHeaderNoteInputStyle}
              type="text"
              autoComplete="off"
              value={getCompleteColumnNote(students, item)}
              onChange={(ev) =>
                onChange(applyCompleteNoteToAllStudents(students, item, ev.target.value))
              }
              onKeyDown={(ev) => ev.stopPropagation()}
              placeholder="선택"
              aria-label={`${item.name} 내용`}
            />
          </div>
        </div>
      ) : (
        titleRow
      )}
    </th>
  )
}
