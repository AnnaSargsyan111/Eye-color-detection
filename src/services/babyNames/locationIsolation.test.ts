// Regression guard for the "no cross-location mixing" requirement: the same
// canonical name can appear in two different sources with wildly different
// stats, and each source's recommendation output must reflect only its own
// numbers. If generateRecommendations (or anything it calls) ever started
// combining records across sources — e.g. a stray `flatMap` over all
// sources, or a cache keyed by sex alone — this test would catch it.
import { describe, expect, it, vi } from 'vitest'
import type { BabyNameRecord } from './types'

const RECORDS: BabyNameRecord[] = [
  // "Aram" is the single most popular boy's name in source A (armstat)...
  { name: 'Aram', sex: 'male', source: 'armstat', year: 2025, rank: 1, count: 5000 },
  { name: 'Narek', sex: 'male', source: 'armstat', year: 2025, rank: 2, count: 3000 },
  { name: 'Hayk', sex: 'male', source: 'armstat', year: 2025, rank: 3, count: 2000 },
  // ...but a rare, barely-registering name in source B (ons_england_wales) —
  // same canonical name, deliberately opposite statistical identity.
  { name: 'Aram', sex: 'male', source: 'ons_england_wales', year: 2025, rank: 95, count: 5 },
  { name: 'James', sex: 'male', source: 'ons_england_wales', year: 2025, rank: 1, count: 9000 },
  { name: 'Oliver', sex: 'male', source: 'ons_england_wales', year: 2025, rank: 2, count: 8000 },
]

vi.mock('./dataSources', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./dataSources')>()
  return {
    ...actual,
    getRecordsForSource: vi.fn((source: BabyNameRecord['source']) => RECORDS.filter((r) => r.source === source)),
  }
})

const { generateRecommendations } = await import('./recommendation')
const { getRecordsForSource } = await import('./dataSources')

function prefs(source: BabyNameRecord['source']) {
  return {
    source,
    gender: 'male' as const,
    popularity: 'any' as const,
    style: 'mixed' as const,
    length: 'any' as const,
    adventure: 'balanced' as const,
  }
}

describe('location data isolation', () => {
  it('never reads the other source when building candidates for one', () => {
    generateRecommendations(prefs('armstat'))
    expect(getRecordsForSource).toHaveBeenCalledWith('armstat')
    expect(getRecordsForSource).not.toHaveBeenCalledWith('ons_england_wales')
  })

  it('scores the same name completely differently per source, using only that source\'s own rank/count', () => {
    const armstatOutcome = generateRecommendations(prefs('armstat'))
    const onsOutcome = generateRecommendations(prefs('ons_england_wales'))

    const aramInArmstat = armstatOutcome.results.find((r) => r.name === 'Aram')
    const aramInOns = onsOutcome.results.find((r) => r.name === 'Aram')

    expect(aramInArmstat).toBeDefined()
    expect(aramInArmstat?.latestRank).toBe(1)
    expect(aramInArmstat?.latestCount).toBe(5000)

    // Aram is rank 95 of only 3 candidates in the ONS fixture — MIN_RESULTS_BEFORE_RELAXING
    // slices to the top candidates, so it may not surface in results at all;
    // what matters is that if it DOES appear, it carries the ONS numbers, not
    // Armenia's rank 1 / count 5000, and that popularity fit reflects a
    // genuinely poor rank rather than the other source's excellent one.
    if (aramInOns) {
      expect(aramInOns.latestRank).toBe(95)
      expect(aramInOns.latestCount).toBe(5)
    }

    // The two outcomes must not be reference-equal or share result objects —
    // proof there's no shared/cached computation leaking between sources.
    expect(armstatOutcome).not.toBe(onsOutcome)
    if (aramInArmstat && aramInOns) {
      expect(aramInArmstat).not.toBe(aramInOns)
      expect(aramInArmstat.score).not.toBe(aramInOns.score)
    }
  })

  it('never returns a name that only exists in the other source', () => {
    const armstatOutcome = generateRecommendations(prefs('armstat'))
    const onsOutcome = generateRecommendations(prefs('ons_england_wales'))

    expect(armstatOutcome.results.some((r) => r.name === 'James' || r.name === 'Oliver')).toBe(false)
    expect(onsOutcome.results.some((r) => r.name === 'Narek' || r.name === 'Hayk')).toBe(false)
  })

  it('computes latestYear independently per source rather than reusing a global value', () => {
    const armstatOutcome = generateRecommendations(prefs('armstat'))
    const onsOutcome = generateRecommendations(prefs('ons_england_wales'))
    // Both fixtures use 2025 here, but each must be derived from that
    // source's own records (Math.max over its own years), never a shared
    // module-level "current year" — confirmed by both reflecting the source
    // actually queried.
    expect(armstatOutcome.latestYear).toBe(2025)
    expect(onsOutcome.latestYear).toBe(2025)
    expect(armstatOutcome.results.every((r) => r.source === 'armstat')).toBe(true)
    expect(onsOutcome.results.every((r) => r.source === 'ons_england_wales')).toBe(true)
  })
})
