import { useState } from 'react'
import TextField from '../components/TextField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import PasswordRequirements, { PASSWORD_RULES } from '../components/PasswordRequirements.jsx'
import Button from '../components/Button.jsx'
import Logo from '../components/Logo.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LATIN_NAME_RE = /^[A-Za-z\s'-]*$/

function nameError(value) {
  if (!value) return 'This field is required'
  if (!LATIN_NAME_RE.test(value)) return 'Use Latin letters'
  return ''
}

export default function CreateAccount({ onNavigateLogin, onCreated }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})

  function update(field) {
    return (e) => {
      const value = e.target.value
      setForm((f) => ({ ...f, [field]: value }))
      // Clear a stale error as soon as the user starts fixing it, rather than
      // leaving e.g. "This field is required" visible after they've already typed something.
      setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev))
    }
  }

  function updateName(field) {
    return (e) => {
      const value = e.target.value
      setForm((f) => ({ ...f, [field]: value }))
      // Live feedback for non-Latin input, independent of the on-submit required check.
      setErrors((prev) => ({ ...prev, [field]: value && !LATIN_NAME_RE.test(value) ? 'Use Latin letters' : '' }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    next.firstName = nameError(form.firstName)
    next.lastName = nameError(form.lastName)
    if (!next.firstName) delete next.firstName
    if (!next.lastName) delete next.lastName
    if (!form.email) next.email = 'This field is required'
    else if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address'
    if (!form.password) next.password = 'This field is required'
    else if (!PASSWORD_RULES.every((r) => r.test(form.password)))
      next.password = 'Password does not meet all requirements'
    setErrors(next)
    // A real submit would create the account via an API here. There's no
    // backend in this project, so a validation-clean submit just proceeds
    // straight into the app, same as a real signup would after success.
    if (Object.keys(next).length === 0)
      onCreated?.({ firstName: form.firstName, lastName: form.lastName, email: form.email })
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page p-xl font-sans">
      <Logo />
      <form
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className="flex w-full max-w-[440px] flex-col gap-xl rounded-card bg-surface p-xxxl shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      >
        <h1 className="text-h1 font-semibold text-text-primary">Create Account</h1>

        <div className="flex gap-base">
          <TextField
            label="First Name"
            placeholder="First name"
            autoComplete="off"
            value={form.firstName}
            onChange={updateName('firstName')}
            error={errors.firstName}
            className="flex-1"
          />
          <TextField
            label="Last Name"
            placeholder="Last name"
            autoComplete="off"
            value={form.lastName}
            onChange={updateName('lastName')}
            error={errors.lastName}
            className="flex-1"
          />
        </div>

        <TextField
          label="Email"
          type="email"
          autoComplete="off"
          placeholder="you@example.com"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />

        <div className="flex flex-col gap-base">
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
          />
          <PasswordRequirements value={form.password} />
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Create account
        </Button>

        <p className="text-center text-link text-text-secondary">
          Already have an account?{' '}
          <a href="#" onClick={onNavigateLogin} className="font-bold text-brand-primary underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  )
}
