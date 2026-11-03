'use client'

import * as s from '@/app/landing.css'

const ITEMS = [
  '출결 · 점수 · 과제 한 번에',
  '학부모 알림톡 자동 발송',
  'AI 학부모 피드백',
  '미완료 학생 자동 추적',
  '엑셀 일괄 등록',
  '수업 템플릿 재사용',
  '학부모 대시보드',
  '가입 즉시 사용',
]

export default function FeatureMarquee() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className={s.marqueeSection} aria-hidden>
      <div className={s.marqueeTrack}>
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className={s.marqueeItem}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
