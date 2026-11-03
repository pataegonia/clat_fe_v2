'use client'

import { motion, useReducedMotion } from 'framer-motion'
import LandingImage from '@/components/landing/LandingImage'
import { MotionButton } from '@/components/motion/MotionButton'
import { APP_URL } from '@/lib/landing-content'
import { easeOut, staggerContainer, fadeUp } from '@/lib/motion-presets'
import * as s from '@/app/landing.css'

const FEATURES = ['출결 · 점수 · 과제', '학부모 알림톡', 'AI 피드백', '미완료 추적']

export default function HeroSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className={s.hero}>
      <div className={s.heroGrid} aria-hidden />
      <div className={s.heroBlob1} aria-hidden />
      <div className={s.heroBlob2} aria-hidden />

      <div className={`${s.container} ${s.heroInner}`}>
        <motion.div
          initial={reduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          variants={staggerContainer}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
        >
          <motion.div variants={fadeUp} className={s.heroBadge}>
            <span className={s.heroBadgeDot} aria-hidden />
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
            <MotionButton href="#steps" className={s.ctaButtonGhost}>
              사용법 보기
            </MotionButton>
          </motion.div>

          <motion.div
            className={s.heroScreenshotWrap}
            variants={fadeUp}
            whileHover={reduceMotion ? undefined : { y: -8, transition: { duration: 0.35, ease: easeOut } }}
            style={reduceMotion ? undefined : { perspective: 1200 }}
          >
            <LandingImage
              src="/images/hero-screenshot.png"
              alt="클랫 수업 템플릿 화면"
              className={s.heroScreenshot}
              sizes="(max-width: 768px) 100vw, 1100px"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
