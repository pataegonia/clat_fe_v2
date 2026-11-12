'use client'

import { useState } from 'react'
import { HW_STUDENT_LABELS } from '@/lib/homeworkPhoto/labels'
import type { HwPublicClass } from '@/types/homeworkPhoto'
import { classTargets, type SubmitTarget } from '../_lib/targetLabel'
import * as styles from '../submit.css'

const NO_TARGET = '낼 숙제가 없어요. 선생님께 물어봐 주세요'

type TargetPickerProps = {
  classes: HwPublicClass[]
  /** 지금 고른 숙제. 없으면 null */
  selected: SubmitTarget | null
  disabled: boolean
  onSelect: (key: string | null) => void
}

type TargetOptionProps = {
  target: SubmitTarget
  selected: boolean
  disabled: boolean
  onSelect: (key: string) => void
}

function TargetOption({ target, selected, disabled, onSelect }: TargetOptionProps) {
  return (
    <button
      type="button"
      className={selected ? styles.option.on : styles.option.off}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(target.key)}
    >
      {target.title ? <span className={styles.optionTitle}>{target.title}</span> : null}
      <span className={styles.optionLabel}>{target.label}</span>
    </button>
  )
}

/**
 * 낼 숙제 고르기. 반이 여럿이면 반부터 고른다.
 * 수업이 있는 날에는 오늘 수업·다음 수업 중에 고르고,
 * 미완료로 남은 지난 숙제는 '늦게 내기'로 고른다.
 */
export default function TargetPicker({ classes, selected, disabled, onSelect }: TargetPickerProps) {
  const [pickedClassId, setPickedClassId] = useState<number | null>(selected?.classId ?? null)
  const current =
    classes.length === 1
      ? classes[0]
      : (classes.find((cls) => cls.class_id === pickedClassId) ?? null)

  const pickClass = (classId: number) => {
    if (classId === pickedClassId) return
    setPickedClassId(classId)
    onSelect(null)
  }

  const targets = current ? classTargets(current) : null
  const empty =
    classes.length === 0 || (targets !== null && targets.main.length + targets.late.length === 0)

  const renderOption = (target: SubmitTarget) => (
    <TargetOption
      key={target.key}
      target={target}
      selected={target.key === selected?.key}
      disabled={disabled}
      onSelect={onSelect}
    />
  )

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>낼 숙제</h2>
      {classes.length > 1 ? (
        <div className={styles.chipRow}>
          {classes.map((cls) => {
            const on = cls.class_id === current?.class_id
            return (
              <button
                key={cls.class_id}
                type="button"
                className={on ? styles.chip.on : styles.chip.off}
                aria-pressed={on}
                disabled={disabled}
                onClick={() => pickClass(cls.class_id)}
              >
                {cls.class_name}
              </button>
            )
          })}
        </div>
      ) : null}
      {classes.length === 1 && current ? (
        <p className={styles.statusText}>{current.class_name}</p>
      ) : null}
      {empty ? <p className={styles.emptyText}>{NO_TARGET}</p> : null}
      {targets ? targets.main.map(renderOption) : null}
      {targets && targets.late.length > 0 ? (
        <>
          <h3 className={styles.subTitle}>{HW_STUDENT_LABELS.late}</h3>
          {targets.late.map(renderOption)}
        </>
      ) : null}
    </section>
  )
}
