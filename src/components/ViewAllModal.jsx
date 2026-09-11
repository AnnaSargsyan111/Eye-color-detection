import { useEffect } from 'react'

// Shared "View all" modal shell — header with title + close, scrollable body.
// Matches the ConfirmRemoveModal conventions (backdrop-click closes, body scroll-locked).
export default function ViewAllModal({ open, title, onClose, headerAction, children }) {
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-base" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-[480px] flex-col rounded-card bg-surface p-xl shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-base flex items-center justify-between gap-4">
          <h2 className="text-h1 font-semibold text-text-primary" style={{ fontSize: 18 }}>
            {title}
          </h2>
          <div className="flex items-center gap-3">
            {headerAction}
            <button type="button" onClick={onClose} aria-label="Close" className="text-xl leading-none text-text-secondary">
              ×
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
