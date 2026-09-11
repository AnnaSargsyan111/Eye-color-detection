import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'aira.account'
const DEFAULT_ACCOUNT = { firstName: 'Anna', lastName: 'Sargsyan', email: 'anna.sargsyan@example.com' }

const AccountContext = createContext(null)

function loadInitial() {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_ACCOUNT, ...JSON.parse(raw) } : DEFAULT_ACCOUNT
  } catch {
    return DEFAULT_ACCOUNT
  }
}

export function AccountProvider({ children }) {
  const [account, setAccountState] = useState(loadInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account))
    } catch {
      // localStorage unavailable (private browsing, etc.) — state just won't persist across reloads.
    }
  }, [account])

  const setAccount = useCallback((fields) => {
    setAccountState((prev) => ({ ...prev, ...fields }))
  }, [])

  const fullName = `${account.firstName} ${account.lastName}`.trim()
  const initials = `${account.firstName[0] ?? ''}${account.lastName[0] ?? ''}`.toUpperCase()

  return (
    <AccountContext.Provider value={{ account, setAccount, fullName, initials }}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used within an AccountProvider')
  return ctx
}
