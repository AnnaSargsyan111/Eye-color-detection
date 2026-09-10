import { PhenotypeFamilyStrategy } from './predictionModel'
import type { FamilyInput, PredictionResult } from './types'

export * from './types'
export { EVIDENCE_WEIGHTS } from './familyEvidence'
export { LATENT_AXIS_POSITION, PHENOTYPE_SPREAD } from './phenotypeMapping'
export { DEFAULT_PRIOR, PRIOR_PSEUDOCOUNT, PhenotypeFamilyStrategy } from './predictionModel'

const defaultStrategy = new PhenotypeFamilyStrategy()

/**
 * Predicts a baby's possible eye color distribution from observed family
 * phenotypes. Educational estimate only — not a genetic or medical
 * prediction. See PhenotypeFamilyStrategy / PredictionStrategy for the
 * underlying model and how it could be swapped for a different strategy.
 */
export function predictEyeColor(input: FamilyInput): PredictionResult {
  return defaultStrategy.predict(input)
}
