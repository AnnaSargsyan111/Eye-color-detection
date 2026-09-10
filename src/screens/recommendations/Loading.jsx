import { useEffect, useState } from 'react'
import RecommendationLayout from './RecommendationLayout.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'
import { generateRecommendations } from '../../services/babyNames/index.js'

// The recommendation calculation itself is a fast, synchronous, purely local
// computation over the bundled dataset (no network call to fail or hang on).
// It still runs a tick after mount rather than during render, so the loading
// state genuinely paints before the (real, not simulated) work happens — a
// minimal setTimeout(0), not an artificial fixed-length wait. (Deliberately
// not requestAnimationFrame: that's paused entirely while the tab is
// backgrounded, which would leave the user stuck on this screen.)
export default function Loading({ onNavigate }) {
  const { preferences, setOutcome } = useRecommendationFlow()
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      if (cancelled) return
      try {
        const outcome = generateRecommendations(preferences)
        setOutcome(outcome)
        onNavigate('rec-results')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong while finding names.')
      }
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <RecommendationLayout step={null} title="Finding names you'll love" subtitle="We're matching your preferences with the latest naming data." onNavigate={onNavigate} hideFooter>
      <div className="flex flex-col items-center gap-4 py-xxxl">
        {error ? (
          <>
            <p className="text-body text-error">{error}</p>
            <button type="button" className="text-link text-brand-primary underline" onClick={() => onNavigate('rec-6')}>
              Go back and adjust preferences
            </button>
          </>
        ) : (
          <div
            className="h-12 w-12 animate-spin rounded-full border-4 border-border-default border-t-brand-primary"
            role="status"
            aria-label="Finding names"
          />
        )}
      </div>
    </RecommendationLayout>
  )
}
