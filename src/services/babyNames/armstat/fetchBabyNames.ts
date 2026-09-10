// Orchestrates the ArmStatBank pipeline for one gender: fetch -> parse
// JSON-stat2 -> extract source names -> normalize -> build per-name yearly
// time series. Reusable for both endpoints via the `gender`/`endpoint` config
// instead of duplicating the implementation per gender.

import { fetchArmStatDataset } from './client'
import { parseJsonStat2Dataset } from './jsonStat'
import { getCanonicalEnglishName, normalizeNameKey } from './nameNormalization'
import { ArmStatDataError } from './types'
import type { Gender, NormalizedNameRecord } from './types'

export interface FetchBabyNamesConfig {
  gender: Gender
  endpoint: string
}

/** ArmStatBank's "total births" row is a summary row, not a name — excluded by its distinctive Armenian label rather than assumed to always be index 0. */
function isTotalRow(label: string): boolean {
  return label.includes('Ընդամենը')
}

/**
 * Fetches and normalizes one gender's ArmStatBank dataset into one
 * NormalizedNameRecord per distinct name, each carrying its full historical
 * yearly time series. Real ArmStatBank data only — no mock/static fallback.
 */
export async function fetchBabyNames({ gender, endpoint }: FetchBabyNamesConfig): Promise<NormalizedNameRecord[]> {
  const raw = await fetchArmStatDataset(endpoint)
  const dataset = parseJsonStat2Dataset(raw)

  const nameRows = dataset.names.filter((n) => !isTotalRow(n.label))
  if (nameRows.length === 0) {
    throw new ArmStatDataError(`ArmStatBank dataset for ${gender} contained no name rows after excluding the total row.`)
  }

  const byKey = new Map<string, NormalizedNameRecord>()

  for (const { index, label: originalName } of nameRows) {
    const nameKey = normalizeNameKey(originalName)
    const canonicalName = getCanonicalEnglishName(originalName)

    // ArmStatBank's table has one row per distinct spelling already, but
    // guard against a genuine duplicate row (same exact source spelling
    // appearing twice) by merging into the same record rather than silently
    // dropping or overwriting one.
    const existing = byKey.get(nameKey)
    const record: NormalizedNameRecord = existing ?? {
      nameKey,
      originalName,
      canonicalName,
      gender,
      yearlyData: {},
    }

    for (const year of dataset.years) {
      const value = dataset.getValue(index, year)
      const yearStr = String(year)
      if (record.yearlyData[yearStr] === undefined) {
        record.yearlyData[yearStr] = value
      } else if (value !== null) {
        // Two rows for the same nameKey both have real data for this year —
        // combine rather than silently pick one, since both are genuine counts.
        const prior = record.yearlyData[yearStr]
        record.yearlyData[yearStr] = prior === null ? value : prior + value
      }
    }

    byKey.set(nameKey, record)
  }

  return [...byKey.values()]
}
