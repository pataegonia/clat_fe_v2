'use client'

import Reveal from '@/components/motion/Reveal'
import * as s from '@/app/landing.css'

export default function Footer() {
  return (
    <Reveal>
      <footer className={s.footer}>
        <div className={s.container}>
          <p className={s.footerText}>© {new Date().getFullYear()} 클랫. All rights reserved.</p>
        </div>
      </footer>
    </Reveal>
  )
}
