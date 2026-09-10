import { computeConfidence } from './confidence'
import { buildFamilyEvidence } from './familyEvidence'
import { normalizeDistribution } from './normalize'
import { MODELED_COLORS, type FamilyInput, type PredictionResult, type PredictionStrategy, type ProbabilityDistribution, type TopResult } from './types'

/**
 * MODEL PRIOR — intentionally uniform across all 7 modeled colors.
 *
 * This is a mathematical smoothing prior, not a claim about real-world eye
 * color prevalence in any population. It is population-agnostic by design:
 * the product must not infer or apply any location/ethnicity/language-based
 * prior. If a validated, explicitly-selected population model is added in
 * the future, it must replace this constant deliberately — never inferred
 * automatically from user data.
 */
export const DEFAULT_PRIOR: ProbabilityDistribution = Object.fromEntries(
  MODELED_COLORS.map((color) => [color, 1 / MODELED_COLORS.length])
) as ProbabilityDistribution

/**
 * MODEL PARAMETER — fixed pseudo-weight given to the prior regardless of how
 * much family evidence is available. Acts like Bayesian/Laplace smoothing:
 * it guarantees every color keeps some probability mass (so identical family
 * phenotypes never collapse to 100%), while shrinking to irrelevance as real
 * evidence weight grows. Calibration-ready: tune this single number rather
 * than scattering smoothing logic through the model.
 */
export const PRIOR_PSEUDOCOUNT = 0.5

/**
 * Deterministic tie-break order used only when two colors have exactly equal
 * probability (most commonly when there is no family evidence at all and the
 * result is the uniform prior). Matches the order specified by the product.
 */
const TIE_BREAK_ORDER = ['brown', 'hazel', 'green', 'blue', 'gray', 'amber', 'black'] as const

function blendWithPrior(evidenceDistribution: ProbabilityDistribution | undefined, evidenceWeight: number): ProbabilityDistribution {
  const raw = {} as Record<(typeof MODELED_COLORS)[number], number>
  for (const color of MODELED_COLORS) {
    const evidenceMass = evidenceDistribution ? evidenceDistribution[color] * evidenceWeight : 0
    const priorMass = DEFAULT_PRIOR[color] * PRIOR_PSEUDOCOUNT
    raw[color] = evidenceMass + priorMass
  }
  return normalizeDistribution(raw)
}

function extractTopResults(distribution: ProbabilityDistribution): TopResult[] {
  const sorted = [...MODELED_COLORS].sort((a, b) => {
    const diff = distribution[b] - distribution[a]
    if (Math.abs(diff) > 1e-12) return diff
    return TIE_BREAK_ORDER.indexOf(a) - TIE_BREAK_ORDER.indexOf(b)
  })

  return sorted.slice(0, 3).map((color, index) => ({
    color,
    probability: distribution[color],
    rank: (index + 1) as 1 | 2 | 3,
  }))
}

/**
 * Current (and only) implementation: a phenotype-based probabilistic estimate
 * built from observed family eye colors. This is NOT a genetic/DNA model —
 * see PredictionStrategy for how a future validated DNA strategy could be
 * swapped in without changing callers.
 */
export class PhenotypeFamilyStrategy implements PredictionStrategy {
  predict(input: FamilyInput): PredictionResult {
    const evidence = buildFamilyEvidence(input)
    const finalDistribution = blendWithPrior(evidence.combinedDistribution, evidence.totalEvidenceWeight)
    const topResults = extractTopResults(finalDistribution)
    const { confidence, informationScore, interpretation } = computeConfidence(input, evidence, finalDistribution)

    return {
      probabilities: finalDistribution,
      topResults,
      confidence,
      informationScore,
      interpretation,
    }
  }
}
