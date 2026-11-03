'use client'

import { useEffect, useState } from 'react'
import { MotionButton } from '@/components/motion/MotionButton'
import { APP_URL } from '@/lib/landing-content'
import * as s from '@/app/landing.css'

export default function MobileStickyCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className={s.mobileStickyBar}>
      <p className={s.mobileStickyText}>설치 없이, 오늘 바로 시작할 수 있어요</p>
      <MotionButton href={APP_URL} className={s.mobileStickyButton}>
        무료로 시작하기
      </MotionButton>
    </div>
  )
}
