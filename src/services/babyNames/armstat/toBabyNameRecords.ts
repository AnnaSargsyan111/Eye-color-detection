// Bridges the ArmStatBank-specific NormalizedNameRecord shape into the
// existing BabyNameRecord type the recommendation engine (recommendation.ts,
// dataSources.ts) already consumes — so the trend/scoring pipeline built for
// ONS works unchanged for ArmStat once fed real per-year rows.

import type { BabyNameRecord } from '../types'
import type { NormalizedNameRecord } from './types'

/**
 * Flattens each name's yearly time series into one BabyNameRecord per
 * (name, year) with a real count, skipping years ArmStatBank marked as
 * suppressed/not-available (null) — never fabricated as 0. Rank is not
 * provided by ArmStatBank, so it's assigned per year by sorting real counts
 * descending (the same "no official rank -> sort by count" rule the
 * recommendation spec already establishes for any source without ranks).
 */
export function toBabyNameRecords(records: NormalizedNameRecord[]): BabyNameRecord[] {
  const withoutRank: Array<Omit<BabyNameRecord, 'rank'>> = []

  for (const record of records) {
    for (const [yearStr, count] of Object.entries(record.yearlyData)) {
      if (count === null || count === undefined) continue
      withoutRank.push({
        name: record.canonicalName,
        sex: record.gender,
        source: 'armstat',
        year: Number(yearStr),
        count,
      })
    }
  }

  const byYearSex = new Map<string, Array<Omit<BabyNameRecord, 'rank'>>>()
  for (const row of withoutRank) {
    const key = `${row.year}|${row.sex}`
    const bucket = byYearSex.get(key)
    if (bucket) bucket.push(row)
    else byYearSex.set(key, [row])
  }

  const ranked: BabyNameRecord[] = []
  for (const bucket of byYearSex.values()) {
    bucket.sort((a, b) => b.count - a.count)
    bucket.forEach((row, i) => ranked.push({ ...row, rank: i + 1 }))
  }

  return ranked
}
