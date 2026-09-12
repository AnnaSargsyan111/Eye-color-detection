import { useEffect, useRef } from 'react'

// Auto-dismisses after 3s, matching the Figma "Changes saved" toast spec.
export default function Toast({ message, open, onClose }) {
  // Callers typically pass a new onClose function identity on every render
  // (e.g. an inline arrow function). Reading it via a ref, rather than
  // depending on it directly, keeps the 3s timer tied to `open` alone so an
  // unrelated parent re-render (e.g. the user typing elsewhere on the page)
  // can't restart the countdown.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => onCloseRef.current(), 3000)
    return () => clearTimeout(timer)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-input bg-text-primary px-base py-md text-body font-medium text-on-brand shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
      <span className="text-success">✓</span>
      {message}
    </div>
  )
}
