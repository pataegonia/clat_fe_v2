'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import LandingImage from '@/components/landing/LandingImage'
import StepMediaView from '@/components/landing/StepMediaView'
import { MotionButton } from '@/components/motion/MotionButton'
import { APP_URL, heroSlides } from '@/lib/landing-content'
import { easeOut, staggerContainer, fadeUp } from '@/lib/motion-presets'
import * as s from '@/app/landing.css'

const FEATURES = ['출결 · 점수 · 과제', '학부모 알림톡', 'AI 피드백', '미완료 추적']
const SLIDE_MS = 3500

export default function HeroSection() {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const slide = heroSlides[index] ?? heroSlides[0]

  useEffect(() => {
    if (reduceMotion || heroSlides.length < 2) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  return (
    <section className={s.hero}>
      <div className={s.heroGrid} aria-hidden />
      <div className={s.heroBlob1} aria-hidden />
      <div className={s.heroBlob2} aria-hidden />

      <div className={`${s.container} ${s.heroInner}`}>
        <motion.div
          className={s.heroCopy}
          initial={reduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className={s.heroBadge}>
            학원 선생님을 위한 수업 관리 도구
          </motion.div>

          <motion.div className={s.heroLogoWrap} variants={fadeUp}>
            <LandingImage
              src="/images/logo.png"
              alt="클랫"
              className={s.heroLogo}
              maxWidth={121}
              priority
            />
          </motion.div>

          <motion.h1 className={s.heroTitle} variants={fadeUp}>
            <span className={s.heroTitleLine}>수업은 가르치는 것만으로</span>
            <span className={`${s.heroTitleLine} ${s.heroTitleAccent}`}>충분해야 합니다</span>
          </motion.h1>

          <motion.p className={s.heroSubtitle} variants={fadeUp}>
            수업 기록, 학생 추적, 학부모 알림까지.{' '}
            <br className={s.desktopBreak} />
            가입하고 오늘 바로 시작해 보세요.
          </motion.p>

          <motion.div className={s.heroFeatureRow} variants={fadeUp}>
            {FEATURES.map((f) => (
              <span key={f} className={s.heroFeaturePill}>
                {f}
              </span>
            ))}
          </motion.div>

          <motion.div className={s.heroActions} variants={fadeUp}>
            <MotionButton href={APP_URL} className={s.ctaButtonLarge}>
              무료로 시작하기
            </MotionButton>
          </motion.div>
        </motion.div>

        <motion.div
          className={s.heroVisual}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: easeOut, delay: reduceMotion ? 0 : 0.15 }}
        >
          <div className={s.heroScreenshotWrap}>
            <div className={s.heroSlideViewport} aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {slide ? (
                  <motion.div
                    key={slide.id}
                    className={s.heroSlide}
                    initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
                    transition={{ duration: 0.45, ease: easeOut }}
                  >
                    <div className={s.heroSlideMedia}>
                      <StepMediaView media={slide.media} />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            {heroSlides.length > 1 ? (
              <div className={s.heroSlideDots} role="tablist" aria-label="사용법 화면">
                {heroSlides.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${item.step} ${item.tab}`}
                    className={i === index ? s.heroSlideDotActive : s.heroSlideDot}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
