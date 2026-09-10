import { useState } from 'react'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPassword({ onNavigateLogin }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) setError('This field is required')
    else if (!EMAIL_RE.test(email)) setError('Enter a valid email address')
    else setError('')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page p-xl font-sans">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[440px] flex-col gap-xl rounded-card bg-surface p-xxxl shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      >
        <h1 className="text-h1 font-semibold text-text-primary">Reset password</h1>

        <p className="text-subtitle text-text-secondary">
          Password reset link will be sent to your email address and will be active within 24 hours
        </p>

        <TextField
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />

        <Button type="submit" variant="primary" className="w-full">
          Receive link
        </Button>

        <p className="text-center text-link text-text-secondary">
          Remember password?{' '}
          <a href="#" onClick={onNavigateLogin} className="font-bold text-brand-primary underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  )
}
