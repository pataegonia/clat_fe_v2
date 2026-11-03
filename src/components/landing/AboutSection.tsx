'use client'

import { motion, useReducedMotion } from 'framer-motion'
import LandingImage from '@/components/landing/LandingImage'
import Reveal from '@/components/motion/Reveal'
import Stagger from '@/components/motion/Stagger'
import { benefits } from '@/lib/landing-content'
import { cardHover, fadeUp } from '@/lib/motion-presets'
import * as s from '@/app/landing.css'

export default function AboutSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="about" className={s.aboutSection}>
      <div className={`${s.section} ${s.aboutHeaderWrap}`}>
        <div className={s.container}>
          <div className={s.aboutHeader}>
            <h2 className={s.sectionTitle}>클랫이란?</h2>
            <p className={s.aboutBody}>
              클랫은 학원 선생님을 위한 수업 관리 도구입니다. 설치도, 미팅도 필요 없고, 가입하는
              날부터 바로 시작할 수 있어요.
            </p>
          </div>
        </div>
      </div>

      <div className={s.section} style={{ paddingTop: 0 }}>
        <div className={s.container}>
          <div className={s.aboutLayout}>
            <Reveal className={s.aboutIntro}>
              <h3 className={s.aboutIntroTitle}>
                선생님의 수업 외 시간을
                <br />
                클랫이 돌려드릴게요.
              </h3>
              <p className={s.aboutIntroDesc}>
                수업 기록, 학생 추적, 학부모 문자.
                <br />
                세 가지를 하나의 흐름으로 처리해요.
              </p>
            </Reveal>

            <Stagger className={s.aboutValueList}>
              {benefits.map((item) => (
                <motion.article
                  key={item.badge}
                  className={s.aboutValueCard}
                  variants={fadeUp}
                  whileHover={reduceMotion ? undefined : cardHover}
                >
                  <span className={s.aboutValueBadge}>{item.badge}</span>
                  <div className={s.aboutValueBody}>
                    <h4 className={s.aboutValueTitle}>{item.title}</h4>
                    <p className={s.aboutValueDesc}>{item.description}</p>
                  </div>
                  <LandingImage
                    src={item.image}
                    alt=""
                    className={s.aboutValueImage}
                    aria-hidden
                  />
                </motion.article>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  )
}
