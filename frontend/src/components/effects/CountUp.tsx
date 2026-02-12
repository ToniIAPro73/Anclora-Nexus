'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function CountUp({
  target, duration = 1200, prefix = '', suffix = '', className = 'metric-value',
}: {
  target: number; duration?: number; prefix?: string; suffix?: string; className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target, duration])

  return <span ref={ref} className={className}>{prefix}{value.toLocaleString('es-ES')}{suffix}</span>
}
