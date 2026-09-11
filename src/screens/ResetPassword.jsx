import { useState } from 'react'
import PasswordField from '../components/PasswordField.jsx'
import PasswordRequirements, { PASSWORD_RULES } from '../components/PasswordRequirements.jsx'
import Button from '../components/Button.jsx'
import Logo from '../components/Logo.jsx'

export default function ResetPassword({ onReset }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!password) next.password = 'This field is required'
    else if (!PASSWORD_RULES.every((r) => r.test(password))) next.password = 'Password does not meet all requirements'
    if (!confirm) next.confirm = 'This field is required'
    else if (password && confirm !== password) next.confirm = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length === 0) onReset?.()
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page p-xl font-sans">
      <Logo />
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[440px] flex-col gap-xl rounded-card bg-surface p-xxxl shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      >
        <h1 className="text-h1 font-semibold text-text-primary">Reset your password</h1>
        <p className="text-subtitle text-text-secondary">Choose a new password for your account.</p>

        <div className="flex flex-col gap-base">
          <PasswordField
            label="New Password"
            placeholder="Enter a new password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => (prev.password ? { ...prev, password: '' } : prev))
            }}
            error={errors.password}
          />
          <PasswordRequirements value={password} />
        </div>

        <PasswordField
          label="Confirm Password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value)
            setErrors((prev) => (prev.confirm ? { ...prev, confirm: '' } : prev))
          }}
          error={errors.confirm}
        />

        <Button type="submit" variant="primary" className="w-full">
          Reset password
        </Button>
      </form>
    </div>
  )
}
