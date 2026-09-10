import { phenotypeToDistribution, isModeledColor } from './phenotypeMapping'
import { MODELED_COLORS, type FamilyInput, type FamilyMember, type ModeledColor, type ProbabilityDistribution } from './types'

/**
 * MODEL EVIDENCE WEIGHTS — how strongly each family role influences the
 * combined distribution before priors/smoothing are applied.
 *
 * These are MODEL EVIDENCE WEIGHTS ONLY. They are NOT biological inheritance
 * percentages, NOT probabilities of inheriting a gene, and NOT Mendelian
 * inheritance ratios. They exist purely to say "a parent's observed phenotype
 * should count for more than a great-grandparent's" and are intentionally
 * centralized here so they can be replaced with empirically calibrated values
 * later without touching the rest of the model.
 */
export const EVIDENCE_WEIGHTS = {
  parent: 1.0,
  grandparent: 0.4,
  greatGrandparent: 0.15,
} as const

export interface WeightedObservation {
  distribution: ProbabilityDistribution
  weight: number
}

export interface BranchEvidence {
  /** Weighted-average distribution of this branch's known, modeled members (undefined if none). */
  distribution: ProbabilityDistribution | undefined
  /** Sum of evidence weights contributed by this branch — used to weigh branches against each other. */
  totalWeight: number
  knownCount: number
  unknownCount: number
  otherCount: number
}

function classify(member: FamilyMember | undefined, weight: number): WeightedObservation | 'unknown' | 'other' | 'absent' {
  if (!member) return 'absent'
  if (member.eyeColor === 'unknown') return 'unknown'
  if (member.eyeColor === 'other') return 'other'
  if (isModeledColor(member.eyeColor)) {
    return { distribution: phenotypeToDistribution(member.eyeColor as ModeledColor), weight }
  }
  // Defensive fallback for any unexpected value — treat as missing evidence, never fabricate a color.
  return 'unknown'
}

function combineWeightedObservations(observations: WeightedObservation[]): ProbabilityDistribution | undefined {
  if (observations.length === 0) return undefined
  const sum = {} as Record<ModeledColor, number>
  for (const color of MODELED_COLORS) sum[color] = 0

  for (const obs of observations) {
    for (const color of MODELED_COLORS) {
      sum[color] += obs.distribution[color] * obs.weight
    }
  }

  const totalWeight = observations.reduce((acc, o) => acc + o.weight, 0)
  const distribution = {} as Record<ModeledColor, number>
  for (const color of MODELED_COLORS) distribution[color] = sum[color] / totalWeight
  return distribution
}

function buildBranch(members: Array<{ member: FamilyMember | undefined; weight: number }>): BranchEvidence {
  const observations: WeightedObservation[] = []
  let knownCount = 0
  let unknownCount = 0
  let otherCount = 0

  for (const { member, weight } of members) {
    const classified = classify(member, weight)
    if (classified === 'absent') continue
    if (classified === 'unknown') {
      unknownCount++
      continue
    }
    if (classified === 'other') {
      otherCount++
      continue
    }
    knownCount++
    observations.push(classified)
  }

  const totalWeight = observations.reduce((acc, o) => acc + o.weight, 0)

  return {
    distribution: combineWeightedObservations(observations),
    totalWeight,
    knownCount,
    unknownCount,
    otherCount,
  }
}

export interface FamilyEvidence {
  maternal: BranchEvidence
  paternal: BranchEvidence
  /** Combined distribution across both branches, or undefined if no branch had any known evidence. */
  combinedDistribution: ProbabilityDistribution | undefined
  /** Total evidence weight across both branches — used to weigh evidence against the smoothing prior. */
  totalEvidenceWeight: number
}

/**
 * Builds maternal and paternal branch evidence separately, then combines them.
 * Branches are combined by their own evidence weight so that a branch with
 * more known relatives has proportionally more say — but each branch's total
 * weight is a sum of intentionally small per-relative weights, so a long tail
 * of distant relatives on one side still cannot overpower the other parent.
 */
export function buildFamilyEvidence(input: FamilyInput): FamilyEvidence {
  const greatGrandparents = input.greatGrandparents ?? []
  // Great-grandparents are not tagged maternal/paternal in the input contract;
  // split the provided list evenly between branches so neither side is
  // arbitrarily favored. This keeps the branch separation meaningful even
  // though the current input shape provides one flat list.
  const maternalGGP = greatGrandparents.filter((_, i) => i % 2 === 0)
  const paternalGGP = greatGrandparents.filter((_, i) => i % 2 === 1)

  const maternal = buildBranch([
    { member: input.mother, weight: EVIDENCE_WEIGHTS.parent },
    { member: input.maternalGrandmother, weight: EVIDENCE_WEIGHTS.grandparent },
    { member: input.maternalGrandfather, weight: EVIDENCE_WEIGHTS.grandparent },
    ...maternalGGP.map((m) => ({ member: m, weight: EVIDENCE_WEIGHTS.greatGrandparent })),
  ])

  const paternal = buildBranch([
    { member: input.father, weight: EVIDENCE_WEIGHTS.parent },
    { member: input.paternalGrandmother, weight: EVIDENCE_WEIGHTS.grandparent },
    { member: input.paternalGrandfather, weight: EVIDENCE_WEIGHTS.grandparent },
    ...paternalGGP.map((m) => ({ member: m, weight: EVIDENCE_WEIGHTS.greatGrandparent })),
  ])

  const branchObservations: WeightedObservation[] = []
  if (maternal.distribution) branchObservations.push({ distribution: maternal.distribution, weight: maternal.totalWeight })
  if (paternal.distribution) branchObservations.push({ distribution: paternal.distribution, weight: paternal.totalWeight })

  return {
    maternal,
    paternal,
    combinedDistribution: combineWeightedObservations(branchObservations),
    totalEvidenceWeight: maternal.totalWeight + paternal.totalWeight,
  }
}
