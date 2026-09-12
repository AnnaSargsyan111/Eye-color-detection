import { useState } from 'react'
import RecommendationLayout from './RecommendationLayout.jsx'
import OptionCard from './OptionCard.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'

// Internal identifiers only — never shown in the UI. Armenia -> armstat,
// International -> ons_england_wales, per the data-source rules.
const LOCATIONS = [
  { value: 'armstat', label: 'Armenia' },
  { value: 'ons_england_wales', label: 'International' },
]
const GENDERS = [
  { value: 'female', label: 'Girl' },
  { value: 'male', label: 'Boy' },
]

export default function Step1({ onNavigate }) {
  const { preferences, update, resetFlow } = useRecommendationFlow()
  const [error, setError] = useState('')

  function select(patch) {
    update(patch)
    setError('')
  }

  function handleContinue() {
    if (!preferences.source || !preferences.gender) {
      setError('Select an option to continue')
      return
    }
    onNavigate('rec-2')
  }

  return (
    <RecommendationLayout
      step={1}
      title="Who are you naming?"
      onNavigate={onNavigate}
      onBack={() => {
        resetFlow()
        onNavigate('baby-names')
      }}
      onContinue={handleContinue}
      continueLabel="Continue →"
    >
      <div className="flex flex-col gap-md">
        <span className="text-label font-medium text-text-primary">Location</span>
        <div className="grid grid-cols-2 gap-3">
          {LOCATIONS.map((loc) => (
            <OptionCard
              key={loc.value}
              title={loc.label}
              selected={preferences.source === loc.value}
              onSelect={() => select({ source: loc.value })}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-md">
        <span className="text-label font-medium text-text-primary">For</span>
        <div className="grid grid-cols-2 gap-3">
          {GENDERS.map((g) => (
            <OptionCard
              key={g.value}
              title={g.label}
              selected={preferences.gender === g.value}
              onSelect={() => select({ gender: g.value })}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-caption text-error">{error}</p>}
    </RecommendationLayout>
  )
}
