'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useSpring } from 'framer-motion'

type CounterProps = {
  value: number
  suffix?: string
  className?: string
}

export default function Counter({ value, suffix = '', className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const spring = useSpring(0, { stiffness: 45, damping: 18 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (inView) spring.set(value)
  }, [inView, spring, value])

  useEffect(() => {
    return spring.on('change', (v) => setDisplay(String(Math.round(v))))
  }, [spring])

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  )
}
