import { useId } from 'react'
import EyeColorIcon from './EyeColorIcon.jsx'

const OPTIONS = [
  { value: 'brown', label: 'Brown' },
  { value: 'hazel', label: 'Hazel' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'gray', label: 'Gray' },
  { value: 'amber', label: 'Amber' },
  { value: 'black', label: 'Black' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
]

// A native <select>, styled to match the rest of the form fields (TextField/
// PasswordField), with the eye-color swatch icon overlaid at the left — kept
// native rather than a custom listbox so it works correctly on mobile.
export default function EyeColorDropdown({ label, value, onChange, error }) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-label font-medium text-text-primary">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center rounded-input border bg-surface transition-colors focus-within:border-[1.5px] focus-within:border-border-focus ${
          error ? 'border-error' : 'border-border-default'
        }`}
      >
        <span className="pointer-events-none absolute left-3 flex items-center">
          <EyeColorIcon color={value || undefined} size={20} />
        </span>
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full appearance-none bg-transparent py-md pl-9 pr-8 text-body text-text-primary outline-none"
        >
          <option value="" disabled>
            Select eye color
          </option>
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 text-text-secondary">˅</span>
      </div>
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  )
}
