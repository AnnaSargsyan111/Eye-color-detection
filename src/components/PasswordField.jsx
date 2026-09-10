import { useId, useState } from 'react'

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.3 5.4C10.16 5.14 11.06 5 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.3 3.1M6.1 6.6C4 8.1 2 12 2 12s1.2 2.5 3.4 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PasswordField({ label, error, className = '', ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-label font-medium text-text-primary">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-input border bg-surface px-base py-md transition-colors focus-within:border-[1.5px] focus-within:border-border-focus ${
          error ? 'border-error' : 'border-border-default'
        }`}
      >
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="w-full bg-transparent text-body text-text-primary placeholder:text-text-secondary outline-none"
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
          className="shrink-0 text-text-secondary"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  )
}
