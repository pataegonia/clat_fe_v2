'use client'

import { motion, useReducedMotion } from 'framer-motion'
import LandingImage from '@/components/landing/LandingImage'
import Reveal from '@/components/motion/Reveal'
import { MotionButton } from '@/components/motion/MotionButton'
import { APP_URL } from '@/lib/landing-content'
import { fadeUp } from '@/lib/motion-presets'
import * as s from '@/app/landing.css'

export default function CtaSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className={s.ctaSection}>
      <motion.div
        className={s.ctaGiftWrap}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -16, 0],
                rotate: [0, 2, -2, 0],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <LandingImage
          src="/images/cta-gift.png"
          alt=""
          className={s.ctaGift}
          aria-hidden
        />
      </motion.div>

      <div className={s.container}>
        <Reveal className={s.ctaInner}>
          <LandingImage
            src="/images/logo-light.png"
            alt="클랫"
            className={s.ctaLogo}
            maxWidth={120}
          />
          <h2 className={s.ctaTitle}>
            수업 외 행정에 쓰던 시간,
            <br />
            클랫이 돌려드립니다.
          </h2>
          <p className={s.ctaDesc}>
            설치도, 미팅도 필요 없어요. 오늘 가입하고 오늘 바로 쓸 수 있습니다.
          </p>
          <motion.div
            className={s.ctaActions}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <MotionButton href={APP_URL} className={s.ctaShimmerButton}>
              무료로 시작하기
            </MotionButton>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
