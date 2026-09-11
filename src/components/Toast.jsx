import { useEffect } from 'react'

// Auto-dismisses after 3s, matching the Figma "Changes saved" toast spec.
export default function Toast({ message, open, onClose }) {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-input bg-text-primary px-base py-md text-body font-medium text-on-brand shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <span className="text-success">✓</span>
      {message}
    </div>
  )
}
