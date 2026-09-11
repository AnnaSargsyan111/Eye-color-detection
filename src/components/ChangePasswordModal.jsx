import { useEffect, useState } from 'react'
import PasswordField from './PasswordField.jsx'
import Button from './Button.jsx'

export default function ChangePasswordModal({ open, onCancel, onSaved }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setPassword('')
      setConfirm('')
      setError('')
    }
  }, [open])

  if (!open) return null

  function handleSave(e) {
    e.preventDefault()
    if (!password || !confirm) {
      setError('Both fields are required')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-base" onClick={onCancel}>
      <form
        onSubmit={handleSave}
        className="w-full max-w-[420px] rounded-card bg-surface p-xl shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-h1 font-semibold text-text-primary" style={{ fontSize: 20 }}>
            Change Password
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="text-xl leading-none text-text-secondary">
            ×
          </button>
        </div>

        <div className="mt-lg flex flex-col gap-base">
          <PasswordField
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordField
            label="Confirm Password"
            placeholder="Re-enter new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={error}
          />
        </div>

        <div className="mt-xl flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
