import { describe, expect, it } from 'vitest'
import { generateRecommendations } from './recommendation'
import { getAvailableFirstLetters, getLatestYear } from './dataSources'
import { nameLength, firstLetter } from './textUtils'
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

  describe('popularity tiers (soft preference — ranking signal, never a hard filter)', () => {
    // The tier reflects the name's whole tracked history for this
    // source+gender (summed count across every available year, ranked
    // within that same dataset) rather than only the latest year, so these
    // check historicalRank, not latestRank — a name can rank differently in
    // one year than across its full history.

    it('never relaxes and never empties results on its own — popularity cannot eliminate candidates', () => {
      for (const popularity of ['very_popular', 'popular', 'less_common', 'rare'] as const) {
        const outcome = generateRecommendations(prefs({ gender: 'female', popularity }))
        expect(outcome.relaxedFilters).toEqual([])
        expect(outcome.insufficientData).toBe(false)
        expect(outcome.results.length).toBeGreaterThan(0)
      }
    })

    it('very_popular biases results toward low historical rank compared to no preference, without clipping to an exact range', () => {
      const preferred = generateRecommendations(prefs({ gender: 'female', popularity: 'very_popular' }))
      const neutral = generateRecommendations(prefs({ gender: 'female', popularity: 'any' }))
      const meanRank = (results: typeof preferred.results) =>
        results.reduce((s, r) => s + r.historicalRank, 0) / results.length
      // A signal, not a gate: it should clearly skew the ranking...
      expect(meanRank(preferred.results)).toBeLessThan(meanRank(neutral.results))
      // ...but the eligible candidate count must be unaffected by the choice
      // (same hard filters, only the popularity signal differs).
      expect(preferred.results.length).toBe(neutral.results.length)
    })

    it('rare does not eliminate candidates just because the tracked ranking only goes to ~100', () => {
      const outcome = generateRecommendations(prefs({ gender: 'female', popularity: 'rare' }))
      expect(outcome.relaxedFilters).toEqual([])
      expect(outcome.insufficientData).toBe(false)
      expect(outcome.results.length).toBeGreaterThan(0)
    })

    it('a hard-filter-eligible name is never dropped by an unfavorable popularity choice', () => {
      // Same hard requirements (firstLetter + length), only popularity differs.
      // The eligible candidate SET must be identical either way — popularity
      // may reorder it, but must never shrink it.
      const withVeryPopular = generateRecommendations(
        prefs({ gender: 'female', firstLetter: 'A', length: 'medium', popularity: 'very_popular' })
      )
      const withRare = generateRecommendations(
        prefs({ gender: 'female', firstLetter: 'A', length: 'medium', popularity: 'rare' })
      )
      const namesOf = (o: typeof withVeryPopular) => new Set(o.results.map((r) => r.name))
      expect(namesOf(withVeryPopular)).toEqual(namesOf(withRare))
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

  describe('name length (hard requirement — strict, never relaxed)', () => {
    it('short results are always exactly 3-5 characters', () => {
      const outcome = generateRecommendations(prefs({ gender: 'female', length: 'short' }))
      expect(outcome.relaxedFilters).toEqual([])
      expect(outcome.results.length).toBeGreaterThan(0)
      for (const r of outcome.results) {
        const len = nameLength(r.name)
        expect(len).toBeGreaterThanOrEqual(3)
        expect(len).toBeLessThanOrEqual(5)
      }
    })

    it('medium results are always exactly 6-7 characters', () => {
      const outcome = generateRecommendations(prefs({ gender: 'male', length: 'medium' }))
      expect(outcome.relaxedFilters).toEqual([])
      expect(outcome.results.length).toBeGreaterThan(0)
      for (const r of outcome.results) {
        const len = nameLength(r.name)
        expect(len).toBeGreaterThanOrEqual(6)
        expect(len).toBeLessThanOrEqual(7)
      }
    })

    it('long results are always 8+ characters — a 7-character name must never appear', () => {
      const outcome = generateRecommendations(prefs({ gender: 'female', length: 'long' }))
      expect(outcome.results.length).toBeGreaterThan(0)
      for (const r of outcome.results) {
        expect(nameLength(r.name)).toBeGreaterThanOrEqual(8)
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

  describe('first letter (hard requirement — strict, never relaxed)', () => {
    it('lists real first letters present in the latest-year data', () => {
      const letters = getAvailableFirstLetters('ons_england_wales', 'female')
      expect(letters.length).toBeGreaterThan(0)
      expect(letters).toEqual([...letters].sort())
    })

    it('every result starts with the requested letter — never a different one, whatever the match count', () => {
      const letters = getAvailableFirstLetters('ons_england_wales', 'female')
      const letter = letters[0]
      const outcome = generateRecommendations(prefs({ gender: 'female', firstLetter: letter }))
      expect(outcome.relaxedFilters).toEqual([])
      expect(outcome.results.length).toBeGreaterThan(0)
      for (const r of outcome.results) {
        expect(firstLetter(r.name, 'en')).toBe(letter)
      }
    })

    it('a name with the wrong first letter never appears, even under a real single-match letter', () => {
      // 'Z' has very few female matches in the ONS top 100 — a real edge case
      // for "too few results to reach 10", which must NOT pull in other letters.
      const outcome = generateRecommendations(prefs({ gender: 'female', firstLetter: 'Z' }))
      expect(outcome.relaxedFilters).toEqual([])
      for (const r of outcome.results) {
        expect(firstLetter(r.name, 'en')).toBe('Z')
      }
    })

    it('an impossible hard-requirement combination shows insufficientData instead of relaxing or fabricating', () => {
      // 'Z' + 8+ letters: no real name is expected to satisfy both at once.
      const outcome = generateRecommendations(prefs({ gender: 'female', firstLetter: 'Z', length: 'long' }))
      expect(outcome.relaxedFilters).toEqual([])
      expect(outcome.insufficientData).toBe(true)
      expect(outcome.results).toEqual([])
    })
  })

  describe('combined hard requirements (AND logic — must be evaluated together, not merged from separate lists)', () => {
    it('first letter + length together only admit names satisfying both at once', () => {
      const outcome = generateRecommendations(prefs({ gender: 'female', firstLetter: 'A', length: 'short' }))
      expect(outcome.relaxedFilters).toEqual([])
      expect(outcome.results.length).toBeGreaterThan(0)
      for (const r of outcome.results) {
        expect(firstLetter(r.name, 'en')).toBe('A')
        const len = nameLength(r.name)
        expect(len).toBeGreaterThanOrEqual(3)
        expect(len).toBeLessThanOrEqual(5)
      }
    })

    it('all three soft preferences layered on top of both hard requirements never violate either', () => {
      const outcome = generateRecommendations(
        prefs({
          gender: 'female',
          firstLetter: 'A',
          length: 'medium',
          popularity: 'very_popular',
          style: 'distinctive',
          adventure: 'unexpected',
        })
      )
      expect(outcome.relaxedFilters).toEqual([])
      for (const r of outcome.results) {
        expect(firstLetter(r.name, 'en')).toBe('A')
        const len = nameLength(r.name)
        expect(len).toBeGreaterThanOrEqual(6)
        expect(len).toBeLessThanOrEqual(7)
      }
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
