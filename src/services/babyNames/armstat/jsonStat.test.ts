import { describe, expect, it } from 'vitest'
import { parseJsonStat2Dataset } from './jsonStat'
import { ArmStatDataError } from './types'

// Synthetic fixtures mirroring the real ArmStatBank shape (1 metric dim,
// 1 name dim, 1 year dim, row-major value array with the year dim fastest) —
// deliberately not fetched over the network so these tests stay fast and
// offline, per the "deterministic, offline-capable" normalization goal.
function makeFixture(nameDimKey: string) {
  return {
    id: ['ContentsCode', nameDimKey, 'years'],
    size: [1, 3, 2],
    role: { metric: ['ContentsCode'] },
    dimension: {
      ContentsCode: { label: 'metric', category: { index: { V: 0 }, label: { V: 'count' } } },
      [nameDimKey]: {
        label: 'names',
        category: {
          index: { '0': 0, '1': 1, '2': 2 },
          label: { '0': 'Ընդամենը ծնվածներ', '1': 'Արամ', '2': 'Անի' },
        },
      },
      years: {
        label: 'years',
        category: { index: { '0': 0, '1': 1 }, label: { '0': '2020', '1': '2021' } },
      },
    },
    // [total2020, total2021, aram2020, aram2021, ani2020, ani2021]
    value: [100, 110, 5, 7, null, 3],
    status: { '4': '...' },
  }
}

describe('parseJsonStat2Dataset', () => {
  it('parses years and names without assuming a fixed dimension key name (male-style key "Abel")', () => {
    const parsed = parseJsonStat2Dataset(makeFixture('Abel'))
    expect(parsed.years).toEqual([2020, 2021])
    expect(parsed.names.map((n) => n.label)).toEqual(['Ընդամենը ծնվածներ', 'Արամ', 'Անի'])
  })

  it('parses the same shape correctly under a different dimension key (female-style key "names")', () => {
    const parsed = parseJsonStat2Dataset(makeFixture('names'))
    expect(parsed.years).toEqual([2020, 2021])
    expect(parsed.getValue(1, 2020)).toBe(5)
  })

  it('reads real counts via getValue at the correct row-major offset', () => {
    const parsed = parseJsonStat2Dataset(makeFixture('Abel'))
    expect(parsed.getValue(0, 2020)).toBe(100)
    expect(parsed.getValue(0, 2021)).toBe(110)
    expect(parsed.getValue(1, 2020)).toBe(5)
    expect(parsed.getValue(1, 2021)).toBe(7)
    expect(parsed.getValue(2, 2021)).toBe(3)
  })

  it('returns null (not 0) for a cell ArmStatBank marks as suppressed via `status`, distinct from a real value', () => {
    const parsed = parseJsonStat2Dataset(makeFixture('Abel'))
    expect(parsed.getValue(2, 2020)).toBeNull()
  })

  it('throws for a year not present in the dataset rather than returning a guessed value', () => {
    const parsed = parseJsonStat2Dataset(makeFixture('Abel'))
    expect(() => parsed.getValue(0, 1999)).toThrow(ArmStatDataError)
  })

  it('throws on a missing "id"', () => {
    const fixture = makeFixture('Abel') as Record<string, unknown>
    delete fixture.id
    expect(() => parseJsonStat2Dataset(fixture)).toThrow(ArmStatDataError)
  })

  it('throws when "value" length does not match the product of "size"', () => {
    const fixture = makeFixture('Abel')
    fixture.value = [1, 2, 3] // wrong length for size [1,3,2] = 6
    expect(() => parseJsonStat2Dataset(fixture)).toThrow(ArmStatDataError)
  })

  it('throws when no dimension looks like a year dimension', () => {
    const fixture = makeFixture('Abel')
    fixture.dimension.years.category.label = { '0': 'not-a-year', '1': 'also-not' }
    expect(() => parseJsonStat2Dataset(fixture)).toThrow(ArmStatDataError)
  })

  it('throws on a completely empty/non-object response', () => {
    expect(() => parseJsonStat2Dataset(null)).toThrow(ArmStatDataError)
    expect(() => parseJsonStat2Dataset(undefined)).toThrow(ArmStatDataError)
    expect(() => parseJsonStat2Dataset({})).toThrow(ArmStatDataError)
  })
})
