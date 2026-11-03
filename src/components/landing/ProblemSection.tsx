'use client'

import { motion, useReducedMotion } from 'framer-motion'
import LandingImage from '@/components/landing/LandingImage'
import Reveal from '@/components/motion/Reveal'
import Stagger from '@/components/motion/Stagger'
import { painPoints } from '@/lib/landing-content'
import { cardHover, fadeUp } from '@/lib/motion-presets'
import * as s from '@/app/landing.css'

function PainCardText({
  parts,
}: {
  parts: { text: string; highlight?: boolean }[]
}) {
  return (
    <p className={s.painText}>
      {parts.map((part, i) =>
        part.highlight ? (
          <span key={i} className={s.highlight}>
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  )
}

export default function ProblemSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="problem" className={s.section}>
      <div className={s.container}>
        <Reveal>
          <h2 className={s.sectionTitle}>선생님, 혹시 이런 적 있으셨나요?</h2>
          <p className={s.sectionSubtitle}>
            클랫 팀이 선생님 56명을 직접 인터뷰한 결과,
            <br />
            수업 외에 쓰는 시간이 생각보다 훨씬 많았어요.
          </p>
        </Reveal>

        <Stagger className={s.painGrid}>
          {painPoints.map((item, index) => (
            <motion.article
              key={index}
              className={s.painCard}
              variants={fadeUp}
              whileHover={reduceMotion ? undefined : cardHover}
            >
              <motion.div
                className={s.painImageWrap}
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <LandingImage src={item.image} alt="" className={s.painImage} aria-hidden />
              </motion.div>
              <PainCardText parts={item.parts} />
            </motion.article>
          ))}
        </Stagger>

        <Reveal delay={0.2}>
          <p className={s.sectionSubtitle} style={{ marginTop: '56px' }}>
            수업 외에 쓰는 시간이 생각보다 훨씬 많다는 것.
            <br />
            클랫은 바로 이 문제에서 출발했습니다.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
