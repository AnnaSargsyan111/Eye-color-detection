import { useEffect, useState } from 'react'
import logo from '../assets/aira-logo.png'

// Brief branded transition shown once, right after a successful Registration
// or Login, before the existing first authenticated page (Eye Color Welcome)
// appears. Auto-advances — no user action required. Total on-screen time is
// ~1.8s: a quick fade in, a short hold, then a quick fade out.
const FADE_MS = 300
const HOLD_MS = 1200

export default function AiraSplash({ onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const fadeInTimer = setTimeout(() => setVisible(true), 20)
    const fadeOutTimer = setTimeout(() => setVisible(false), 20 + FADE_MS + HOLD_MS)
    const doneTimer = setTimeout(() => onDone(), 20 + FADE_MS + HOLD_MS + FADE_MS)
    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(fadeOutTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page font-sans">
      <img
        src={logo}
        alt="Aira"
        className={`h-32 w-auto mix-blend-multiply transition-opacity ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      />
    </div>
  )
}
