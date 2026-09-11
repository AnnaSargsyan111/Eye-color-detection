import { useState } from 'react'
import AiraSidebar from '../components/AiraSidebar.jsx'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'
import ChangePasswordModal from '../components/ChangePasswordModal.jsx'
import Toast from '../components/Toast.jsx'

export default function Settings({ onNavigate }) {
  const [form, setForm] = useState({ firstName: 'Anna', lastName: 'Sargsyan', email: 'anna.sargsyan@example.com' })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSave(e) {
    e.preventDefault()
    setToastMessage('Changes saved')
  }

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <div className="hidden md:block">
        <AiraSidebar active="settings" onNavigate={onNavigate} />
      </div>
      <div className="flex items-center gap-3 border-b border-border-default bg-surface px-base py-md md:hidden">
        <span className="text-label font-semibold text-text-primary">Settings</span>
      </div>

      <div className="flex flex-col items-center p-xl md:ml-[76px]">
        <form
          onSubmit={handleSave}
          className="flex w-full max-w-[560px] flex-col gap-xl rounded-card border border-border-default bg-surface p-xxl"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-semibold text-text-primary">Settings</h1>
            <p className="text-subtitle text-text-secondary">
              Manage the account information you provided during registration.
            </p>
          </div>

          <div className="flex flex-col gap-base sm:flex-row">
            <TextField label="First Name" value={form.firstName} onChange={update('firstName')} className="flex-1" />
            <TextField label="Last Name" value={form.lastName} onChange={update('lastName')} className="flex-1" />
          </div>

          <TextField label="Email" type="email" value={form.email} onChange={update('email')} />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save changes
            </Button>
          </div>
        </form>
      </div>

      <ChangePasswordModal
        open={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        onSaved={() => {
          setShowPasswordModal(false)
          setToastMessage('Password updated')
        }}
      />

      <Toast message={toastMessage} open={!!toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  )
}
