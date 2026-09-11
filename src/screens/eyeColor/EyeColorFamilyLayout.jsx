import AiraSidebar from '../../components/AiraSidebar.jsx'
import MobileTopBar from '../../components/MobileTopBar.jsx'
import FamilyProgressStepper from '../../components/FamilyProgressStepper.jsx'
import Button from '../../components/Button.jsx'

export default function EyeColorFamilyLayout({
  onNavigate,
  onBack,
  step,
  title,
  subtitle,
  helperText,
  children,
  onSkip,
  onContinue,
  continueLabel = 'Continue →',
}) {
  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <AiraSidebar active="eye-welcome" onNavigate={onNavigate} />
      <MobileTopBar title="Eye Color" onBack={onBack} />

      <div className="flex flex-col items-center px-base py-xl md:ml-[76px] md:px-xl">
        <div className="flex w-full max-w-[880px] flex-col items-center gap-xl pb-16">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="hidden self-start text-lg text-text-secondary transition-colors hover:text-text-primary md:block"
          >
            ←
          </button>

          <FamilyProgressStepper current={step} />

          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="max-w-[560px] text-h1 font-semibold text-text-primary">{title}</h1>
            <p className="max-w-[480px] text-subtitle text-text-secondary">{subtitle}</p>
            {helperText && <p className="text-caption text-text-secondary/80">{helperText}</p>}
          </div>

          {children}

          <div className="flex gap-3">
            {onSkip && (
              <Button variant="secondary" className="px-xl" onClick={onSkip}>
                Skip for now
              </Button>
            )}
            <Button variant="primary" className="px-xl" onClick={onContinue}>
              {continueLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
