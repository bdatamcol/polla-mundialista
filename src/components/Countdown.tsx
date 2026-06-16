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
    <div className="flex items-center gap-2 sm:gap-4">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
          <div className="text-center">
            <div className="w-12 h-14 sm:w-16 sm:h-20 bg-surface border border-surface-light rounded-lg flex items-center justify-center">
              <span className="font-mono text-2xl sm:text-4xl font-bold text-accent">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">{unit.label}</p>
          </div>
          {index < timeUnits.length - 1 && (
            <span className="text-2xl sm:text-4xl font-bold text-accent/50 animate-pulse">:</span>
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
