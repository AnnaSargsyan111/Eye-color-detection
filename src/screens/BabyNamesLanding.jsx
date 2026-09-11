import AiraSidebar from '../components/AiraSidebar.jsx'
import MobileTopBar from '../components/MobileTopBar.jsx'
import Button from '../components/Button.jsx'
import { useRecommendationFlow } from '../babyNames/RecommendationContext.jsx'

const GENDERS = [
  { value: 'female', label: 'Girl' },
  { value: 'male', label: 'Boy' },
]
const LOCATIONS = [
  { value: 'ons_england_wales', label: 'International' },
  { value: 'armstat', label: 'Armenia' },
]

function Pill({ selected, onSelect, children }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-button px-base py-1.5 text-caption font-semibold transition-colors ${
        selected ? 'bg-brand-primary text-on-brand' : 'bg-bg-page text-text-secondary hover:bg-border-default/60'
      }`}
    >
      {children}
    </button>
  )
}

export default function BabyNamesLanding({ onNavigate }) {
  const { preferences, update } = useRecommendationFlow()

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <AiraSidebar active="baby-names" onNavigate={onNavigate} />
      <MobileTopBar title="Baby Names" />

      <div className="flex min-h-screen flex-col items-center justify-center p-xl md:ml-[76px]">
        <div className="flex w-full max-w-[560px] flex-col gap-lg">
          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-semibold text-text-primary">Find a name that feels right</h1>
            <p className="text-subtitle text-text-secondary">
              Explore real baby-name trends and discover names that match your preferences.
            </p>
          </div>

          <div className="flex flex-col gap-lg rounded-card border border-border-default bg-surface p-xl">
            <span className="text-label font-medium text-text-primary">Start exploring</span>

            <div className="flex flex-wrap items-start gap-xxl">
              <div className="flex flex-col gap-2">
                <span className="text-caption font-medium text-text-secondary">For</span>
                <div className="flex gap-2">
                  {GENDERS.map((g) => (
                    <Pill key={g.value} selected={preferences.gender === g.value} onSelect={() => update({ gender: g.value })}>
                      {g.label}
                    </Pill>
                  ))}
                </div>
              </div>

              <div className="ml-lg flex flex-col gap-2">
                <span className="text-caption font-medium text-text-secondary">Location</span>
                <div className="flex gap-2">
                  {LOCATIONS.map((loc) => (
                    <Pill key={loc.value} selected={preferences.source === loc.value} onSelect={() => update({ source: loc.value })}>
                      {loc.label}
                    </Pill>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="primary" className="mt-[52px]" onClick={() => onNavigate('baby-names-loading')}>
              Explore names →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
