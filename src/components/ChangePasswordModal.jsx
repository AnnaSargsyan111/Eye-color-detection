import { useEffect, useState } from 'react'
import PasswordField from './PasswordField.jsx'
import PasswordRequirements, { PASSWORD_RULES } from './PasswordRequirements.jsx'
import Button from './Button.jsx'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js'

export default function ChangePasswordModal({ open, onCancel, onSaved }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})

  useBodyScrollLock(open)

  useEffect(() => {
    if (open) {
      setPassword('')
      setConfirm('')
      setErrors({})
    }
  }, [open])

  if (!open) return null

  function handleSave(e) {
    e.preventDefault()
    const next = {}
    if (!password) next.password = 'This field is required'
    else if (!PASSWORD_RULES.every((r) => r.test(password))) next.password = 'Password does not meet all requirements'
    if (!confirm) next.confirm = 'This field is required'
    else if (password && confirm !== password) next.confirm = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-base" onClick={onCancel}>
      <form
        onSubmit={handleSave}
        noValidate
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
          <div className="flex flex-col gap-base">
            <PasswordField
              label="New Password"
              placeholder="Enter new password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                const value = e.target.value
                setPassword(value)
                setErrors((prev) => (prev.password ? { ...prev, password: '' } : prev))
              }}
              error={errors.password}
            />
            <PasswordRequirements value={password} />
          </div>

          <PasswordField
            label="Confirm Password"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              const value = e.target.value
              setConfirm(value)
              setErrors((prev) => (prev.confirm ? { ...prev, confirm: '' } : prev))
            }}
            error={errors.confirm}
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
