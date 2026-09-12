import { useState } from 'react'
import RecommendationLayout from './RecommendationLayout.jsx'
import OptionCard from './OptionCard.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'

const OPTIONS = [
  { value: 'trending', title: 'Trending', description: 'Prefer names whose popularity is increasing over recent years.' },
  {
    value: 'timeless',
    title: 'Timeless',
    description: 'Prefer names that have remained consistently popular across multiple recent years.',
  },
  { value: 'distinctive', title: 'Distinctive', description: 'Prefer names that are less common while still appearing in the available dataset.' },
  {
    value: 'mixed',
    title: 'A mix of everything',
    description: 'A balanced recommendation using popularity, trend, stability, and distinctiveness.',
  },
]

export default function Step3({ onNavigate }) {
  const { preferences, update } = useRecommendationFlow()
  const [error, setError] = useState('')

  function select(value) {
    update({ style: value })
    setError('')
  }

  function handleContinue() {
    if (!preferences.style) {
      setError('Select an option to continue')
      return
    }
    onNavigate('rec-4')
  }

  return (
    <RecommendationLayout
      step={3}
      title="What kind of name are you looking for?"
      onNavigate={onNavigate}
      onBack={() => onNavigate('rec-2')}
      onContinue={handleContinue}
    >
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            title={opt.title}
            description={opt.description}
            selected={preferences.style === opt.value}
            onSelect={() => select(opt.value)}
          />
        ))}
      </div>

      {error && <p className="text-caption text-error">{error}</p>}
    </RecommendationLayout>
  )
}
