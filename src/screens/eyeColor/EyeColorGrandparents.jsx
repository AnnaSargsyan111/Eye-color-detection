import EyeColorFamilyLayout from './EyeColorFamilyLayout.jsx'
import EyeColorDropdown from '../../components/EyeColorDropdown.jsx'
import { useFamilyInput } from '../../eyeColorPrediction/FamilyInputContext.jsx'

const ROLES = [
  { key: 'maternalGrandmother', label: 'Maternal Grandmother' },
  { key: 'maternalGrandfather', label: 'Maternal Grandfather' },
  { key: 'paternalGrandmother', label: 'Paternal Grandmother' },
  { key: 'paternalGrandfather', label: 'Paternal Grandfather' },
]

export default function EyeColorGrandparents({ onNavigate }) {
  const { input, setGrandparent } = useFamilyInput()

  return (
    <EyeColorFamilyLayout
      onNavigate={onNavigate}
      onBack={() => onNavigate('eye-parents')}
      step="grandparents"
      title="Let's go one generation deeper"
      subtitle="Adding your grandparents can help us make the estimate more informative."
      helperText='You don’t need to know every family member’s eye color. Choose "Unknown" whenever needed.'
      onSkip={() => onNavigate('eye-greatgrandparents')}
      onContinue={() => onNavigate('eye-greatgrandparents')}
    >
      <div className="grid w-full max-w-[880px] grid-cols-1 gap-base sm:grid-cols-2">
        {ROLES.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-2 rounded-card border border-border-default bg-surface p-lg">
            <div className="flex items-center gap-2">
              <span className="text-body font-semibold text-text-primary">{label}</span>
              <span className="rounded-button bg-brand-primary/10 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                Recommended
              </span>
            </div>
            <EyeColorDropdown
              label="Eye color"
              value={input.grandparents[key]?.eyeColor ?? null}
              onChange={(color) => setGrandparent(key, color ? { eyeColor: color } : null)}
            />
          </div>
        ))}
      </div>
    </EyeColorFamilyLayout>
  )
}
