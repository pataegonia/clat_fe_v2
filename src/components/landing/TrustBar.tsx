'use client'

import { motion } from 'framer-motion'
import Counter from '@/components/motion/Counter'
import Stagger from '@/components/motion/Stagger'
import { fadeUp } from '@/lib/motion-presets'
import * as s from '@/app/landing.css'

const STATS = [
  { value: 56, suffix: '명', label: '선생님 직접 인터뷰' },
  { value: 7, suffix: '단계', label: '간단한 사용 흐름' },
  { value: 0, suffix: '원', label: '가입 후 바로 시작' },
  { value: 1, suffix: '클릭', label: '알림톡 발송' },
]

export default function TrustBar() {
  return (
    <section className={s.trustBar}>
      <div className={s.container}>
        <Stagger className={s.trustGrid}>
          {STATS.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className={s.trustItem}>
              <div className={s.trustValue}>
                {stat.value > 0 ? (
                  <Counter value={stat.value} suffix={stat.suffix} />
                ) : (
                  <>0{stat.suffix}</>
                )}
              </div>
              <p className={s.trustLabel}>{stat.label}</p>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
