'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { tapScale } from '@/lib/motion-presets'

type MotionButtonProps = {
  href: string
  className?: string
  children: React.ReactNode
  external?: boolean
}

export function MotionButton({ href, className, children, external }: MotionButtonProps) {
  const reduceMotion = useReducedMotion()

  const motionProps = reduceMotion
    ? {}
    : {
        whileHover: { scale: 1.03, y: -2 },
        whileTap: tapScale,
        transition: { type: 'spring' as const, stiffness: 400, damping: 22 },
      }

  if (external || href.startsWith('#') || href.startsWith('http')) {
    return (
      <motion.a href={href} className={className} {...motionProps}>
        {children}
      </motion.a>
    )
  }

  return (
    <motion.div {...motionProps} style={{ display: 'inline-flex' }}>
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  )
}
