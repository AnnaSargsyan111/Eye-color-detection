import { MODELED_COLORS, type ProbabilityDistribution } from './types'

/**
 * Normalizes a (possibly unnormalized) distribution over all 7 modeled colors
 * so it sums to ~1, contains no negative values, and never contains NaN or
 * Infinity. Falls back to a uniform distribution if the input is degenerate
 * (e.g. all zero, or corrupted by invalid arithmetic upstream).
 */
export function normalizeDistribution(raw: ProbabilityDistribution): ProbabilityDistribution {
  const clamped = {} as Record<(typeof MODELED_COLORS)[number], number>
  let sum = 0

  for (const color of MODELED_COLORS) {
    const value = raw[color]
    const safe = Number.isFinite(value) && value > 0 ? value : 0
    clamped[color] = safe
    sum += safe
  }

  if (!Number.isFinite(sum) || sum <= 0) {
    const uniform = {} as Record<(typeof MODELED_COLORS)[number], number>
    for (const color of MODELED_COLORS) uniform[color] = 1 / MODELED_COLORS.length
    return uniform
  }

  const normalized = {} as Record<(typeof MODELED_COLORS)[number], number>
  for (const color of MODELED_COLORS) {
    normalized[color] = clamped[color] / sum
  }
  return normalized
}

/** Shannon entropy of a distribution, normalized to [0, 1] (1 = uniform/maximally uncertain, 0 = fully concentrated). */
export function normalizedEntropy(distribution: ProbabilityDistribution): number {
  const n = MODELED_COLORS.length
  let entropy = 0
  for (const color of MODELED_COLORS) {
    const p = distribution[color]
    if (p > 0) entropy -= p * Math.log(p)
  }
  const maxEntropy = Math.log(n)
  if (!Number.isFinite(entropy) || maxEntropy <= 0) return 1
  return Math.min(1, Math.max(0, entropy / maxEntropy))
}
