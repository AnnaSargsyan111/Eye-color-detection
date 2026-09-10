import { useMemo } from 'react'
import RecommendationLayout from './RecommendationLayout.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'
import { getAvailableFirstLetters } from '../../services/babyNames/index.js'

export default function Step6({ onNavigate }) {
  const { preferences, update } = useRecommendationFlow()
  const letters = useMemo(
    () => getAvailableFirstLetters(preferences.source, preferences.gender),
    [preferences.source, preferences.gender]
  )

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
        <button
          type="button"
          onClick={() => update({ firstLetter: undefined })}
          aria-pressed={!preferences.firstLetter}
          className={`flex w-full items-center rounded-card border bg-surface p-lg text-left text-body font-semibold text-text-primary transition-colors ${
            !preferences.firstLetter ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-border-default hover:border-brand-primary'
          }`}
        >
          Any letter
        </button>

        {letters.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {letters.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => update({ firstLetter: letter })}
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
          </div>
        )}
      </div>
    </RecommendationLayout>
  )
}
