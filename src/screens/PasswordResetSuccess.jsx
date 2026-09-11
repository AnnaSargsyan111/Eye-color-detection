import Button from '../components/Button.jsx'
import Logo from '../components/Logo.jsx'

export default function PasswordResetSuccess({ onNavigateLogin }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page p-xl font-sans">
      <Logo />
      <div className="flex w-full max-w-[440px] flex-col gap-xl rounded-card bg-surface p-xxxl text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <h1 className="text-h1 font-semibold text-text-primary">Password reset successfully</h1>
        <p className="text-subtitle text-text-secondary">Your password has been reset. You can now log in.</p>
        <Button variant="primary" className="w-full" onClick={onNavigateLogin}>
          Back to Login
        </Button>
      </div>
    </div>
  )
}
