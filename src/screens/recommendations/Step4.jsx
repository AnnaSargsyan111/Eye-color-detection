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

  function select(value) {
    update({ length: value })
  }

  function handleContinue() {
    // Step 4 is optional: skipping it must behave identically to explicitly
    // choosing "No preference" (length: 'any') — a pure neutral ranking
    // signal downstream, never a filter and never an auto-selected default
    // shown in the UI. Never leave preferences.length unset (null), since
    // every consumer past this screen expects a real LengthPreference value.
    if (!preferences.length) {
      update({ length: 'any' })
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
    </RecommendationLayout>
  )
}
