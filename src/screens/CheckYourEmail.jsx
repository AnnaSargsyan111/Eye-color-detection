import Button from '../components/Button.jsx'
import Logo from '../components/Logo.jsx'

export default function CheckYourEmail({ onNavigateLogin, onContinueDevPreview }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page p-xl font-sans">
      <Logo />
      <div className="flex w-full max-w-[440px] flex-col gap-xl rounded-card bg-surface p-xxxl text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <h1 className="text-h1 font-semibold text-text-primary">Check your email</h1>

        <p className="text-subtitle text-text-secondary">
          If an account exists for this email, a reset link has been sent.
        </p>

        <Button variant="primary" className="w-full" onClick={onContinueDevPreview}>
          Continue to Reset Password (dev preview)
        </Button>

        <p className="text-center text-link text-text-secondary">
          Back to{' '}
          <a href="#" onClick={onNavigateLogin} className="font-bold text-brand-primary underline">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}
