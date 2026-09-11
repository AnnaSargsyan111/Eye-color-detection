import AiraSidebar from '../components/AiraSidebar.jsx'
import Button from '../components/Button.jsx'

const EYES = [
  { sclera: '#6B4A34', name: 'Brown' },
  { sclera: '#5C8A6B', name: 'Green' },
  { sclera: '#4B7FA6', name: 'Blue' },
  { sclera: '#C98A2E', name: 'Amber' },
]

const STEPS = [
  { label: 'Parents', caption: 'Starting tier', active: true },
  { label: 'Grandparents', caption: 'Optional data', active: false },
  { label: 'Great-grandparents', caption: 'Highest accuracy', active: false },
]

// Each eye takes its "turn" once per 4s loop (one eye glances per second),
// staggered via animation-delay so they move one at a time, not all at once.
function Eyeball({ sclera, index, size }) {
  return (
    <div
      className="relative shrink-0 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
      style={{ width: size, height: size, backgroundColor: sclera, marginLeft: index === 0 ? 0 : -size * 0.28 }}
    >
      <div
        className="absolute left-1/2 top-1/2 rounded-full bg-[#0d0d12] animate-eye-look"
        style={{ width: size * 0.34, height: size * 0.34, marginLeft: -(size * 0.17), marginTop: -(size * 0.17), animationDelay: `${index}s` }}
      />
      <div
        className="absolute rounded-full bg-white/85"
        style={{ width: size * 0.16, height: size * 0.16, left: size * 0.28, top: size * 0.22 }}
      />
    </div>
  )
}

export default function EyeColorWelcome({ onNavigate, onStartPrediction, userName = 'Anna Sargsyan', greeting = 'Welcome back' }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-bg-page font-sans">
      <div className="hidden md:block">
        <AiraSidebar active="eye-welcome" onNavigate={onNavigate} />
      </div>
      <div className="flex items-center gap-3 border-b border-border-default bg-surface px-base py-md md:hidden">
        <span className="text-label font-semibold text-text-primary">Eye Color</span>
      </div>

      {/* Decorative dot grid, right edge — purely visual, matches the Figma reference */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-40 opacity-60 lg:block"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-border-default) 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="flex min-h-screen flex-col items-center px-xl py-xxl md:ml-[76px]">
        <div className="flex w-full max-w-[880px] flex-col">
          <header className="mb-xxl flex flex-wrap items-center justify-between gap-2">
            <p className="text-caption">
              <span className="font-medium uppercase tracking-wide text-text-secondary/70">Aira Genetics</span>
              <span className="mx-2 text-text-secondary/40">/</span>
              <span className="font-semibold text-text-secondary">
                {greeting}, {userName}
              </span>
            </p>
            <div className="flex items-center gap-2.5">
              <span className="text-caption font-medium text-text-secondary">Allele References:</span>
              {EYES.slice(0, 3).map((e) => (
                <span key={e.name} className="h-3.5 w-3.5 rounded-full border border-black/5" style={{ backgroundColor: e.sclera }} />
              ))}
            </div>
          </header>

          <div className="flex flex-col items-center gap-md text-center">
            <h1 className="max-w-[560px] text-h1 font-semibold leading-tight text-text-primary">
              Discover your baby's possible eye color
            </h1>
            <p className="max-w-[480px] text-subtitle text-text-secondary">
              Based on the eye colors in your family, we'll estimate the most likely eye colors your baby could have.
            </p>
          </div>

          <div className="my-xxl flex items-center justify-center">
            {EYES.map((eye, i) => (
              <Eyeball key={eye.name} sclera={eye.sclera} index={i} size={120 - i * 8} />
            ))}
          </div>

          <div className="flex flex-col items-center gap-xl">
            <div className="flex w-full max-w-[460px] items-start justify-between rounded-card border border-border-default bg-surface px-lg py-base">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex flex-1 items-start">
                  {i > 0 && <div className="mx-2 mt-4 h-px flex-1 bg-border-default" />}
                  <div className="flex flex-col items-center gap-0.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-[10px] text-xs font-semibold ${
                        step.active ? 'bg-brand-primary text-on-brand' : 'bg-bg-page text-text-secondary'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className={`text-[11px] font-medium ${step.active ? 'text-brand-primary' : 'text-text-secondary'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-text-secondary/70">{step.caption}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" className="px-xxl" onClick={onStartPrediction}>
              Start the prediction →
            </Button>
            <p className="-mt-2 text-caption text-text-secondary">
              Takes approximately 2 minutes · Scientifically backed by Mendelian models
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
