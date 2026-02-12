'use client'
import { useEffect, useState } from 'react'

export function TypeWriter({
  text, speed = 25, className = '', onComplete,
}: {
  text: string; speed?: number; className?: string; onComplete?: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed(''); setDone(false)
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1)); i++
      if (i >= text.length) { clearInterval(interval); setDone(true); onComplete?.() }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1em] bg-gold ml-0.5 animate-pulse align-middle" />}
    </span>
  )
}
