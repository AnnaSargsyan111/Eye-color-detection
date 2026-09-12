import { useState } from 'react'
import RecommendationLayout from './RecommendationLayout.jsx'
import OptionCard from './OptionCard.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'

const OPTIONS = [
  { value: 'very_popular', title: 'Very popular', description: null },
  { value: 'popular', title: 'Popular', description: null },
  { value: 'less_common', title: 'Less common', description: null },
  { value: 'rare', title: 'Rare', description: null },
  { value: 'any', title: 'No preference', description: null },
]

export default function Step2({ onNavigate }) {
  const { preferences, update } = useRecommendationFlow()
  const [error, setError] = useState('')

  function select(value) {
    update({ popularity: value })
    setError('')
  }

  function handleContinue() {
    if (!preferences.popularity) {
      setError('Select an option to continue')
      return
    }
    onNavigate('rec-3')
  }

  return (
    <RecommendationLayout
      step={2}
      title="How popular should the name be?"
      onNavigate={onNavigate}
      onBack={() => onNavigate('rec-1')}
      onContinue={handleContinue}
      footerError={error}
    >
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            title={opt.title}
            description={opt.description}
            selected={preferences.popularity === opt.value}
            onSelect={() => select(opt.value)}
          />
        ))}
      </div>
    </RecommendationLayout>
  )
}
