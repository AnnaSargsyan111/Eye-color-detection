export default function HeartButton({ saved, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? 'Remove from saved names' : 'Save name'}
      aria-pressed={saved}
      className={`shrink-0 transition-colors ${
        saved ? 'text-brand-primary' : 'text-text-secondary hover:text-brand-primary'
      } ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 20.5s-7.5-4.6-10-9.3C0.3 7.8 2 4 5.6 4c2.1 0 3.6 1.1 4.4 2.4C10.8 5.1 12.3 4 14.4 4 18 4 19.7 7.8 22 11.2c-2.5 4.7-10 9.3-10 9.3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
