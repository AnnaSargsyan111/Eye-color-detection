import { useSidebarMenu } from './SidebarMenuContext.jsx'

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// Shared mobile-only top bar: optional back arrow, screen title, and a
// hamburger button that opens AiraSidebar's mobile drawer — the only way to
// reach Eye Color / Baby Names / Settings / Log out on a mobile viewport,
// since the sidebar rail itself is desktop-only.
export default function MobileTopBar({ title, onBack }) {
  const { setMobileOpen } = useSidebarMenu()

  return (
    <div className="flex items-center gap-3 border-b border-border-default bg-surface px-base py-md md:hidden">
      {onBack && (
        <button type="button" onClick={onBack} aria-label="Back" className="text-lg text-text-secondary">
          ←
        </button>
      )}
      <span className="flex-1 text-label font-semibold text-text-primary">{title}</span>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="text-text-secondary transition-colors hover:text-text-primary"
      >
        <MenuIcon />
      </button>
    </div>
  )
}
