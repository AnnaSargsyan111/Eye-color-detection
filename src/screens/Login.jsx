import { useState } from 'react'
import TextField from '../components/TextField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import Button from '../components/Button.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login({ onNavigateSignup, onNavigateForgotPassword }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!form.email) next.email = 'This field is required'
    else if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address'
    if (!form.password) next.password = 'This field is required'
    setErrors(next)
    // A real submit would call the auth API here and, on invalid credentials,
    // show one generic error rather than revealing which field was wrong:
    // setErrors({ password: 'Incorrect email address or password' })
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page p-xl font-sans">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[440px] flex-col gap-xl rounded-card bg-surface p-xxxl shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      >
        <h1 className="text-center text-h1 font-semibold text-text-primary">Log in to your account</h1>

        <TextField
          label="Email address"
          type="email"
          placeholder="Type your email address"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />

        <PasswordField
          label="Password"
          placeholder="Type your password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />

        <a
          href="#"
          onClick={onNavigateForgotPassword}
          className="text-link font-medium text-brand-primary underline"
        >
          Forgot password?
        </a>

        <Button type="submit" variant="primary" className="w-full">
          Log in
        </Button>

        <p className="text-center text-link text-text-secondary">
          Don't have an account yet?{' '}
          <a href="#" onClick={onNavigateSignup} className="font-bold text-brand-primary underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  )
}
