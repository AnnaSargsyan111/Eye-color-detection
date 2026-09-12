import { useMemo, useState } from 'react'
import RecommendationLayout from './RecommendationLayout.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'
import { getAvailableFirstLetters } from '../../services/babyNames/index.js'

const LATIN_LETTER_RE = /^[A-Za-z]$/
// One slot short of a full row so the trailing "more" indicator — now boxed
// the same size as a letter — still fits on the same line instead of wrapping.
const MAX_VISIBLE_LETTERS = 9

export default function Step6({ onNavigate }) {
  const { preferences, update } = useRecommendationFlow()
  const [error, setError] = useState('')
  const letters = useMemo(
    () => getAvailableFirstLetters(preferences.source, preferences.gender),
    [preferences.source, preferences.gender]
  )
  const visibleLetters = letters.slice(0, MAX_VISIBLE_LETTERS)
  const hasMoreLetters = letters.length > MAX_VISIBLE_LETTERS

  function handleLetterInput(e) {
    const value = e.target.value.slice(-1)
    if (value && !LATIN_LETTER_RE.test(value)) {
      setError('Use Latin letters')
      return
    }
    setError('')
    update({ firstLetter: value ? value.toUpperCase() : undefined })
  }

  return (
    <RecommendationLayout
      step={6}
      title="Do you have a preferred first letter?"
      subtitle={letters.length === 0 ? "We don't have enough data yet to offer letters for this location." : undefined}
      onNavigate={onNavigate}
      onBack={() => onNavigate('rec-5')}
      onContinue={() => onNavigate('rec-loading')}
      continueLabel="Find my names →"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            value={preferences.firstLetter ?? ''}
            onChange={handleLetterInput}
            placeholder="Any letter"
            maxLength={1}
            autoComplete="off"
            className={`w-full rounded-card border bg-surface p-lg text-body font-semibold text-text-primary outline-none transition-colors placeholder:text-text-secondary placeholder:font-semibold focus:border-[1.5px] focus:border-border-focus ${
              error ? 'border-error' : preferences.firstLetter ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-border-default'
            }`}
          />
          {error && <p className="text-caption text-error">{error}</p>}
        </div>

        {visibleLetters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleLetters.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => {
                  update({ firstLetter: letter })
                  setError('')
                }}
                aria-pressed={preferences.firstLetter === letter}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-input border text-body font-semibold transition-colors ${
                  preferences.firstLetter === letter
                    ? 'border-brand-primary bg-brand-primary text-on-brand'
                    : 'border-border-default bg-surface text-text-primary hover:border-brand-primary'
                }`}
              >
                {letter}
              </button>
            ))}
            {hasMoreLetters && (
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-input border border-border-default bg-surface text-body font-semibold tracking-tighter text-text-secondary"
              >
                •••
              </span>
            )}
          </div>
        )}
      </div>
    </RecommendationLayout>
  )
}
