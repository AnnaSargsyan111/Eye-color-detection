import { useEffect } from 'react'
import AiraSidebar from '../components/AiraSidebar.jsx'

// Brief transition between Landing and the browse screen, matching the
// Figma "Baby Names — Loading" frame. The data itself is either already
// cached (ONS) or was already kicked off at app start (ArmStat) — this is a
// deliberate short motion beat, not a wait for a real fetch.
const DISPLAY_MS = 500

export default function BabyNamesLoading({ onNavigate }) {
  useEffect(() => {
    const timer = setTimeout(() => onNavigate('baby-names-browse'), DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [onNavigate])

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <div className="hidden md:block">
        <AiraSidebar active="baby-names" onNavigate={onNavigate} />
      </div>
      <div className="flex items-center gap-3 border-b border-border-default bg-surface px-base py-md md:hidden">
        <span className="text-label font-semibold text-text-primary">Baby Names</span>
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-xl py-xxl md:ml-[76px]">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-border-default border-t-brand-primary"
          role="status"
          aria-label="Finding names"
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-h1 font-semibold text-text-primary">Finding the most popular baby names</h1>
          <p className="text-subtitle text-text-secondary">We're checking the latest naming data for your selection.</p>
        </div>
      </div>
    </div>
  )
}
