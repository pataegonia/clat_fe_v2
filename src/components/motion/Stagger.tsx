'use client'

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from 'framer-motion'
import { staggerContainer, viewportOnce } from '@/lib/motion-presets'

type StaggerProps = HTMLMotionProps<'div'> & {
  stagger?: Variants
}

export default function Stagger({
  children,
  stagger = staggerContainer,
  ...props
}: StaggerProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger}
      {...props}
    >
      {children}
    </motion.div>
  )
}
