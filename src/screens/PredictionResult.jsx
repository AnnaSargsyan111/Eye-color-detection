import { useMemo } from 'react'
import { predictEyeColor } from '../eyeColorPrediction/index.ts'
import EyeColorIcon from '../components/EyeColorIcon.jsx'
import Button from '../components/Button.jsx'

const COLOR_LABEL = {
  brown: 'Brown',
  hazel: 'Hazel',
  green: 'Green',
  blue: 'Blue',
  gray: 'Gray',
  amber: 'Amber',
  black: 'Black',
}

// Demo family input — used only until the real Parents/Grandparents data
// collection flow is wired up in this app. Not a claim about any real family.
export const SAMPLE_FAMILY_INPUT = {
  mother: { eyeColor: 'brown' },
  father: { eyeColor: 'hazel' },
  maternalGrandmother: { eyeColor: 'brown' },
  maternalGrandfather: { eyeColor: 'green' },
  paternalGrandmother: { eyeColor: 'hazel' },
  paternalGrandfather: { eyeColor: 'blue' },
}

export default function PredictionResult({ familyInput = SAMPLE_FAMILY_INPUT, onStartOver, onGetBabyNames }) {
  const prediction = useMemo(() => predictEyeColor(familyInput), [familyInput])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-page p-xl font-sans">
      <div className="flex w-full max-w-[560px] flex-col items-center gap-xl">
        <h1 className="text-center text-h1 font-semibold text-text-primary">
          Your baby's estimated eye colors
        </h1>

        <div className="flex w-full flex-col gap-md rounded-card border border-border-default bg-surface p-lg">
          {prediction.topResults.map((result) => (
            <div key={result.color} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeColorIcon color={result.color} />
                  <span className="text-body font-medium text-text-primary">
                    {COLOR_LABEL[result.color]}
                  </span>
                  {result.rank === 1 && (
                    <span className="rounded-full bg-bg-page px-2 py-0.5 text-caption font-medium text-brand-primary">
                      Most likely
                    </span>
                  )}
                </div>
                <span className="text-body font-semibold text-text-primary">
                  {Math.round(result.probability * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-bg-page">
                <div
                  className="h-2 rounded-full bg-brand-primary"
                  style={{ width: `${Math.round(result.probability * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-caption text-text-secondary">
          This is an educational estimate based on the family eye-color information you provided.
          Eye color is influenced by many genes, and actual outcomes can differ. This result is not
          a genetic or medical prediction.
        </p>

        <div className="flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onStartOver}>
            Start over
          </Button>
          <Button variant="primary" className="flex-1" onClick={onGetBabyNames}>
            Get Baby Names →
          </Button>
        </div>
      </div>
    </div>
  )
}
