import dataset from './data/babyNamesONS.json'

export const SOURCE_ATTRIBUTION = {
  source: dataset.source,
  licence: dataset.licence,
  retrievedFrom: dataset.retrievedFrom,
}

export const YEARS = dataset.years // ascending, e.g. [2000, ..., 2025]
export const LATEST_YEAR = YEARS[YEARS.length - 1]

/** Top N names (by rank) for a sex/year. Defaults to the latest available year. */
export function getTopNames(sex, year = LATEST_YEAR, limit = 100) {
  return dataset.records
    .filter((r) => r.sex === sex && r.year === year && r.rank <= limit)
    .sort((a, b) => a.rank - b.rank)
}

/** All historical records for one exact name (case-insensitive), newest year first. */
export function getNameHistory(name) {
  const needle = name.trim().toLowerCase()
  if (!needle) return []
  return dataset.records
    .filter((r) => r.name.toLowerCase() === needle)
    .sort((a, b) => b.year - a.year)
}

/**
 * Searches for names containing the query (case-insensitive). Returns one
 * entry per matching name+sex, using each match's most recent year of data.
 */
export function searchNames(query, limit = 20) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []

  const latestByNameSex = new Map()
  for (const r of dataset.records) {
    if (!r.name.toLowerCase().includes(needle)) continue
    const key = `${r.name}|${r.sex}`
    const existing = latestByNameSex.get(key)
    if (!existing || r.year > existing.year) latestByNameSex.set(key, r)
  }

  return [...latestByNameSex.values()]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
}
