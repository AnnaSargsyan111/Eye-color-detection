// Single selectable option used across every recommendation step (location,
// gender, popularity, style, length, adventure). description is optional —
// the Step 1 Location options deliberately pass none.
export default function OptionCard({ selected, onSelect, title, description, disabled }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex w-full flex-col gap-1 rounded-card border bg-surface p-lg text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selected ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-border-default hover:border-brand-primary'
      }`}
    >
      <span className="text-body font-semibold text-text-primary">{title}</span>
      {description && <span className="text-caption text-text-secondary">{description}</span>}
    </button>
  )
}
