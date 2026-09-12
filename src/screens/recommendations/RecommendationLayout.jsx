import AiraSidebar from '../../components/AiraSidebar.jsx'
import MobileTopBar from '../../components/MobileTopBar.jsx'
import Button from '../../components/Button.jsx'

const TOTAL_STEPS = 6

// Shared shell for every recommendation-flow screen: sidebar (desktop) /
// simple top bar (mobile), progress indicator, step title, and a fixed
// back/continue footer. Reuses AiraSidebar and Button as-is (no changes to
// either) so the flow inherits the app's existing visual language.
export default function RecommendationLayout({
  step,
  title,
  subtitle,
  onNavigate,
  onBack,
  onContinue,
  continueLabel = 'Continue →',
  continueDisabled = false,
  hideFooter = false,
  children,
}) {
  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <AiraSidebar active="baby-names" onNavigate={onNavigate} />
      <MobileTopBar title="Baby Names" onBack={onBack} />

      <div className="flex flex-col items-center px-base py-xl md:ml-[76px] md:px-xl">
        <div className="flex w-full max-w-[560px] flex-col gap-xl pb-28 md:pb-24">
          {step != null && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
                  // Completed steps read as full; the step you're currently
                  // on reads as half-filled (in progress) rather than done —
                  // it only becomes full once Continue moves past it.
                  if (i < step - 1) return <div key={i} className="h-1.5 flex-1 rounded-button bg-brand-primary" />
                  if (i === step - 1) {
                    return (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-button"
                        style={{ background: 'linear-gradient(to right, var(--color-brand-primary) 50%, var(--color-border-default) 50%)' }}
                      />
                    )
                  }
                  return <div key={i} className="h-1.5 flex-1 rounded-button bg-border-default" />
                })}
              </div>
              <span className="text-caption text-text-secondary">
                Step {step} of {TOTAL_STEPS}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-semibold text-text-primary">{title}</h1>
            {subtitle && <p className="text-subtitle text-text-secondary">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>

      {!hideFooter && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center border-t border-border-default bg-surface px-base pb-lg pt-md md:left-[76px]">
          <div className="flex w-full max-w-[560px] flex-col gap-2">
            <div className="flex gap-3">
              {onBack && (
                // Wrapping in a plain div (rather than putting hidden/md:flex
                // directly on Button) sidesteps a Tailwind ordering quirk
                // where Button's own base `inline-flex` class wins over a
                // `hidden` override passed via className, regardless of
                // breakpoint — which silently kept this desktop-only Back
                // button visible on mobile too, duplicating MobileTopBar's
                // own back arrow.
                <div className="hidden flex-1 md:flex">
                  <Button
                    variant="secondary"
                    className="w-full"
                    style={{ borderColor: '#94A3B8', borderWidth: 1.5 }}
                    onClick={onBack}
                  >
                    Back
                  </Button>
                </div>
              )}
              <Button
                variant="primary"
                className="flex-1 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={onContinue}
                disabled={continueDisabled}
              >
                {continueLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
