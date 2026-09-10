import { useId } from 'react'

export default function TextField({ label, error, className = '', ...props }) {
  const id = useId()

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-label font-medium text-text-primary">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-input border px-base py-md text-body text-text-primary placeholder:text-text-secondary bg-surface outline-none transition-colors focus:border-[1.5px] focus:border-border-focus ${
          error ? 'border-error' : 'border-border-default'
        }`}
        {...props}
      />
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  )
}
