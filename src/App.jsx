import { useState } from 'react'
import CreateAccount from './screens/CreateAccount.jsx'
import Login from './screens/Login.jsx'
import ForgotPassword from './screens/ForgotPassword.jsx'
import PredictionResult from './screens/PredictionResult.jsx'
import BabyNames from './screens/BabyNames.jsx'
import SavedNames from './screens/SavedNames.jsx'
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

const HASH_SCREENS = {
  '#prediction-result': 'prediction-result',
  '#baby-names': 'baby-names',
  '#saved-names': 'saved-names',
  '#rec-1': 'rec-1',
  '#rec-2': 'rec-2',
  '#rec-3': 'rec-3',
  '#rec-4': 'rec-4',
  '#rec-5': 'rec-5',
  '#rec-6': 'rec-6',
  '#rec-loading': 'rec-loading',
  '#rec-results': 'rec-results',
}

// Screens not yet built in this app (e.g. Settings) — sidebar navigation to
// them is intentionally a no-op rather than falling through to an unrelated screen.
const UNIMPLEMENTED_SCREENS = new Set(['settings'])

function AppScreens() {
  const [screen, setScreen] = useState(
    (typeof window !== 'undefined' && HASH_SCREENS[window.location.hash]) || 'create-account'
  )

  function navigate(target) {
    if (UNIMPLEMENTED_SCREENS.has(target)) return
    setScreen(target)
  }

  function go(target) {
    return (e) => {
      e?.preventDefault?.()
      navigate(target)
    }
  }

  // Reachable directly via #prediction-result until the Parents/Grandparents
  // data-collection flow is built in this app — see SAMPLE_FAMILY_INPUT.
  if (screen === 'prediction-result') {
    return <PredictionResult onStartOver={go('create-account')} onGetBabyNames={go('baby-names')} />
  }
  if (screen === 'baby-names') {
    return <BabyNames onNavigate={navigate} />
  }
  if (screen === 'saved-names') {
    return <SavedNames onNavigate={navigate} />
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
    return <Login onNavigateSignup={go('create-account')} onNavigateForgotPassword={go('forgot-password')} />
  }
  if (screen === 'forgot-password') {
    return <ForgotPassword onNavigateLogin={go('login')} />
  }
  return <CreateAccount onNavigateLogin={go('login')} />
}

export default function App() {
  return (
    <SavedNamesProvider>
      <RecommendationProvider>
        <AppScreens />
      </RecommendationProvider>
    </SavedNamesProvider>
  )
}
