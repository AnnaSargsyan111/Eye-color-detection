import { useState } from 'react'
import CreateAccount from './screens/CreateAccount.jsx'
import Login from './screens/Login.jsx'
import ForgotPassword from './screens/ForgotPassword.jsx'
import CheckYourEmail from './screens/CheckYourEmail.jsx'
import ResetPassword from './screens/ResetPassword.jsx'
import PasswordResetSuccess from './screens/PasswordResetSuccess.jsx'
import EyeColorWelcome from './screens/EyeColorWelcome.jsx'
import EyeColorParents from './screens/eyeColor/EyeColorParents.jsx'
import EyeColorGrandparents from './screens/eyeColor/EyeColorGrandparents.jsx'
import EyeColorGreatGrandparents from './screens/eyeColor/EyeColorGreatGrandparents.jsx'
import PredictionResult, { SAMPLE_FAMILY_INPUT } from './screens/PredictionResult.jsx'
import BabyNamesLanding from './screens/BabyNamesLanding.jsx'
import BabyNamesLoading from './screens/BabyNamesLoading.jsx'
import BabyNames from './screens/BabyNames.jsx'
import SavedNames from './screens/SavedNames.jsx'
import Settings from './screens/Settings.jsx'
import Step1 from './screens/recommendations/Step1.jsx'
import Step2 from './screens/recommendations/Step2.jsx'
import Step3 from './screens/recommendations/Step3.jsx'
import Step4 from './screens/recommendations/Step4.jsx'
import Step5 from './screens/recommendations/Step5.jsx'
import Step6 from './screens/recommendations/Step6.jsx'
import RecommendationsLoading from './screens/recommendations/Loading.jsx'
import RecommendationsResults from './screens/recommendations/Results.jsx'
import { SavedNamesProvider } from './babyNames/SavedNamesContext.jsx'
import { RecommendationProvider } from './babyNames/RecommendationContext.jsx'
import { FamilyInputProvider, useFamilyInput } from './eyeColorPrediction/FamilyInputContext.jsx'
import { AccountProvider, useAccount } from './account/AccountContext.jsx'
import { SidebarMenuProvider } from './components/SidebarMenuContext.jsx'

const HASH_SCREENS = {
  '#eye-welcome': 'eye-welcome',
  '#eye-parents': 'eye-parents',
  '#eye-grandparents': 'eye-grandparents',
  '#eye-greatgrandparents': 'eye-greatgrandparents',
  '#prediction-result': 'prediction-result',
  '#baby-names': 'baby-names',
  '#baby-names-loading': 'baby-names-loading',
  '#baby-names-browse': 'baby-names-browse',
  '#saved-names': 'saved-names',
  '#settings': 'settings',
  '#rec-1': 'rec-1',
  '#rec-2': 'rec-2',
  '#rec-3': 'rec-3',
  '#rec-4': 'rec-4',
  '#rec-5': 'rec-5',
  '#rec-6': 'rec-6',
  '#rec-loading': 'rec-loading',
  '#rec-results': 'rec-results',
}

function AppScreens() {
  const [screen, setScreen] = useState(
    (typeof window !== 'undefined' && HASH_SCREENS[window.location.hash]) || 'create-account'
  )
  const [greeting, setGreeting] = useState('Welcome back')
  const familyInput = useFamilyInput()
  const { fullName: userName, setAccount } = useAccount()

  function navigate(target) {
    setScreen(target)
  }

  function go(target) {
    return (e) => {
      e?.preventDefault?.()
      navigate(target)
    }
  }

  function handleCreated(account) {
    if (account) setAccount(account)
    setGreeting('Welcome')
    navigate('eye-welcome')
  }

  function handleLoggedIn() {
    setGreeting('Welcome back')
    navigate('eye-welcome')
  }

  function handleStartPrediction() {
    familyInput.reset()
    navigate('eye-parents')
  }

  function handlePredict() {
    navigate('prediction-result')
  }

  if (screen === 'eye-welcome') {
    return (
      <EyeColorWelcome onNavigate={navigate} onStartPrediction={handleStartPrediction} userName={userName} greeting={greeting} />
    )
  }
  if (screen === 'eye-parents') return <EyeColorParents onNavigate={navigate} />
  if (screen === 'eye-grandparents') return <EyeColorGrandparents onNavigate={navigate} />
  if (screen === 'eye-greatgrandparents') {
    return <EyeColorGreatGrandparents onNavigate={navigate} onPredict={handlePredict} />
  }
  if (screen === 'prediction-result') {
    // Uses the real family input collected on Parents/Grandparents/Great-
    // grandparents when available; falls back to the sample only when this
    // screen is reached directly (e.g. via #prediction-result) without going
    // through that flow first.
    return (
      <PredictionResult
        familyInput={familyInput.toFamilyInput() ?? SAMPLE_FAMILY_INPUT}
        onStartOver={go('eye-welcome')}
        onGetBabyNames={go('baby-names')}
      />
    )
  }
  if (screen === 'baby-names') {
    return <BabyNamesLanding onNavigate={navigate} />
  }
  if (screen === 'baby-names-loading') {
    return <BabyNamesLoading onNavigate={navigate} />
  }
  if (screen === 'baby-names-browse') {
    return <BabyNames onNavigate={navigate} />
  }
  if (screen === 'saved-names') {
    return <SavedNames onNavigate={navigate} />
  }
  if (screen === 'settings') {
    return <Settings onNavigate={navigate} />
  }
  if (screen === 'rec-1') return <Step1 onNavigate={navigate} />
  if (screen === 'rec-2') return <Step2 onNavigate={navigate} />
  if (screen === 'rec-3') return <Step3 onNavigate={navigate} />
  if (screen === 'rec-4') return <Step4 onNavigate={navigate} />
  if (screen === 'rec-5') return <Step5 onNavigate={navigate} />
  if (screen === 'rec-6') return <Step6 onNavigate={navigate} />
  if (screen === 'rec-loading') return <RecommendationsLoading onNavigate={navigate} />
  if (screen === 'rec-results') return <RecommendationsResults onNavigate={navigate} />
  if (screen === 'login') {
    return (
      <Login
        onNavigateSignup={go('create-account')}
        onNavigateForgotPassword={go('forgot-password')}
        onLoggedIn={handleLoggedIn}
      />
    )
  }
  if (screen === 'forgot-password') {
    return <ForgotPassword onNavigateLogin={go('login')} onSent={go('check-email')} />
  }
  if (screen === 'check-email') {
    return <CheckYourEmail onNavigateLogin={go('login')} onContinueDevPreview={go('reset-password')} />
  }
  if (screen === 'reset-password') {
    return <ResetPassword onReset={go('reset-success')} />
  }
  if (screen === 'reset-success') {
    return <PasswordResetSuccess onNavigateLogin={go('login')} />
  }
  return <CreateAccount onNavigateLogin={go('login')} onCreated={handleCreated} />
}

export default function App() {
  return (
    <AccountProvider>
      <SavedNamesProvider>
        <RecommendationProvider>
          <FamilyInputProvider>
            <SidebarMenuProvider>
              <AppScreens />
            </SidebarMenuProvider>
          </FamilyInputProvider>
        </RecommendationProvider>
      </SavedNamesProvider>
    </AccountProvider>
  )
}
