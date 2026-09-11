import { createContext, useContext, useState } from 'react'

const SidebarMenuContext = createContext(null)

// Tracks whether the mobile nav drawer (opened via the hamburger button in
// each screen's mobile top bar) is open. Deliberately NOT persisted — unlike
// the desktop rail's expand/collapse preference, a mobile drawer that stayed
// open across reloads would just cover the screen on next visit.
export function SidebarMenuProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <SidebarMenuContext.Provider value={{ mobileOpen, setMobileOpen }}>{children}</SidebarMenuContext.Provider>
  )
}

export function useSidebarMenu() {
  const ctx = useContext(SidebarMenuContext)
  if (!ctx) throw new Error('useSidebarMenu must be used within a SidebarMenuProvider')
  return ctx
}
