import { useState } from 'react'
import RecommendationLayout from './RecommendationLayout.jsx'
import OptionCard from './OptionCard.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'

const OPTIONS = [
  { value: 'short', title: 'Short', description: '3–5 letters' },
  { value: 'medium', title: 'Medium', description: '6–7 letters' },
  { value: 'long', title: 'Long', description: '8+ letters' },
  { value: 'any', title: 'No preference', description: null },
]

export default function Step4({ onNavigate }) {
  const { preferences, update } = useRecommendationFlow()
  const [error, setError] = useState('')

  function select(value) {
    update({ length: value })
    setError('')
  }

  function handleContinue() {
    if (!preferences.length) {
      setError('Select an option to continue')
      return
    }
    onNavigate('rec-5')
  }

  return (
    <RecommendationLayout
      step={4}
      title="How long should the name be?"
      onNavigate={onNavigate}
      onBack={() => onNavigate('rec-3')}
      onContinue={handleContinue}
    >
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            title={opt.title}
            description={opt.description}
            selected={preferences.length === opt.value}
            onSelect={() => select(opt.value)}
          />
        ))}
      </div>

      {error && <p className="text-caption text-error">{error}</p>}
    </RecommendationLayout>
  )
}
