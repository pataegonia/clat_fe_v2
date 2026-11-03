'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import LandingImage from '@/components/landing/LandingImage'
import { MotionButton } from '@/components/motion/MotionButton'
import { APP_URL } from '@/lib/landing-content'
import * as s from '@/app/landing.css'

const NAV_ITEMS = [
  { href: '#problem', label: '문제' },
  { href: '#about', label: '소개' },
  { href: '#solution', label: '해결' },
  { href: '#steps', label: '사용법' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <motion.header
      className={`${s.header} ${scrolled ? s.headerScrolled : ''}`}
      initial={reduceMotion ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`${s.container} ${s.headerInner}`}>
        <Link href="/" aria-label="클랫 홈" onClick={() => setMenuOpen(false)}>
          <LandingImage src="/images/logo.png" alt="클랫" className={s.logo} priority />
        </Link>

        <nav className={s.navLinks} aria-label="주요 섹션">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className={s.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={s.headerActions}>
          <MotionButton href={APP_URL} className={`${s.ctaButton} ${s.headerDesktopCta}`}>
            무료로 시작하기
          </MotionButton>

          <button
            type="button"
            className={s.mobileMenuButton}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className={s.mobileMenuLine}
              style={{
                transform: menuOpen ? 'translateY(7px) rotate(45deg)' : undefined,
              }}
            />
            <span className={s.mobileMenuLine} style={{ opacity: menuOpen ? 0 : 1 }} />
            <span
              className={s.mobileMenuLine}
              style={{
                transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : undefined,
              }}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className={s.mobileNav}
            aria-label="모바일 메뉴"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                className={s.mobileNavLink}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {item.label}
              </motion.a>
            ))}
            <MotionButton href={APP_URL} className={s.ctaButtonLarge}>
              무료로 시작하기
            </MotionButton>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
