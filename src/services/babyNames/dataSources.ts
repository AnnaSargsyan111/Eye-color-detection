import onsDataset from '../../babyNames/data/babyNamesONS.json'
import type { BabyNameRecord, Sex, Source } from './types'
import { distinctFirstLetters } from './textUtils'
import { fetchBabyNames } from './armstat/fetchBabyNames'
import { toBabyNameRecords } from './armstat/toBabyNameRecords'

const ARMSTAT_MALE_ENDPOINT =
  'https://statbank.armstat.am/api/v1/hy/ArmStatBank/2%20Population%20and%20social%20processes/28%20Population/PS-pp-11-2025.px'
const ARMSTAT_FEMALE_ENDPOINT =
  'https://statbank.armstat.am/api/v1/hy/ArmStatBank/2%20Population%20and%20social%20processes/28%20Population/PS-pp-9-2025.px'

// The recommendation engine never fabricates data: until ensureArmStatLoaded()
// has resolved, this stays empty and the engine/UI surface an honest "not
// enough data yet" state — never fake names. Populated from the real
// ArmStatBank API (see armstat/fetchBabyNames.ts), not a bundled file.
let armstatRecords: BabyNameRecord[] = []
let armstatLoadPromise: Promise<void> | null = null

/**
 * Fetches and normalizes both real ArmStatBank endpoints (male + female) and
 * populates the synchronous armstat record cache the rest of this module
 * reads from. Safe to call multiple times — the underlying HTTP layer
 * (armstat/client.ts) caches each endpoint, and this function itself only
 * runs once concurrently.
 */
export function ensureArmStatLoaded(): Promise<void> {
  if (!armstatLoadPromise) {
    armstatLoadPromise = Promise.all([
      fetchBabyNames({ gender: 'male', endpoint: ARMSTAT_MALE_ENDPOINT }),
      fetchBabyNames({ gender: 'female', endpoint: ARMSTAT_FEMALE_ENDPOINT }),
    ])
      .then(([male, female]) => {
        armstatRecords = toBabyNameRecords([...male, ...female])
      })
      .catch((err) => {
        // Leave armstatRecords empty (honest "not enough data" state) and let
        // a future call retry, rather than caching a failed load forever.
        armstatLoadPromise = null
        throw err
      })
  }
  return armstatLoadPromise
}

let onsRecordsCache: BabyNameRecord[] | null = null

function getOnsRecords(): BabyNameRecord[] {
  if (!onsRecordsCache) {
    onsRecordsCache = (onsDataset.records as Array<{ name: string; sex: Sex; year: number; rank: number; count: number }>).map(
      (r) => ({ ...r, source: 'ons_england_wales' as const })
    )
  }
  return onsRecordsCache
}

/** All real, officially-sourced records for one data source. Never mock/fabricated. Armenia is empty until ensureArmStatLoaded() resolves. */
export function getRecordsForSource(source: Source): BabyNameRecord[] {
  return source === 'ons_england_wales' ? getOnsRecords() : armstatRecords
}

/** The most recent year with data for source+sex, or null if there is none. */
export function getLatestYear(source: Source, sex: Sex): number | null {
  const years = getRecordsForSource(source)
    .filter((r) => r.sex === sex)
    .map((r) => r.year)
  return years.length ? Math.max(...years) : null
}

/** Every first letter actually present among source+sex names, for the Step 6 letter picker. Empty when the source has no data. */
export function getAvailableFirstLetters(source: Source, sex: Sex): string[] {
  const latestYear = getLatestYear(source, sex)
  if (latestYear == null) return []
  const names = getRecordsForSource(source)
    .filter((r) => r.sex === sex && r.year === latestYear)
    .map((r) => r.name)
  return distinctFirstLetters(names, source)
}

export const SOURCE_LABELS: Record<Source, string> = {
  armstat: 'Armenia',
  ons_england_wales: 'International',
}

export const SOURCE_ATTRIBUTION: Record<Source, string> = {
  armstat: 'Statistical Committee of the Republic of Armenia (ArmStat)',
  ons_england_wales: 'Office for National Statistics — Baby names in England and Wales, Open Government Licence v3.0',
}

/**
 * Top N names for source+sex, ranked by count summed across every year
 * available for this source+sex (never just the latest year) — mirrors the
 * recommendation engine's historicalRank so "Explore names" and "Get
 * recommendations" agree on what "popular" means for the same location.
 * Ranked only among names still present in the latest year (the same
 * candidate pool the rest of the app already treats as "currently
 * tracked"), so a name that vanished from the rankings entirely doesn't
 * occupy a top-N slot ahead of one that's still active. Entirely within this
 * one source+sex — never merged with another location. Empty when the
 * source has no data yet.
 */
export function getTopNamesForSource(source: Source, sex: Sex, limit = 100): BabyNameRecord[] {
  const latestYear = getLatestYear(source, sex)
  if (latestYear == null) return []

  const records = getRecordsForSource(source).filter((r) => r.sex === sex)
  const latestNames = new Set(records.filter((r) => r.year === latestYear).map((r) => r.name))

  const historicalTotalByName = new Map<string, number>()
  for (const r of records) {
    if (!latestNames.has(r.name)) continue
    historicalTotalByName.set(r.name, (historicalTotalByName.get(r.name) ?? 0) + r.count)
  }

  return [...historicalTotalByName.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, total], index) => ({
      name,
      sex,
      source,
      year: latestYear,
      rank: index + 1,
      count: total,
    }))
}

/**
 * Searches by substring within one source, scoped to a single sex's top-N
 * list (the same list getTopNamesForSource returns, now ranked by historical
 * total) — never mixes in the other sex's names, and never reaches past that
 * list into lower-ranked names.
 */
export function searchNamesForSource(source: Source, sex: Sex, query: string, topLimit = 100): BabyNameRecord[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return getTopNamesForSource(source, sex, topLimit).filter((r) => r.name.toLowerCase().includes(needle))
}
