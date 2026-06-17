'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownProps {
  targetDate: Date | string
  onComplete?: () => void
}

export function Countdown({ targetDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        onComplete?.()
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  const timeUnits = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="relative">
          <div className="text-center">
            <div className="flex h-20 w-full min-w-[86px] items-center justify-center rounded-2xl border border-accent/25 bg-gradient-to-b from-primary-light/30 to-primary-dark/70 shadow-lg shadow-primary-dark/25 sm:h-24">
              <span className="font-mono text-3xl font-bold tracking-tight text-accent sm:text-5xl">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-text-secondary">
              {unit.label}
            </p>
          </div>
          {index < timeUnits.length - 1 && index % 2 === 0 && (
            <span className="pointer-events-none absolute -right-2 top-7 hidden text-3xl font-bold text-accent/40 sm:block">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function CountdownSimple({ targetDate }: { targetDate: Date | string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        <span className="text-text-secondary">Cargando...</span>
      </div>
    )
  }

  return <Countdown targetDate={targetDate} />
}
