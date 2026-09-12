// Every threshold and weight the recommendation engine uses lives here, and
// only here — scoring.ts and recommendation.ts read these constants but never
// hardcode a number of their own. Each constant documents where it came from
// (the product spec) or, where the spec left an implementation detail open,
// the reasoning for the chosen value.

import type { AdventurePreference, LengthPreference, PopularityTier, ScoreBreakdown, StylePreference } from './types'

/** Popularity tiers, defined by current-year rank — verbatim from the Step 2 spec. */
export const POPULARITY_TIERS: Record<Exclude<PopularityTier, 'any'>, { min: number; max: number }> = {
  very_popular: { min: 1, max: 10 },
  popular: { min: 11, max: 50 },
  less_common: { min: 51, max: 200 },
  rare: { min: 201, max: Infinity },
}

/** Name length tiers, in Unicode code points — verbatim from the Step 4 spec. */
export const LENGTH_TIERS: Record<Exclude<LengthPreference, 'any'>, { min: number; max: number }> = {
  short: { min: 3, max: 5 },
  medium: { min: 6, max: 7 },
  long: { min: 8, max: Infinity },
}

/**
 * Only the current dataset's highest possible rank (each source stores the
 * official top 100 per sex/year) is used to normalize popularity/trend
 * scores, so the scoring stays correct even if a future source exposes a
 * deeper ranking.
 */
export const ASSUMED_MAX_TRACKED_RANK = 100

/** How many of the most recent years feed trend/stability scoring. */
export const TREND_WINDOW_YEARS = 5

/**
 * Rank assigned, for trend/stability math only, to a year in which a name
 * did not place in the tracked ranking at all. One rank position past the
 * tracked ceiling — "just missed the list" — rather than an arbitrary large
 * number, so a name's absence still contributes a mild, bounded signal
 * instead of dominating the trend calculation.
 */
export const UNRANKED_SENTINEL_RANK = ASSUMED_MAX_TRACKED_RANK + 1

/** Minimum distinct years of real presence in the data before trend/stability are scored from history rather than left neutral. */
export const MIN_YEARS_FOR_HISTORY_SCORING = 2

/** Largest year-over-year rank change (rank positions/year) the trend score normalizes against. Chosen as the full tracked range, so a name moving from the bottom to the top of the tracked ranking in one year maps to the extreme of the trend score. */
export const TREND_SLOPE_CAP = ASSUMED_MAX_TRACKED_RANK

/**
 * Base feature weights (sum to 1) before style/adventure adjustments.
 * `popularityFit` and `firstLetterFit` are deliberately equal and largest —
 * both come from an explicit, required user choice — while trend/stability/
 * distinctiveness (adjusted per style below) and lengthFit fill the rest.
 */
export const BASE_WEIGHTS: ScoreBreakdown = {
  popularityFit: 0.2,
  trend: 0.15,
  stability: 0.15,
  distinctiveness: 0.15,
  lengthFit: 0.15,
  firstLetterFit: 0.2,
}

/**
 * Per-style overrides for the trend/stability/distinctiveness/popularityFit
 * weights (lengthFit and firstLetterFit are left to the base weights/user
 * choice, since "style" per the spec is only about popularity, momentum,
 * consistency and rarity). Each row sums to the same 0.65 as the
 * corresponding base weights it replaces, so the overall total stays 1.
 */
export const STYLE_WEIGHTS: Record<StylePreference, Pick<ScoreBreakdown, 'popularityFit' | 'trend' | 'stability' | 'distinctiveness'>> = {
  trending: { popularityFit: 0.1, trend: 0.4, stability: 0.05, distinctiveness: 0.1 },
  timeless: { popularityFit: 0.2, trend: 0.05, stability: 0.4, distinctiveness: 0.0 },
  distinctive: { popularityFit: 0.05, trend: 0.05, stability: 0.05, distinctiveness: 0.5 },
  mixed: { popularityFit: 0.1625, trend: 0.1625, stability: 0.1625, distinctiveness: 0.1625 },
}

/**
 * Adventure is a scoring preference, not a data attribute (per the Step 5
 * spec): it nudges the popularity/distinctiveness balance the style weights
 * already set, by up to +/-0.1 each, redistributed between the two so the
 * total weight is unchanged.
 */
export const ADVENTURE_ADJUSTMENTS: Record<AdventurePreference, { popularityFit: number; distinctiveness: number }> = {
  familiar: { popularityFit: 0.1, distinctiveness: -0.1 },
  balanced: { popularityFit: 0, distinctiveness: 0 },
  unexpected: { popularityFit: -0.1, distinctiveness: 0.1 },
}

/**
 * Steps 1-6 split into two levels, and nothing here may blur them:
 *
 * - Hard requirements — first letter and name length — are strict
 *   eligibility gates. A name that fails either MUST NOT appear, no matter
 *   how well it fits everything else. They are never relaxed/dropped to pad
 *   out the result count, so RELAXATION_ORDER is intentionally empty.
 * - Soft preferences — popularity, style, adventure — are ranking signals
 *   only (see scoreCandidate in recommendation.ts). They influence which
 *   eligible names are preferred, but can never eliminate a name that passed
 *   the hard requirements, so they never appear in passesFilters either.
 *
 * MIN_RESULTS_BEFORE_RELAXING is kept only as the display cap (top N by
 * score) applied after hard filtering — not a target the engine relaxes
 * anything to reach.
 */
export const MIN_RESULTS_BEFORE_RELAXING = 10
export const RELAXATION_ORDER = [] as const

/**
 * Composes the final, normalized (sums to 1) feature weights for one
 * style + adventure combination. The only place style/adventure preferences
 * turn into numbers — recommendation.ts just asks for the result.
 */
export function computeEffectiveWeights(style: StylePreference, adventure: AdventurePreference): ScoreBreakdown {
  const styled: ScoreBreakdown = { ...BASE_WEIGHTS, ...STYLE_WEIGHTS[style] }
  const adjustment = ADVENTURE_ADJUSTMENTS[adventure]
  const popularityFit = Math.max(0, styled.popularityFit + adjustment.popularityFit)
  const distinctiveness = Math.max(0, styled.distinctiveness + adjustment.distinctiveness)
  const combined: ScoreBreakdown = { ...styled, popularityFit, distinctiveness }
  const total = Object.values(combined).reduce((a, b) => a + b, 0)
  const normalized = {} as ScoreBreakdown
  for (const key of Object.keys(combined) as Array<keyof ScoreBreakdown>) {
    normalized[key] = total === 0 ? 0 : combined[key] / total
  }
  return normalized
}
