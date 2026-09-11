const STEPS = [
  { key: 'parents', label: 'Parents' },
  { key: 'grandparents', label: 'Grandparents' },
  { key: 'great-grandparents', label: 'Great-grandparents' },
]

function PeopleIcon({ active }) {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" className={active ? 'text-brand-primary' : 'text-text-secondary/50'}>
      <circle cx="7" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 15c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="17" cy="5" r="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11.5 15c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** The "Parents / Grandparents / Great-grandparents" stepper shown at the top of every screen in the family data-collection flow. */
export default function FamilyProgressStepper({ current }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="flex items-center justify-center gap-3 rounded-card border border-border-default bg-surface px-lg py-base">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-3">
          {i > 0 && <div className={`h-px w-10 ${i <= currentIndex ? 'bg-brand-primary' : 'bg-border-default'}`} />}
          <div className="flex flex-col items-center gap-1">
            <PeopleIcon active={i <= currentIndex} />
            <span className={`text-caption font-medium ${i === currentIndex ? 'text-brand-primary' : 'text-text-secondary/60'}`}>
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
