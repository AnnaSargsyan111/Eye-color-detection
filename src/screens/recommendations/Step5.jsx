import RecommendationLayout from './RecommendationLayout.jsx'
import OptionCard from './OptionCard.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'

const OPTIONS = [
  { value: 'familiar', title: 'Familiar', description: 'Prefer names with stronger current popularity.' },
  { value: 'balanced', title: 'Balanced', description: 'Mix popular and less common names.' },
  { value: 'unexpected', title: 'Unexpected', description: 'Give more weight to distinctive and less common names.' },
]

export default function Step5({ onNavigate }) {
  const { preferences, update } = useRecommendationFlow()

  return (
    <RecommendationLayout
      step={5}
      title="How adventurous should we be?"
      onNavigate={onNavigate}
      onBack={() => onNavigate('rec-4')}
      onContinue={() => onNavigate('rec-6')}
    >
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            title={opt.title}
            description={opt.description}
            selected={preferences.adventure === opt.value}
            onSelect={() => update({ adventure: opt.value })}
          />
        ))}
      </div>
    </RecommendationLayout>
  )
}
