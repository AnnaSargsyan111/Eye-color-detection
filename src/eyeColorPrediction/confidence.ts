import { EVIDENCE_WEIGHTS, type FamilyEvidence } from './familyEvidence'
import { normalizedEntropy } from './normalize'
import type { Confidence, FamilyInput, Interpretation, ProbabilityDistribution } from './types'

/**
 * MODEL PARAMETERS — how informationScore and distribution concentration are
 * blended into a single confidence score, and the thresholds used to bucket
 * that score into high/moderate/limited. These are heuristic starting points
 * for a calibration-ready design, not statistically derived cutoffs.
 */
const CONFIDENCE_PARAMETERS = {
  informationWeight: 0.6,
  concentrationWeight: 0.4,
  highThreshold: 0.66,
  moderateThreshold: 0.4,
}

/**
 * informationScore reflects how complete the provided family information is —
 * NOT how "scientifically accurate" the result is. It compares the evidence
 * weight actually gathered (parents count more than grandparents, who count
 * more than great-grandparents — see EVIDENCE_WEIGHTS) against the maximum
 * weight that *could* have been gathered given how many family slots were
 * provided. "Other" and "unknown" entries contribute zero, matching how they
 * are treated in the prediction itself.
 */
export function computeInformationScore(input: FamilyInput, evidence: FamilyEvidence): number {
  const greatGrandparentSlots = input.greatGrandparents?.length ?? 0

  const maxWeight =
    2 * EVIDENCE_WEIGHTS.parent + 4 * EVIDENCE_WEIGHTS.grandparent + greatGrandparentSlots * EVIDENCE_WEIGHTS.greatGrandparent

  if (maxWeight <= 0) return 0

  const knownWeight = evidence.totalEvidenceWeight
  return Math.min(1, Math.max(0, knownWeight / maxWeight))
}

function bucketConfidence(score: number): Confidence {
  if (score >= CONFIDENCE_PARAMETERS.highThreshold) return 'high'
  if (score >= CONFIDENCE_PARAMETERS.moderateThreshold) return 'moderate'
  return 'limited'
}

function interpretationFor(confidence: Confidence): Interpretation {
  switch (confidence) {
    case 'high':
      return 'most_likely'
    case 'moderate':
      return 'multiple_possibilities'
    case 'limited':
      return 'limited_confidence'
  }
}

export interface ConfidenceResult {
  confidence: Confidence
  informationScore: number
  interpretation: Interpretation
}

/**
 * Confidence is deliberately separate from probability: a distribution can
 * have one high-probability color while confidence is still low, if the
 * family information behind it is sparse. It combines how much information
 * was provided (informationScore) with how concentrated the resulting
 * distribution is (via normalized entropy) — a family with lots of known,
 * consistent relatives yields both high information and a concentrated
 * distribution; a family with little data yields a broad, low-information
 * result even if one color happens to edge out the others.
 */
export function computeConfidence(
  input: FamilyInput,
  evidence: FamilyEvidence,
  finalDistribution: ProbabilityDistribution
): ConfidenceResult {
  const informationScore = computeInformationScore(input, evidence)
  const concentration = 1 - normalizedEntropy(finalDistribution)

  const score =
    CONFIDENCE_PARAMETERS.informationWeight * informationScore +
    CONFIDENCE_PARAMETERS.concentrationWeight * concentration

  const confidence = bucketConfidence(score)
  return { confidence, informationScore, interpretation: interpretationFor(confidence) }
}
