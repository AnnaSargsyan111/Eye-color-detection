// Generic, dimension-name-agnostic JSON-stat2 parser. Deliberately does not
// hardcode ArmStatBank's dimension keys ("Abel" for male names, "names" for
// female names, "years") — the male and female endpoints use different keys
// for the same concept, so the year/name dimensions are identified by shape
// (role.metric for the metric dimension, all-4-digit labels for the year
// dimension) rather than by name.

import { ArmStatDataError } from './types'
import type { JsonStat2Response, ParsedNameYearDataset } from './types'

function isYearLabel(label: string): boolean {
  return /^\d{4}$/.test(label.trim())
}

function categoryEntries(dim: { category: { index: Record<string, number>; label: Record<string, string> } }) {
  return Object.entries(dim.category.index).map(([key, index]) => ({
    index,
    label: dim.category.label[key] ?? key,
  }))
}

/**
 * Parses a raw JSON-stat2 response into a dimension-agnostic {years, names, getValue}
 * view. Throws ArmStatDataError for any structural problem instead of silently
 * producing a partially-wrong dataset.
 */
export function parseJsonStat2Dataset(raw: unknown): ParsedNameYearDataset {
  if (!raw || typeof raw !== 'object') {
    throw new ArmStatDataError('Empty or non-object JSON-stat2 response.')
  }
  const data = raw as Partial<JsonStat2Response>

  if (!Array.isArray(data.id) || data.id.length === 0) {
    throw new ArmStatDataError('JSON-stat2 response is missing a valid "id" dimension list.')
  }
  if (!Array.isArray(data.size) || data.size.length !== data.id.length) {
    throw new ArmStatDataError('JSON-stat2 "size" does not match "id" length.')
  }
  if (!data.dimension || typeof data.dimension !== 'object') {
    throw new ArmStatDataError('JSON-stat2 response is missing "dimension".')
  }
  if (!Array.isArray(data.value)) {
    throw new ArmStatDataError('JSON-stat2 response is missing a "value" array.')
  }

  const expectedLength = data.size.reduce((a, b) => a * b, 1)
  if (data.value.length !== expectedLength) {
    throw new ArmStatDataError(
      `JSON-stat2 "value" length (${data.value.length}) does not match the product of "size" (${expectedLength}).`
    )
  }

  const metricKeys = new Set(data.role?.metric ?? [])
  const candidateKeys = data.id.filter((key) => !metricKeys.has(key))

  let yearDimKey: string | undefined
  let nameDimKey: string | undefined
  for (const key of candidateKeys) {
    const dim = data.dimension[key]
    if (!dim) throw new ArmStatDataError(`JSON-stat2 "dimension" is missing an entry for id "${key}".`)
    const entries = categoryEntries(dim)
    if (entries.length === 0) throw new ArmStatDataError(`Dimension "${key}" has no categories.`)
    if (entries.every((e) => isYearLabel(e.label))) {
      if (yearDimKey) throw new ArmStatDataError('Found more than one dimension that looks like a year dimension.')
      yearDimKey = key
    } else {
      if (nameDimKey) throw new ArmStatDataError('Found more than one non-year, non-metric dimension; cannot determine the name dimension unambiguously.')
      nameDimKey = key
    }
  }
  if (!yearDimKey) throw new ArmStatDataError('Could not identify a year dimension (expected a dimension whose category labels are all 4-digit years).')
  if (!nameDimKey) throw new ArmStatDataError('Could not identify a name dimension.')

  const yearEntries = categoryEntries(data.dimension[yearDimKey]).sort((a, b) => a.index - b.index)
  const nameEntries = categoryEntries(data.dimension[nameDimKey]).sort((a, b) => a.index - b.index)
  const years = yearEntries.map((e) => Number(e.label))

  // Row-major strides, computed generically from `id`/`size` order rather than
  // assuming a fixed 3-dimension layout.
  const strides: number[] = new Array(data.id.length)
  let acc = 1
  for (let i = data.id.length - 1; i >= 0; i--) {
    strides[i] = acc
    acc *= data.size[i]
  }
  const nameDimPos = data.id.indexOf(nameDimKey)
  const yearDimPos = data.id.indexOf(yearDimKey)
  const nameStride = strides[nameDimPos]
  const yearStride = strides[yearDimPos]

  const value = data.value
  const status = data.status ?? {}

  function getValue(nameIndex: number, year: number): number | null {
    const yearIndex = years.indexOf(year)
    if (yearIndex === -1) throw new ArmStatDataError(`Year ${year} is not present in this dataset.`)
    const flatIndex = nameIndex * nameStride + yearIndex * yearStride
    if (flatIndex < 0 || flatIndex >= value.length) {
      throw new ArmStatDataError(`Computed value index ${flatIndex} is out of range.`)
    }
    if (status[String(flatIndex)] !== undefined) return null
    const v = value[flatIndex]
    return v === null || v === undefined ? null : v
  }

  return {
    years,
    names: nameEntries,
    getValue,
  }
}
