import EyeColorFamilyLayout from './EyeColorFamilyLayout.jsx'
import EyeColorDropdown from '../../components/EyeColorDropdown.jsx'
import { useFamilyInput } from '../../eyeColorPrediction/FamilyInputContext.jsx'

const ROLES = [
  { key: 'maternalGreatGrandmother1', label: 'Maternal great-grandmother' },
  { key: 'maternalGreatGrandfather1', label: 'Maternal great-grandfather' },
  { key: 'maternalGreatGrandmother2', label: "Maternal grandmother's parent 1" },
  { key: 'maternalGreatGrandfather2', label: "Maternal grandmother's parent 2" },
  { key: 'paternalGreatGrandmother1', label: 'Paternal great-grandmother' },
  { key: 'paternalGreatGrandfather1', label: 'Paternal great-grandfather' },
  { key: 'paternalGreatGrandmother2', label: "Paternal grandfather's parent 1" },
  { key: 'paternalGreatGrandfather2', label: "Paternal grandfather's parent 2" },
]

export default function EyeColorGreatGrandparents({ onNavigate, onPredict }) {
  const { input, setGreatGrandparent } = useFamilyInput()

  return (
    <EyeColorFamilyLayout
      onNavigate={onNavigate}
      onBack={() => onNavigate('eye-grandparents')}
      step="great-grandparents"
      title="Want to go a little deeper?"
      subtitle="Add great-grandparents to include more family history in your estimate."
      helperText="This step is completely optional. Add only the family members whose eye color you know."
      onSkip={onPredict}
      onContinue={onPredict}
      continueLabel="Predict eye color →"
    >
      <div className="grid w-full max-w-[880px] grid-cols-1 gap-base sm:grid-cols-2">
        {ROLES.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-2 rounded-card border border-border-default bg-surface p-lg">
            <div className="flex items-center gap-2">
              <span className="text-body font-semibold text-text-primary">{label}</span>
              <span className="rounded-button bg-bg-page px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                Optional
              </span>
            </div>
            <EyeColorDropdown
              label="Eye color"
              value={input.greatGrandparents[key]?.eyeColor ?? null}
              onChange={(color) => setGreatGrandparent(key, color ? { eyeColor: color } : null)}
            />
          </div>
        ))}
      </div>
    </EyeColorFamilyLayout>
  )
}
