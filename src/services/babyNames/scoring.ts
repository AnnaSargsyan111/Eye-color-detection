// Pure, stateless scoring functions. Every function returns a value in
// [0, 1]; nothing here reads UI state or mutates anything. All thresholds
// come from weights.ts — no magic numbers live in this file.

import {
  ASSUMED_MAX_TRACKED_RANK,
  LENGTH_TIERS,
  MIN_YEARS_FOR_HISTORY_SCORING,
  POPULARITY_TIERS,
  TREND_SLOPE_CAP,
} from './weights'
import type { LengthPreference, PopularityTier, Source } from './types'
import { firstLetter, localeForSource, nameLength } from './textUtils'

export function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0
  return Math.min(1, Math.max(0, x))
}

/** Raw popularity from rank alone: rank 1 -> 1, rank at the tracked ceiling -> ~0. Log-scaled so the gap between rank 1 and 10 matters far more than between 90 and 100. */
export function popularityScore(rank: number): number {
  const r = Math.min(Math.max(rank, 1), ASSUMED_MAX_TRACKED_RANK)
  return clamp01(1 - Math.log(r) / Math.log(ASSUMED_MAX_TRACKED_RANK + 1))
}

/** How well `rank` fits the requested tier: 1 inside the tier, decaying with distance outside it. `'any'` is neutral (1 for every candidate). */
export function popularityFitScore(rank: number, tier: PopularityTier): number {
  if (tier === 'any') return 1
  const { min, max } = POPULARITY_TIERS[tier]
  if (rank >= min && rank <= max) return 1
  const distance = rank < min ? min - rank : rank - (Number.isFinite(max) ? max : rank)
  return clamp01(1 - distance / ASSUMED_MAX_TRACKED_RANK)
}

/** One rank observation per recent year; a year with no real data uses the unranked-sentinel rank (see weights.ts). */
export interface YearRank {
  year: number
  rank: number
  real: boolean
}

function linearRegressionSlope(points: YearRank[]): number {
  const n = points.length
  const meanX = points.reduce((s, p) => s + p.year, 0) / n
  const meanY = points.reduce((s, p) => s + p.rank, 0) / n
  let num = 0
  let den = 0
  for (const p of points) {
    num += (p.year - meanX) * (p.rank - meanY)
    den += (p.year - meanX) ** 2
  }
  return den === 0 ? 0 : num / den
}

/** Multi-year rank trend. Negative slope = rank improving (lower = better) = higher trend score. Neutral when there isn't enough real history to judge a trend. */
export function trendScore(window: YearRank[]): number {
  const realYears = window.filter((p) => p.real).length
  if (window.length < 2 || realYears < MIN_YEARS_FOR_HISTORY_SCORING) return 0.5
  const slope = linearRegressionSlope(window)
  return clamp01((-slope + TREND_SLOPE_CAP) / (2 * TREND_SLOPE_CAP))
}

/** Consistently strong + low rank volatility across recent years. Neutral when there isn't enough real history to judge consistency. */
export function stabilityScore(window: YearRank[], latestRank: number): number {
  const realYears = window.filter((p) => p.real).length
  if (window.length < 2 || realYears < MIN_YEARS_FOR_HISTORY_SCORING) return 0.5
  const mean = window.reduce((s, p) => s + p.rank, 0) / window.length
  const variance = window.reduce((s, p) => s + (p.rank - mean) ** 2, 0) / window.length
  const volatility = clamp01(Math.sqrt(variance) / ASSUMED_MAX_TRACKED_RANK)
  return clamp01(popularityScore(latestRank) * (1 - volatility))
}

/** Lower current popularity + enough historical presence to trust the read. Requires real history — a one-year appearance isn't evidence of being a genuine, evaluable distinctive pick. */
export function distinctivenessScore(latestRank: number, realYearsPresent: number): number {
  const confidence = clamp01(realYearsPresent / MIN_YEARS_FOR_HISTORY_SCORING)
  return clamp01((1 - popularityScore(latestRank)) * confidence)
}

/** `'any'` is neutral (1 for every candidate); otherwise 1 inside the tier, decaying one step per letter outside it. */
export function lengthFitScore(name: string, preference: LengthPreference): number {
  if (preference === 'any') return 1
  const { min, max } = LENGTH_TIERS[preference]
  const len = nameLength(name)
  if (len >= min && len <= max) return 1
  const distance = len < min ? min - len : len - (Number.isFinite(max) ? max : len)
  return clamp01(1 - distance * 0.25)
}

/** Undefined/no selection is neutral (1 for every candidate); otherwise binary match on the name's first letter. */
export function firstLetterFitScore(name: string, letter: string | undefined, source: Source): number {
  if (!letter) return 1
  return firstLetter(name, localeForSource(source)) === letter.toLocaleUpperCase(localeForSource(source)) ? 1 : 0
}
