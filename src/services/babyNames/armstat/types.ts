// Types for the ArmStatBank integration. Kept separate from the generic
// BabyNameRecord type the recommendation engine already consumes — this
// module produces a richer intermediate shape (armstat/types.ts) which
// toBabyNameRecords.ts then flattens into that existing shape.

/** Minimal, structurally-typed slice of the JSON-stat2 format ArmStatBank returns. Fields beyond what the parser uses are intentionally left untyped rather than guessed. */
export interface JsonStat2Category {
  index: Record<string, number>
  label: Record<string, string>
}

export interface JsonStat2Dimension {
  label: string
  category: JsonStat2Category
}

export interface JsonStat2Response {
  version?: string
  class?: string
  label?: string
  id: string[]
  size: number[]
  role?: { metric?: string[] }
  dimension: Record<string, JsonStat2Dimension>
  value: Array<number | null>
  /** Sparse map of flat value-array index (as string) -> status code, e.g. "..." for suppressed/not-available cells. */
  status?: Record<string, string>
}

/** A parsed, dimension-agnostic view over one JSON-stat2 dataset with exactly one name dimension and one year dimension (after dropping metric dimensions). */
export interface ParsedNameYearDataset {
  years: number[]
  names: Array<{ index: number; label: string }>
  /** Real ArmStatBank count for this name+year, or null when suppressed/not available (never coerced to 0). */
  getValue(nameIndex: number, year: number): number | null
}

export type Gender = 'male' | 'female'

/** One Armenian name's full historical time series, for one gender, with both the source spelling and its resolved canonical English spelling. */
export interface NormalizedNameRecord {
  /** Stable identity for merging/trend/dedup — normalizeNameKey(originalName), never the English spelling. */
  nameKey: string
  /** Exact Armenian spelling as returned by ArmStatBank. Preserved, never overwritten. */
  originalName: string
  /** Deterministically resolved natural English spelling, for UI display only. */
  canonicalName: string
  gender: Gender
  /** Year -> official count, or null when ArmStatBank marks that cell as suppressed/not available. */
  yearlyData: Record<string, number | null>
}

export class ArmStatDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ArmStatDataError'
  }
}
