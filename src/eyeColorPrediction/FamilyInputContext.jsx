import { createContext, useCallback, useContext, useState } from 'react'

const EMPTY = { mother: null, father: null, grandparents: {}, greatGrandparents: {} }

const FamilyInputContext = createContext(null)

// Collects the real family eye-color input across the Parents ->
// Grandparents -> Great-grandparents screens, in memory only (mirrors
// RecommendationContext's pattern) — reset whenever the user starts a fresh
// prediction from Eye Color Welcome.
export function FamilyInputProvider({ children }) {
  const [input, setInput] = useState(EMPTY)

  const reset = useCallback(() => setInput(EMPTY), [])

  const setParent = useCallback((role, member) => {
    setInput((prev) => ({ ...prev, [role]: member }))
  }, [])

  const setGrandparent = useCallback((role, member) => {
    setInput((prev) => ({ ...prev, grandparents: { ...prev.grandparents, [role]: member } }))
  }, [])

  const setGreatGrandparent = useCallback((role, member) => {
    setInput((prev) => ({ ...prev, greatGrandparents: { ...prev.greatGrandparents, [role]: member } }))
  }, [])

  /** Builds the FamilyInput shape the prediction engine expects, omitting any role that was never filled in (never a fabricated "unknown"). */
  const toFamilyInput = useCallback(() => {
    if (!input.mother || !input.father) return null
    const result = { mother: input.mother, father: input.father }
    for (const [role, member] of Object.entries(input.grandparents)) {
      if (member) result[role] = member
    }
    const greatGrandparents = Object.values(input.greatGrandparents).filter(Boolean)
    if (greatGrandparents.length > 0) result.greatGrandparents = greatGrandparents
    return result
  }, [input])

  return (
    <FamilyInputContext.Provider value={{ input, reset, setParent, setGrandparent, setGreatGrandparent, toFamilyInput }}>
      {children}
    </FamilyInputContext.Provider>
  )
}

export function useFamilyInput() {
  const ctx = useContext(FamilyInputContext)
  if (!ctx) throw new Error('useFamilyInput must be used within a FamilyInputProvider')
  return ctx
}
