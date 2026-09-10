import { useEffect } from 'react'
import Button from './Button.jsx'

export default function ConfirmRemoveModal({ open, onCancel, onConfirm }) {
  // Prevent the underlying page from scrolling while the modal is open.
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-base"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] rounded-card bg-surface p-xl shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-h1 font-semibold text-text-primary" style={{ fontSize: 20 }}>
            Remove saved name?
          </h2>
          <button onClick={onCancel} aria-label="Close" className="text-xl leading-none text-text-secondary">
            ×
          </button>
        </div>
        <p className="mt-2 text-body text-text-secondary">
          Are you sure you want to remove this name from your saved names?
        </p>
        <div className="mt-xl flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={onConfirm}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
