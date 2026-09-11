import { useState } from 'react'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'
import Logo from '../components/Logo.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPassword({ onNavigateLogin, onSent }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) {
      setError('This field is required')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    // A real submit would call the auth API here. There's no backend in this
    // project, so — matching the real UX either way, since the message is
    // deliberately non-committal about whether the account exists — this
    // just proceeds to the same "check your email" confirmation.
    onSent?.()
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page p-xl font-sans">
      <Logo />
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-[440px] flex-col gap-xl rounded-card bg-surface p-xxxl shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
      >
        <h1 className="text-h1 font-semibold text-text-primary">Reset password</h1>

        <p className="text-subtitle text-text-secondary">
          Password reset link will be sent to your email address and will be active within 24 hours
        </p>

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError((prev) => (prev ? '' : prev))
          }}
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
