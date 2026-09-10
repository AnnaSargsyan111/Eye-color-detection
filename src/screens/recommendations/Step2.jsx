import RecommendationLayout from './RecommendationLayout.jsx'
import OptionCard from './OptionCard.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'

const OPTIONS = [
  { value: 'very_popular', title: 'Very popular', description: 'Current-year rank 1–10.' },
  { value: 'popular', title: 'Popular', description: 'Current-year rank 11–50.' },
  { value: 'less_common', title: 'Less common', description: 'Current-year rank 51–200.' },
  { value: 'rare', title: 'Rare', description: 'Current-year rank greater than 200.' },
  { value: 'any', title: 'No preference', description: null },
]

export default function Step2({ onNavigate }) {
  const { preferences, update } = useRecommendationFlow()

  return (
    <RecommendationLayout
      step={2}
      title="How popular should the name be?"
      onNavigate={onNavigate}
      onBack={() => onNavigate('rec-1')}
      onContinue={() => onNavigate('rec-3')}
    >
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            title={opt.title}
            description={opt.description}
            selected={preferences.popularity === opt.value}
            onSelect={() => update({ popularity: opt.value })}
          />
        ))}
      </div>
    </RecommendationLayout>
  )
}
