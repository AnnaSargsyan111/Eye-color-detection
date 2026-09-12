// The centralized recommendation service. UI components call
// generateRecommendations(preferences) and render the result — no scoring,
// filtering, or weighting logic belongs in a component.

import { getRecordsForSource } from './dataSources'
import {
  distinctivenessScore,
  firstLetterFitScore,
  lengthFitScore,
  popularityFitScore,
  stabilityScore,
  trendScore,
  type YearRank,
} from './scoring'
import {
  computeEffectiveWeights,
  MIN_RESULTS_BEFORE_RELAXING,
  TREND_WINDOW_YEARS,
  UNRANKED_SENTINEL_RANK,
} from './weights'
import { localeForSource, firstLetter as firstLetterOf } from './textUtils'
import type {
  BabyNameRecord,
  RecommendationOutcome,
  RecommendationPreferences,
  RecommendationResult,
  RelaxableFilter,
  ScoreBreakdown,
} from './types'

interface Candidate {
  name: string
  latest: BabyNameRecord
  window: YearRank[]
  realYearsPresent: number
  /** Rank by summed count across every year available for this source+gender
   * (never just the latest year) — see buildCandidates. */
  historicalRank: number
}

function buildWindow(records: BabyNameRecord[], name: string, latestYear: number): { window: YearRank[]; realYearsPresent: number } {
  const byYear = new Map(records.filter((r) => r.name === name).map((r) => [r.year, r]))
  const window: YearRank[] = []
  let realYearsPresent = 0
  for (let y = latestYear - TREND_WINDOW_YEARS + 1; y <= latestYear; y++) {
    const record = byYear.get(y)
    if (record) {
      window.push({ year: y, rank: record.rank, real: true })
      realYearsPresent++
    } else {
      window.push({ year: y, rank: UNRANKED_SENTINEL_RANK, real: false })
    }
  }
  return { window, realYearsPresent }
}

function buildCandidates(preferences: RecommendationPreferences): { candidates: Candidate[]; latestYear: number } | null {
  // `records` is already scoped to exactly one source+gender — the sole
  // dataset for this location — before any historical/ranking math runs, so
  // that math can never mix in another location's names or totals.
  const records = getRecordsForSource(preferences.source).filter((r) => r.sex === preferences.gender)
  if (records.length === 0) return null

  const latestYear = Math.max(...records.map((r) => r.year))
  const latestRecords = records.filter((r) => r.year === latestYear)

  // "How popular should the name be?" (Step 2) reflects the name's whole
  // tracked history for this source+gender, not just the latest year: sum
  // each name's count across every available year, then rank names against
  // each other by that historical total. Ranked only among latestRecords'
  // own names (the same candidate pool the rest of the pipeline already
  // uses) — a name that dropped out of the tracked ranking entirely by the
  // latest year isn't a candidate anyway, so it shouldn't consume a top-rank
  // slot and squeeze out a name that IS still active. All within this same
  // source+gender dataset, per-location, never merged with another.
  const historicalTotalByName = new Map<string, number>()
  for (const latest of latestRecords) {
    const total = records.filter((r) => r.name === latest.name).reduce((sum, r) => sum + r.count, 0)
    historicalTotalByName.set(latest.name, total)
  }
  const historicalRankByName = new Map<string, number>()
  ;[...historicalTotalByName.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([name], index) => historicalRankByName.set(name, index + 1))

  const candidates = latestRecords.map((latest) => {
    const { window, realYearsPresent } = buildWindow(records, latest.name, latestYear)
    const historicalRank = historicalRankByName.get(latest.name) ?? latest.rank
    return { name: latest.name, latest, window, realYearsPresent, historicalRank }
  })

  return { candidates, latestYear }
}

interface ActiveFilters {
  firstLetter: boolean
  length: boolean
  popularity: boolean
}

/**
 * Hard eligibility gate — first letter and name length ONLY. Both are
 * mandatory-when-selected and never bypassed: a candidate that fails either
 * is excluded outright, full stop. Popularity is deliberately NOT checked
 * here — per the product requirement it's a ranking/scoring signal, never a
 * pass/fail gate that could eliminate an otherwise-eligible name (see
 * scoreCandidate for where it actually applies).
 */
function passesFilters(candidate: Candidate, preferences: RecommendationPreferences, active: ActiveFilters): boolean {
  if (active.firstLetter && preferences.firstLetter) {
    const locale = localeForSource(preferences.source)
    if (firstLetterOf(candidate.name, locale) !== preferences.firstLetter.toLocaleUpperCase(locale)) return false
  }
  if (active.length && preferences.length !== 'any') {
    if (lengthFitScore(candidate.name, preferences.length) < 1) return false
  }
  return true
}

function scoreCandidate(
  candidate: Candidate,
  preferences: RecommendationPreferences,
  active: ActiveFilters,
  weights: ScoreBreakdown
): { result: RecommendationResult; total: number } {
  const breakdown: ScoreBreakdown = {
    popularityFit: popularityFitScore(candidate.historicalRank, active.popularity ? preferences.popularity : 'any'),
    trend: trendScore(candidate.window),
    stability: stabilityScore(candidate.window, candidate.latest.rank),
    distinctiveness: distinctivenessScore(candidate.latest.rank, candidate.realYearsPresent),
    lengthFit: lengthFitScore(candidate.name, active.length ? preferences.length : 'any'),
    firstLetterFit: firstLetterFitScore(candidate.name, active.firstLetter ? preferences.firstLetter : undefined, preferences.source),
  }

  const total =
    breakdown.popularityFit * weights.popularityFit +
    breakdown.trend * weights.trend +
    breakdown.stability * weights.stability +
    breakdown.distinctiveness * weights.distinctiveness +
    breakdown.lengthFit * weights.lengthFit +
    breakdown.firstLetterFit * weights.firstLetterFit

  const sexLabel = preferences.gender === 'female' ? 'girls' : 'boys'
  const explanation = explain(preferences.style, breakdown, candidate.latest.rank, sexLabel, candidate.latest.year)

  return {
    result: {
      name: candidate.name,
      sex: candidate.latest.sex,
      source: candidate.latest.source,
      latestYear: candidate.latest.year,
      latestRank: candidate.latest.rank,
      latestCount: candidate.latest.count,
      historicalRank: candidate.historicalRank,
      score: total,
      breakdown,
      explanation,
    },
    total,
  }
}

function explain(
  style: RecommendationPreferences['style'],
  breakdown: ScoreBreakdown,
  rank: number,
  sexLabel: string,
  year: number
): string {
  const rankLine = `Rank #${rank} for ${sexLabel} in ${year}.`
  const reasonFor = (key: 'trend' | 'stability' | 'distinctiveness') =>
    key === 'trend'
      ? 'Popularity has increased over recent years.'
      : key === 'stability'
        ? 'Popularity has remained consistently strong across recent years.'
        : 'Less common than the most popular names in the latest data.'

  if (style === 'trending') return `${reasonFor('trend')} ${rankLine}`
  if (style === 'timeless') return `${reasonFor('stability')} ${rankLine}`
  if (style === 'distinctive') return `${reasonFor('distinctiveness')} ${rankLine}`

  const strongest = (['trend', 'stability', 'distinctiveness'] as const).reduce((best, key) =>
    breakdown[key] > breakdown[best] ? key : best
  )
  return `${reasonFor(strongest)} ${rankLine}`
}

/**
 * Runs the full pipeline described in the product spec: candidate names for
 * source+gender+latest year -> hard filters (first letter, name length —
 * strict, never relaxed) -> weighted scoring by the soft preferences
 * (popularity, style, adventure) -> top 10 by score. Never invents a name;
 * returns `insufficientData: true` when no candidate passes the hard filters
 * at all (including when the source has no records to begin with).
 */
export function generateRecommendations(preferences: RecommendationPreferences): RecommendationOutcome {
  const built = buildCandidates(preferences)
  if (!built || built.candidates.length === 0) {
    return { preferences, results: [], relaxedFilters: [], insufficientData: true, latestYear: null }
  }
  const { candidates, latestYear } = built

  const active: ActiveFilters = {
    firstLetter: Boolean(preferences.firstLetter),
    length: preferences.length !== 'any',
    popularity: preferences.popularity !== 'any',
  }

  // Hard filtering only — first letter and length, applied together (AND),
  // exactly as selected. Nothing here is ever relaxed/dropped to pad the
  // result count; see RELAXATION_ORDER's doc comment in weights.ts.
  const filtered = candidates.filter((c) => passesFilters(c, preferences, active))
  const relaxedFilters: RelaxableFilter[] = []

  // Adventure (Step 5) is optional — a user who continues without picking
  // one gets the neutral "balanced" weighting rather than a crash.
  const weights = computeEffectiveWeights(preferences.style, preferences.adventure ?? 'balanced')
  const scored = filtered
    .map((c) => scoreCandidate(c, preferences, active, weights))
    .sort((a, b) => b.total - a.total)
    .slice(0, MIN_RESULTS_BEFORE_RELAXING)
    .map((s) => s.result)

  return {
    preferences,
    results: scored,
    relaxedFilters,
    insufficientData: scored.length === 0,
    latestYear,
  }
}
