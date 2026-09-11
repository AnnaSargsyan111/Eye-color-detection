import { useState } from 'react'
import AiraSidebar from '../components/AiraSidebar.jsx'
import MobileTopBar from '../components/MobileTopBar.jsx'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'
import ChangePasswordModal from '../components/ChangePasswordModal.jsx'
import Toast from '../components/Toast.jsx'
import { useAccount } from '../account/AccountContext.jsx'

export default function Settings({ onNavigate }) {
  const { account, setAccount } = useAccount()
  const [form, setForm] = useState(account)
  const [errors, setErrors] = useState({})
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  function update(field) {
    return (e) => {
      const value = e.target.value
      setForm((f) => ({ ...f, [field]: value }))
      setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev))
    }
  }

  function handleSave(e) {
    e.preventDefault()
    const next = {}
    if (!form.firstName) next.firstName = 'This field is required'
    if (!form.lastName) next.lastName = 'This field is required'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setAccount(form)
    setToastMessage('Changes saved')
  }

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <AiraSidebar active="settings" onNavigate={onNavigate} />
      <MobileTopBar title="Settings" />

      <div className="flex flex-col items-center p-xl md:ml-[76px]">
        <form
          onSubmit={handleSave}
          noValidate
          className="flex w-full max-w-[560px] flex-col gap-xl rounded-card border border-border-default bg-surface p-xxl"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-semibold text-text-primary">Settings</h1>
            <p className="text-subtitle text-text-secondary">
              Manage the account information you provided during registration.
            </p>
          </div>

          <div className="flex flex-col gap-base sm:flex-row">
            <TextField
              label="First Name"
              value={form.firstName}
              onChange={update('firstName')}
              error={errors.firstName}
              className="flex-1"
            />
            <TextField
              label="Last Name"
              value={form.lastName}
              onChange={update('lastName')}
              error={errors.lastName}
              className="flex-1"
            />
          </div>

          <TextField
            label="Email"
            type="email"
            value={form.email}
            disabled
            title="The email address is not editable"
            aria-label="Email (not editable)"
          />

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
