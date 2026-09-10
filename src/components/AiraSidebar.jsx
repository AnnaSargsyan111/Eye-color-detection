import { useSavedNames } from '../babyNames/SavedNamesContext.jsx'

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

export default function AiraSidebar({ active, onNavigate }) {
  const { savedNames } = useSavedNames()

  const items = [
    { key: 'prediction-result', label: 'Eye Color', Icon: EyeIcon },
    { key: 'baby-names', label: 'Baby Names', Icon: StarIcon },
    // Only shown once the user has saved at least one name — removed again
    // automatically (this array is recomputed on every render) once empty.
    ...(savedNames.length > 0 ? [{ key: 'saved-names', label: 'Saved Names', Icon: HeartIcon }] : []),
    { key: 'settings', label: 'Settings', Icon: GearIcon },
  ]

  return (
    <div className="fixed left-0 top-0 flex h-screen w-[76px] flex-col items-center gap-2 border-r border-border-default bg-surface py-xl">
      {items.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onNavigate?.(key)}
          aria-label={label}
          title={label}
          className={`flex h-10 w-10 items-center justify-center rounded-input transition-colors ${
            active === key ? 'bg-bg-page text-brand-primary' : 'text-text-secondary hover:bg-bg-page'
          }`}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
