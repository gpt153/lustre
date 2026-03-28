'use client'

import { useEffect, useState } from 'react'

const TARGET_DATE = new Date('2026-05-01T12:00:00Z')

interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLive: boolean
}

export function Countdown() {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  })

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = TARGET_DATE.getTime() - now.getTime()

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
        })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isLive: false,
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  if (countdown.isLive) {
    return <div className="countdown countdown--live">Nu är vi live!</div>
  }

  return (
    <div className="countdown">
      <div className="countdown__unit">
        <div className="countdown__number">{String(countdown.days).padStart(2, '0')}</div>
        <div className="countdown__label">dagar</div>
      </div>

      <div className="countdown__sep">:</div>

      <div className="countdown__unit">
        <div className="countdown__number">{String(countdown.hours).padStart(2, '0')}</div>
        <div className="countdown__label">timmar</div>
      </div>

      <div className="countdown__sep">:</div>

      <div className="countdown__unit">
        <div className="countdown__number">{String(countdown.minutes).padStart(2, '0')}</div>
        <div className="countdown__label">minuter</div>
      </div>

      <div className="countdown__sep">:</div>

      <div className="countdown__unit">
        <div className="countdown__number">{String(countdown.seconds).padStart(2, '0')}</div>
        <div className="countdown__label">sekunder</div>
      </div>
    </div>
  )
}
