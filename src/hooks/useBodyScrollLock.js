import { useEffect } from 'react'

// Module-level counter, not per-component state — shared by every modal that
// locks body scroll (ConfirmRemoveModal, ViewAllModal, ChangePasswordModal).
// A naive "capture the previous value, restore it on close" approach breaks
// as soon as two of these are open at once (e.g. a remove-confirmation modal
// opened from inside a "view all" modal): whichever one captured 'hidden' as
// its "original" — because the other was already open — re-locks the body
// forever once both close in the same update, since nothing undoes it after.
// Counting locks instead means the body only unlocks once every modal that
// asked for a lock has released it, regardless of open/close order.
let lockCount = 0

export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return

    lockCount += 1
    document.body.style.overflow = 'hidden'

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        document.body.style.overflow = ''
      }
    }
  }, [active])
}
