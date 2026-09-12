import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ensureArmStatLoaded } from '../services/babyNames/index.js'

const DEFAULTS = {
  // Baby Names landing pre-selects Girl/International so Explore is always
  // clickable there. Popularity/style/length stay unselected and required —
  // Steps 2-4 validate on click (each step shows its own inline error).
  // Adventure and firstLetter (Steps 5-6) also start unselected, but stay
  // optional — Continue works there with nothing picked.
  source: 'ons_england_wales',
  gender: 'female',
  popularity: null,
  style: null,
  length: null,
  adventure: null,
  firstLetter: undefined,
}

const RecommendationContext = createContext(null)

// Holds the in-progress recommendation flow's selections (and, once
// computed, its outcome) for as long as the user is inside the flow. Kept in
// memory only (not localStorage): starting the flow fresh from "Get
// recommendations" always calls startFlow(), which overwrites this with the
// current Location/Gender carried over from where the user started — so
// leaving and re-entering the flow can never show stale/conflicting state.
export function RecommendationProvider({ children }) {
  const [preferences, setPreferences] = useState(DEFAULTS)
  const [outcome, setOutcome] = useState(null)
  // 'idle' | 'loading' | 'ready' | 'error' — tracks the real ArmStatBank
  // fetch (see services/babyNames/dataSources.js ensureArmStatLoaded), kicked
  // off once here so it has the whole session to resolve before a user
  // reaches Armenia-side results.
  const [armStatStatus, setArmStatStatus] = useState('idle')

  useEffect(() => {
    let cancelled = false
    setArmStatStatus('loading')
    ensureArmStatLoaded()
      .then(() => {
        if (!cancelled) setArmStatStatus('ready')
      })
      .catch((err) => {
        if (!cancelled) setArmStatStatus('error')
        console.error('Failed to load ArmStatBank baby name data:', err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const startFlow = useCallback((carryOver) => {
    setOutcome(null)
    setPreferences({ ...DEFAULTS, ...carryOver })
  }, [])

  const update = useCallback((patch) => {
    setOutcome(null)
    setPreferences((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetFlow = useCallback(() => {
    setOutcome(null)
    setPreferences(DEFAULTS)
  }, [])

  return (
    <RecommendationContext.Provider value={{ preferences, update, startFlow, resetFlow, outcome, setOutcome, armStatStatus }}>
      {children}
    </RecommendationContext.Provider>
  )
}

export function useRecommendationFlow() {
  const ctx = useContext(RecommendationContext)
  if (!ctx) throw new Error('useRecommendationFlow must be used within a RecommendationProvider')
  return ctx
}
