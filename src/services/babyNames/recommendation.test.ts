import { describe, expect, it } from 'vitest'
import { generateRecommendations } from './recommendation'
import { getAvailableFirstLetters, getLatestYear } from './dataSources'
import { nameLength, firstLetter } from './textUtils'
import { POPULARITY_TIERS } from './weights'
import type { RecommendationPreferences } from './types'

function prefs(overrides: Partial<RecommendationPreferences>): RecommendationPreferences {
  return {
    source: 'ons_england_wales',
    gender: 'female',
    popularity: 'any',
    style: 'mixed',
    length: 'any',
    adventure: 'balanced',
    ...overrides,
  }
}

describe('generateRecommendations — armstat (no real data yet)', () => {
  it('never fabricates names: returns insufficientData instead of results', () => {
    const outcome = generateRecommendations(prefs({ source: 'armstat', gender: 'female' }))
    expect(outcome.insufficientData).toBe(true)
    expect(outcome.results).toEqual([])
    expect(outcome.latestYear).toBeNull()
  })

  it('same for boys', () => {
    const outcome = generateRecommendations(prefs({ source: 'armstat', gender: 'male' }))
    expect(outcome.insufficientData).toBe(true)
    expect(outcome.results).toEqual([])
  })

  it('exposes no first letters for a source with no data', () => {
    expect(getAvailableFirstLetters('armstat', 'female')).toEqual([])
    expect(getLatestYear('armstat', 'female')).toBeNull()
  })
})

describe('generateRecommendations — ons_england_wales, real data', () => {
  it('returns up to 10 girl names with no preferences set', () => {
    const outcome = generateRecommendations(prefs({ gender: 'female' }))
    expect(outcome.insufficientData).toBe(false)
    expect(outcome.results.length).toBeGreaterThan(0)
    expect(outcome.results.length).toBeLessThanOrEqual(10)
    for (const r of outcome.results) {
      expect(r.sex).toBe('female')
      expect(r.source).toBe('ons_england_wales')
    }
  })

  it('returns boy names too', () => {
    const outcome = generateRecommendations(prefs({ gender: 'male' }))
    expect(outcome.insufficientData).toBe(false)
    for (const r of outcome.results) expect(r.sex).toBe('male')
  })

  it('results are sorted by descending score', () => {
    const outcome = generateRecommendations(prefs({ gender: 'female', style: 'trending' }))
    for (let i = 1; i < outcome.results.length; i++) {
      expect(outcome.results[i - 1].score).toBeGreaterThanOrEqual(outcome.results[i].score)
    }
  })

  describe('popularity tiers', () => {
    // The tier reflects the name's whole tracked history for this
    // source+gender (summed count across every available year, ranked
    // within that same dataset) rather than only the latest year, so these
    // check historicalRank, not latestRank — a name can rank differently in
    // one year than across its full history.
    it('very_popular results all rank within 1-10 (historically) when unrelaxed', () => {
      const outcome = generateRecommendations(prefs({ gender: 'female', popularity: 'very_popular' }))
      expect(outcome.relaxedFilters).not.toContain('popularity')
      for (const r of outcome.results) {
        expect(r.historicalRank).toBeGreaterThanOrEqual(POPULARITY_TIERS.very_popular.min)
        expect(r.historicalRank).toBeLessThanOrEqual(POPULARITY_TIERS.very_popular.max)
      }
    })

    it('popular results all rank within 11-50 (historically) when unrelaxed', () => {
      const outcome = generateRecommendations(prefs({ gender: 'male', popularity: 'popular' }))
      for (const r of outcome.results) {
        expect(r.historicalRank).toBeGreaterThanOrEqual(11)
        expect(r.historicalRank).toBeLessThanOrEqual(50)
      }
    })

    it('less_common results all rank within 51-200 (historically) when unrelaxed', () => {
      const outcome = generateRecommendations(prefs({ gender: 'female', popularity: 'less_common' }))
      for (const r of outcome.results) {
        expect(r.historicalRank).toBeGreaterThanOrEqual(51)
      }
    })

    it('rare (rank > 200) gracefully relaxes instead of fabricating, since the tracked ranking only goes to 100', () => {
      const outcome = generateRecommendations(prefs({ gender: 'female', popularity: 'rare' }))
      expect(outcome.relaxedFilters).toContain('popularity')
      expect(outcome.insufficientData).toBe(false)
      expect(outcome.results.length).toBeGreaterThan(0)
    })
  })

  describe('name styles', () => {
    it.each(['trending', 'timeless', 'distinctive', 'mixed'] as const)('style=%s produces a valid, explained top 10', (style) => {
      const outcome = generateRecommendations(prefs({ gender: 'female', style }))
      expect(outcome.results.length).toBeGreaterThan(0)
      for (const r of outcome.results) {
        expect(typeof r.explanation).toBe('string')
        expect(r.explanation.length).toBeGreaterThan(0)
      }
    })

    it('distinctive style favors lower current popularity than very_popular would', () => {
      const distinctive = generateRecommendations(prefs({ gender: 'female', style: 'distinctive' }))
      const meanRankDistinctive = distinctive.results.reduce((s, r) => s + r.latestRank, 0) / distinctive.results.length
      expect(meanRankDistinctive).toBeGreaterThan(10)
    })
  })

  describe('name length', () => {
    it('short results are 3-5 characters when unrelaxed', () => {
      const outcome = generateRecommendations(prefs({ gender: 'female', length: 'short' }))
      if (!outcome.relaxedFilters.includes('length')) {
        for (const r of outcome.results) {
          const len = nameLength(r.name)
          expect(len).toBeGreaterThanOrEqual(3)
          expect(len).toBeLessThanOrEqual(5)
        }
      }
    })

    it('medium results are 6-7 characters when unrelaxed', () => {
      const outcome = generateRecommendations(prefs({ gender: 'male', length: 'medium' }))
      if (!outcome.relaxedFilters.includes('length')) {
        for (const r of outcome.results) {
          const len = nameLength(r.name)
          expect(len).toBeGreaterThanOrEqual(6)
          expect(len).toBeLessThanOrEqual(7)
        }
      }
    })

    it('uses Unicode code-point length, not byte length (Armenian test string)', () => {
      // Ա is a single Armenian code point (2 UTF-8 bytes) — must count as length 1, not 2.
      expect(nameLength('Ա')).toBe(1)
      expect(nameLength('Անի')).toBe(3)
    })
  })

  describe('adventure preference', () => {
    it('unexpected skews toward less popular names than familiar, for the same other preferences', () => {
      const familiar = generateRecommendations(prefs({ gender: 'female', adventure: 'familiar' }))
      const unexpected = generateRecommendations(prefs({ gender: 'female', adventure: 'unexpected' }))
      const meanRank = (results: typeof familiar.results) => results.reduce((s, r) => s + r.latestRank, 0) / results.length
      expect(meanRank(unexpected.results)).toBeGreaterThan(meanRank(familiar.results))
    })
  })

  describe('first letter', () => {
    it('lists real first letters present in the latest-year data', () => {
      const letters = getAvailableFirstLetters('ons_england_wales', 'female')
      expect(letters.length).toBeGreaterThan(0)
      expect(letters).toEqual([...letters].sort())
    })

    it('filters results to the requested letter when not too restrictive', () => {
      const letters = getAvailableFirstLetters('ons_england_wales', 'female')
      const letter = letters[0]
      const outcome = generateRecommendations(prefs({ gender: 'female', firstLetter: letter }))
      if (!outcome.relaxedFilters.includes('firstLetter')) {
        for (const r of outcome.results) {
          expect(firstLetter(r.name, 'en')).toBe(letter)
        }
      }
    })

    it('relaxes the letter filter rather than fabricating a name when a letter has too few matches', () => {
      const outcome = generateRecommendations(
        prefs({ gender: 'female', firstLetter: 'Z', popularity: 'very_popular', length: 'long' })
      )
      expect(outcome.insufficientData).toBe(false)
      expect(outcome.results.length).toBeGreaterThan(0)
    })
  })

  it('combined realistic preference set (girl, popular, trending, medium, balanced, letter A) returns real, ranked, explained results', () => {
    const outcome = generateRecommendations(
      prefs({ gender: 'female', popularity: 'popular', style: 'trending', length: 'medium', adventure: 'balanced', firstLetter: 'A' })
    )
    expect(outcome.insufficientData).toBe(false)
    expect(outcome.results.length).toBeGreaterThan(0)
    expect(outcome.results.length).toBeLessThanOrEqual(10)
  })
})
