'use client'

import { useState, useCallback } from 'react'

type Mode = 'vanilla' | 'spicy'

interface AgeGateProps {
  onConfirm: () => void
  onCancel: () => void
}

function AgeGate({ onConfirm, onCancel }: AgeGateProps) {
  return (
    <div className="age-gate__overlay" onClick={onCancel}>
      <div className="age-gate__dialog" onClick={e => e.stopPropagation()}>
        <div className="age-gate__icon">18+</div>
        <h3 className="age-gate__title">Spicy-läge innehåller vuxet innehåll</h3>
        <p className="age-gate__text">
          Genom att fortsätta bekräftar du att du är över 18 år.
        </p>
        <div className="age-gate__buttons">
          <button className="age-gate__btn age-gate__btn--confirm" onClick={onConfirm}>
            Jag är över 18
          </button>
          <button className="age-gate__btn age-gate__btn--cancel" onClick={onCancel}>
            Gå tillbaka
          </button>
        </div>
      </div>
    </div>
  )
}

interface ModeToggleProps {
  mode: Mode
  onToggle: (mode: Mode) => void
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const [showAgeGate, setShowAgeGate] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  const handleSpicyClick = useCallback(() => {
    if (mode === 'spicy') return
    if (ageConfirmed) {
      onToggle('spicy')
    } else {
      setShowAgeGate(true)
    }
  }, [mode, ageConfirmed, onToggle])

  const handleConfirm = useCallback(() => {
    setAgeConfirmed(true)
    setShowAgeGate(false)
    onToggle('spicy')
  }, [onToggle])

  return (
    <>
      <div className="mode-toggle">
        <button
          className={`mode-toggle__option ${mode === 'vanilla' ? 'mode-toggle__option--active' : ''}`}
          onClick={() => onToggle('vanilla')}
          aria-pressed={mode === 'vanilla'}
        >
          Vanilla
        </button>
        <button
          className={`mode-toggle__option ${mode === 'spicy' ? 'mode-toggle__option--active mode-toggle__option--spicy-active' : ''}`}
          onClick={handleSpicyClick}
          aria-pressed={mode === 'spicy'}
        >
          Spicy
        </button>
        <div
          className="mode-toggle__slider"
          style={{ transform: mode === 'spicy' ? 'translateX(100%)' : 'translateX(0)' }}
        />
      </div>
      {showAgeGate && (
        <AgeGate
          onConfirm={handleConfirm}
          onCancel={() => setShowAgeGate(false)}
        />
      )}
    </>
  )
}
