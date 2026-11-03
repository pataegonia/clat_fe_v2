'use client'

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion'
import { fadeUp, viewportOnce } from '@/lib/motion-presets'

type RevealProps = HTMLMotionProps<'div'> & {
  variant?: Variants
  delay?: number
}

export default function Reveal({
  children,
  variant = fadeUp,
  delay = 0,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={variant}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
