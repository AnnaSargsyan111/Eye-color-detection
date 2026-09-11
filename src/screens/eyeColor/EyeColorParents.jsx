import { useState } from 'react'
import EyeColorFamilyLayout from './EyeColorFamilyLayout.jsx'
import EyeColorDropdown from '../../components/EyeColorDropdown.jsx'
import { useFamilyInput } from '../../eyeColorPrediction/FamilyInputContext.jsx'

export default function EyeColorParents({ onNavigate }) {
  const { input, setParent } = useFamilyInput()
  const [errors, setErrors] = useState({})

  function update(role) {
    return (color) => {
      setParent(role, color ? { eyeColor: color } : null)
      setErrors((prev) => (prev[role] ? { ...prev, [role]: '' } : prev))
    }
  }

  function handleContinue() {
    const next = {}
    if (!input.mother) next.mother = 'This field is required'
    if (!input.father) next.father = 'This field is required'
    setErrors(next)
    if (Object.keys(next).length === 0) onNavigate('eye-grandparents')
  }

  return (
    <EyeColorFamilyLayout
      onNavigate={onNavigate}
      onBack={() => onNavigate('eye-welcome')}
      step="parents"
      title="Let's start with the parents"
      subtitle="Tell us the eye color of the parents to begin your family profile."
      helperText='You can choose "Unknown" if you don’t know the eye color.'
      onContinue={handleContinue}
    >
      <div className="grid w-full max-w-[880px] grid-cols-1 gap-base sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-card border border-border-default bg-surface p-lg">
          <span className="text-body font-semibold text-text-primary">Mother</span>
          <EyeColorDropdown
            label="Eye color"
            value={input.mother?.eyeColor ?? null}
            onChange={update('mother')}
            error={errors.mother}
          />
        </div>
        <div className="flex flex-col gap-2 rounded-card border border-border-default bg-surface p-lg">
          <span className="text-body font-semibold text-text-primary">Father</span>
          <EyeColorDropdown
            label="Eye color"
            value={input.father?.eyeColor ?? null}
            onChange={update('father')}
            error={errors.father}
          />
        </div>
      </div>
    </EyeColorFamilyLayout>
  )
}
