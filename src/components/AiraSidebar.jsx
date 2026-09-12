import { useEffect, useRef, useState } from 'react'
import { useSavedNames } from '../babyNames/SavedNamesContext.jsx'
import { useAccount } from '../account/AccountContext.jsx'
import { useSidebarMenu } from './SidebarMenuContext.jsx'

const EXPANDED_STORAGE_KEY = 'aira.sidebarExpanded'

function EyeIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="10" cy="7" rx="9.3" ry="6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="7" r="2.6" fill="currentColor" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 20.5s-7.5-4.6-10-9.3C0.3 7.8 2 4 5.6 4c2.1 0 3.6 1.1 4.4 2.4C10.8 5.1 12.3 4 14.4 4 18 4 19.7 7.8 22 11.2c-2.5 4.7-10 9.3-10 9.3Z" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 3.75H18a2.25 2.25 0 0 1 2.25 2.25v12a2.25 2.25 0 0 1-2.25 2.25h-3M9 15.75l-4.5-4.5m0 0L9 6.75m-4.5 4.5H16.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon({ flipped }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flipped ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AiraSidebar({ active, onNavigate }) {
  const { savedNames } = useSavedNames()
  const { fullName, initials } = useAccount()
  const { mobileOpen, setMobileOpen } = useSidebarMenu()
  const railRef = useRef(null)
  const [expanded, setExpanded] = useState(() => {
    try {
      return window.localStorage.getItem(EXPANDED_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(EXPANDED_STORAGE_KEY, String(expanded))
    } catch {
      // Storage unavailable (private browsing, etc.) — expanded state just won't persist across reloads.
    }
  }, [expanded])

  const items = [
    { key: 'eye-welcome', label: 'Eye Color', Icon: EyeIcon },
    { key: 'baby-names', label: 'Baby Names', Icon: StarIcon },
    // Only shown once the user has saved at least one name — removed again
    // automatically (this array is recomputed on every render) once empty.
    ...(savedNames.length > 0 ? [{ key: 'saved-names', label: 'Saved Names', Icon: HeartIcon }] : []),
    { key: 'settings', label: 'Settings', Icon: GearIcon },
  ]

  // On mobile the rail itself is hidden — the only way in is the hamburger
  // button in each screen's MobileTopBar, which opens this as a full drawer.
  // "expanded" (desktop icon-rail vs. labeled drawer) and "mobileOpen"
  // (mobile drawer open vs. closed) are independent, but both render the
  // same wide, labeled layout, so either one being true widens the rail.
  const wide = expanded || mobileOpen

  function closeAll() {
    setExpanded(false)
    setMobileOpen(false)
  }

  // Click-outside-to-close, via a document listener rather than a full-
  // viewport overlay <div>. A fixed inset-0 overlay sitting over the whole
  // page — even with no handlers of its own beyond onClick — was found to
  // swallow wheel/trackpad scroll input in some browsers, silently breaking
  // page scrolling on every screen for as long as the sidebar stayed
  // expanded (which persists across reloads on desktop). A listener has no
  // hit-testable element to block anything with.
  useEffect(() => {
    if (!wide) return
    function handlePointerDown(e) {
      if (!railRef.current?.contains(e.target)) closeAll()
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide])

  function handleNavigate(key) {
    closeAll()
    onNavigate?.(key)
  }

  function toggleRail() {
    if (mobileOpen) setMobileOpen(false)
    else setExpanded((v) => !v)
  }

  return (
    <div
      ref={railRef}
      className={`fixed left-0 top-0 z-40 h-screen flex-col gap-2 border-r border-border-default bg-surface py-xl transition-[width] duration-150 ${
        mobileOpen ? 'flex' : 'hidden md:flex'
      } ${wide ? 'w-[220px] items-stretch px-base' : 'w-[76px] items-center'}`}
    >
        <div className={`mb-md flex items-center ${wide ? 'justify-between px-1' : 'flex-col gap-1'}`}>
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-primary text-sm font-bold text-on-brand">
            A
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-surface bg-success" />
          </div>
          <button
            type="button"
            onClick={toggleRail}
            aria-label={mobileOpen ? 'Close menu' : expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            title={mobileOpen ? 'Close menu' : expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="flex h-6 w-6 items-center justify-center rounded-input text-text-secondary transition-colors hover:bg-bg-page"
          >
            <ChevronIcon flipped={wide} />
          </button>
        </div>

        {items.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleNavigate(key)}
            aria-label={label}
            title={label}
            className={`relative flex h-10 items-center rounded-input transition-colors ${
              wide ? 'gap-3 px-3' : 'w-10 justify-center self-center'
            } ${active === key ? 'bg-bg-page text-brand-primary' : 'text-text-secondary hover:bg-bg-page'}`}
          >
            {active === key && (
              <span className={`absolute h-5 w-[3px] rounded-full bg-brand-primary ${wide ? '-left-2' : '-left-3'}`} />
            )}
            <span className="shrink-0">
              <Icon />
            </span>
            {wide && <span className="text-body font-medium">{label}</span>}
          </button>
        ))}

        <div className="flex-1" />

        <div className={`flex items-center ${wide ? 'gap-3 px-3' : 'flex-col gap-2'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-unmet/40 text-xs font-bold text-text-primary">
            {initials}
          </div>
          {wide && <span className="text-caption font-medium text-text-secondary">{fullName}</span>}
        </div>
        <button
          type="button"
          onClick={() => handleNavigate('login')}
          aria-label="Log out"
          title="Log out"
          className={`flex h-10 items-center rounded-input text-text-secondary transition-colors hover:bg-bg-page ${
            wide ? 'gap-3 px-3' : 'w-10 justify-center self-center'
          }`}
        >
          <span className="shrink-0">
            <LogoutIcon />
          </span>
          {wide && <span className="text-body font-medium">Log out</span>}
        </button>
      </div>
  )
}
