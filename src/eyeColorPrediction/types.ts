// Public input contract — do not change unless absolutely necessary.

export type EyeColor =
  | 'brown'
  | 'hazel'
  | 'green'
  | 'blue'
  | 'gray'
  | 'amber'
  | 'black'
  | 'other'
  | 'unknown'

/** The 7 colors the engine models and can output. "other"/"unknown" are input-only. */
export type ModeledColor = 'brown' | 'hazel' | 'green' | 'blue' | 'gray' | 'amber' | 'black'

export interface FamilyMember {
  eyeColor: EyeColor
  customEyeColor?: string
}

export interface FamilyInput {
  mother: FamilyMember
  father: FamilyMember
  maternalGrandmother?: FamilyMember
  maternalGrandfather?: FamilyMember
  paternalGrandmother?: FamilyMember
  paternalGrandfather?: FamilyMember
  greatGrandparents?: FamilyMember[]
}

export type Confidence = 'high' | 'moderate' | 'limited'

export type Interpretation = 'most_likely' | 'multiple_possibilities' | 'limited_confidence'

export interface TopResult {
  color: ModeledColor
  probability: number
  rank: 1 | 2 | 3
}

/** Probability distribution over all 7 modeled colors. Always sums to ~1. */
export type ProbabilityDistribution = Record<ModeledColor, number>

export interface PredictionResult {
  probabilities: ProbabilityDistribution
  topResults: TopResult[]
  confidence: Confidence
  informationScore: number
  interpretation: Interpretation
}

/**
 * Strategy abstraction so a future evidence source (e.g. a validated DNA/IrisPlex
 * model) can be swapped in without changing callers. Only a phenotype-based
 * strategy is implemented today — do not implement DNA prediction yet.
 */
export interface PredictionStrategy {
  predict(input: FamilyInput): PredictionResult
}

/** The fixed order of all 7 modeled colors, also used as the deterministic tie-break order. */
export const MODELED_COLORS: readonly ModeledColor[] = [
  'brown',
  'hazel',
  'green',
  'blue',
  'gray',
  'amber',
  'black',
]
