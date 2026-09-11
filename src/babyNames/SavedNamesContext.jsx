import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'aira.savedNames'
const SavedNamesContext = createContext(null)

function keyFor(record) {
  return `${record.name}|${record.sex}`
}

function loadInitial() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function SavedNamesProvider({ children }) {
  const [savedNames, setSavedNames] = useState(loadInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedNames))
    } catch {
      // localStorage unavailable (private browsing, etc.) — state just won't persist across reloads.
    }
  }, [savedNames])

  const isSaved = useCallback((record) => savedNames.some((n) => keyFor(n) === keyFor(record)), [savedNames])

  const saveName = useCallback((record) => {
    setSavedNames((prev) => (prev.some((n) => keyFor(n) === keyFor(record)) ? prev : [...prev, record]))
  }, [])

  const removeName = useCallback((record) => {
    setSavedNames((prev) => prev.filter((n) => keyFor(n) !== keyFor(record)))
  }, [])

  const removeAllNames = useCallback(() => {
    setSavedNames([])
  }, [])

  return (
    <SavedNamesContext.Provider value={{ savedNames, isSaved, saveName, removeName, removeAllNames }}>
      {children}
    </SavedNamesContext.Provider>
  )
}

export function useSavedNames() {
  const ctx = useContext(SavedNamesContext)
  if (!ctx) throw new Error('useSavedNames must be used within a SavedNamesProvider')
  return ctx
}
