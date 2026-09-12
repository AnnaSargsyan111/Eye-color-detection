// Public contract for the Baby Names recommendation engine.
// Reuses the sex/source vocabulary already used by the ONS dataset and the
// SavedNamesContext dedup key (`name|sex`) instead of introducing a parallel
// "gender" vocabulary — see RecommendationPreferences.gender for the one
// place the user-facing "girl"/"boy" spelling is translated to it.

export type Sex = 'female' | 'male'
export type Source = 'armstat' | 'ons_england_wales'

/** A single official name/rank/count observation for one source, sex and year. */
export interface BabyNameRecord {
  name: string
  sex: Sex
  source: Source
  year: number
  count: number
  rank: number
}

export type PopularityTier = 'very_popular' | 'popular' | 'less_common' | 'rare' | 'any'
export type StylePreference = 'trending' | 'timeless' | 'distinctive' | 'mixed'
export type LengthPreference = 'short' | 'medium' | 'long' | 'any'
export type AdventurePreference = 'familiar' | 'balanced' | 'unexpected'

export interface RecommendationPreferences {
  source: Source
  /** "girl"/"boy" at the UI boundary; stored internally as female/male to match BabyNameRecord. */
  gender: Sex
  popularity: PopularityTier
  style: StylePreference
  length: LengthPreference
  adventure: AdventurePreference
  /** A single letter, already normalized to the source's script. Absent/undefined = any letter. */
  firstLetter?: string
}

export interface ScoreBreakdown {
  popularityFit: number
  trend: number
  stability: number
  distinctiveness: number
  lengthFit: number
  firstLetterFit: number
}

/** Which soft (relaxable) preferences were dropped/widened to reach enough candidates, in the order they were relaxed. */
export type RelaxableFilter = 'firstLetter' | 'length' | 'popularity'

export interface RecommendationResult {
  name: string
  sex: Sex
  source: Source
  latestYear: number
  latestRank: number
  latestCount: number
  /** Rank by summed count across every year available for this source+gender — what the Step 2 popularity tier is actually filtered/scored against, not just the latest year. */
  historicalRank: number
  score: number
  breakdown: ScoreBreakdown
  explanation: string
}

export interface RecommendationOutcome {
  preferences: RecommendationPreferences
  results: RecommendationResult[]
  /** Soft preferences that had to be widened because too few names matched all of them. Empty when every preference was honored as-is. */
  relaxedFilters: RelaxableFilter[]
  /** True when the source has no usable data at all for this gender (e.g. armstat before real data is integrated) — never render fabricated results in this case. */
  insufficientData: boolean
  latestYear: number | null
}
