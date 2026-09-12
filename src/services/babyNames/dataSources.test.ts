import { describe, expect, it } from 'vitest'
import { getRecordsForSource, getTopNamesForSource, searchNamesForSource } from './dataSources'

describe('getTopNamesForSource — whole-history ranking', () => {
  it('ranks by count summed across every available year, not just the latest year', () => {
    const sex = 'female'
    const records = getRecordsForSource('ons_england_wales').filter((r) => r.sex === sex)
    const latestYear = Math.max(...records.map((r) => r.year))
    const top = getTopNamesForSource('ons_england_wales', sex, 100)
    expect(top.length).toBeGreaterThan(0)

    for (const r of top) {
      const expectedTotal = records.filter((rec) => rec.name === r.name).reduce((sum, rec) => sum + rec.count, 0)
      expect(r.count).toBe(expectedTotal)
      expect(r.year).toBe(latestYear)
    }
  })

  it('is sorted by historical total, descending, with contiguous ranks starting at 1', () => {
    const top = getTopNamesForSource('ons_england_wales', 'male', 100)
    for (let i = 0; i < top.length; i++) {
      expect(top[i].rank).toBe(i + 1)
      if (i > 0) expect(top[i - 1].count).toBeGreaterThanOrEqual(top[i].count)
    }
  })

  it('only ranks names still present in the latest year — a name that dropped out entirely never occupies a slot', () => {
    const sex = 'female'
    const records = getRecordsForSource('ons_england_wales').filter((r) => r.sex === sex)
    const latestYear = Math.max(...records.map((r) => r.year))
    const latestNames = new Set(records.filter((r) => r.year === latestYear).map((r) => r.name))
    const top = getTopNamesForSource('ons_england_wales', sex, 100)
    for (const r of top) {
      expect(latestNames.has(r.name)).toBe(true)
    }
  })

  it('respects the limit', () => {
    const top = getTopNamesForSource('ons_england_wales', 'female', 5)
    expect(top.length).toBeLessThanOrEqual(5)
  })

  it('never mixes ArmStat/Armenia data into an ONS/International result, or vice versa', () => {
    const ons = getTopNamesForSource('ons_england_wales', 'female', 100)
    for (const r of ons) expect(r.source).toBe('ons_england_wales')
    // Armenia may be empty in this test environment (real network fetch not
    // awaited here) — either way, nothing from it should leak into ONS results.
    const armstat = getTopNamesForSource('armstat', 'female', 100)
    for (const r of armstat) expect(r.source).toBe('armstat')
  })
})

describe('searchNamesForSource — built on the same whole-history ranking', () => {
  it('returns results with historical (summed) counts and ranks matching getTopNamesForSource', () => {
    const top = getTopNamesForSource('ons_england_wales', 'female', 100)
    const known = top[0]
    const results = searchNamesForSource('ons_england_wales', 'female', known.name)
    expect(results.length).toBeGreaterThan(0)
    const match = results.find((r) => r.name === known.name)
    expect(match).toBeDefined()
    expect(match?.count).toBe(known.count)
    expect(match?.rank).toBe(known.rank)
  })

  it('never returns a name from the other sex or the other source', () => {
    const results = searchNamesForSource('ons_england_wales', 'male', 'a')
    for (const r of results) {
      expect(r.sex).toBe('male')
      expect(r.source).toBe('ons_england_wales')
    }
  })
})
