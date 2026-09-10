export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-button px-lg py-base text-button-label font-semibold transition-colors'
  const styles =
    variant === 'primary'
      ? 'bg-brand-primary text-on-brand hover:bg-brand-primary-hover'
      : 'bg-surface text-text-primary border border-border-default hover:bg-bg-page'

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}
