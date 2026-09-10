import { describe, expect, it, vi } from 'vitest'
import { fetchBabyNames } from './fetchBabyNames'
import { toBabyNameRecords } from './toBabyNameRecords'
import * as client from './client'

function makeFixture() {
  return {
    id: ['ContentsCode', 'Abel', 'years'],
    size: [1, 3, 2],
    role: { metric: ['ContentsCode'] },
    dimension: {
      ContentsCode: { label: 'metric', category: { index: { V: 0 }, label: { V: 'count' } } },
      Abel: {
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
    value: [100, 110, 5, 7, null, 3],
    status: { '4': '...' },
  }
}

describe('fetchBabyNames', () => {
  it('excludes the total-births row and normalizes each real name', async () => {
    vi.spyOn(client, 'fetchArmStatDataset').mockResolvedValueOnce(makeFixture() as never)
    const records = await fetchBabyNames({ gender: 'male', endpoint: 'https://example.test/male' })

    expect(records.map((r) => r.originalName).sort()).toEqual(['Անի', 'Արամ'])
    const aram = records.find((r) => r.originalName === 'Արամ')!
    expect(aram.canonicalName).toBe('Aram')
    expect(aram.gender).toBe('male')
    expect(aram.yearlyData).toEqual({ '2020': 5, '2021': 7 })

    const ani = records.find((r) => r.originalName === 'Անի')!
    // Suppressed cell stays null, never coerced to 0.
    expect(ani.yearlyData['2020']).toBeNull()
    expect(ani.yearlyData['2021']).toBe(3)
  })

  it('assigns a stable nameKey independent of whitespace', async () => {
    vi.spyOn(client, 'fetchArmStatDataset').mockResolvedValueOnce(makeFixture() as never)
    const records = await fetchBabyNames({ gender: 'male', endpoint: 'https://example.test/male' })
    const aram = records.find((r) => r.originalName === 'Արամ')!
    expect(aram.nameKey).toBe('արամ')
  })
})

describe('toBabyNameRecords', () => {
  it('flattens yearly data into one row per (name, year) with a real count, skipping nulls', () => {
    const rows = toBabyNameRecords([
      { nameKey: 'արամ', originalName: 'Արամ', canonicalName: 'Aram', gender: 'male', yearlyData: { '2020': 5, '2021': 7 } },
      { nameKey: 'անի', originalName: 'Անի', canonicalName: 'Ani', gender: 'female', yearlyData: { '2020': null, '2021': 3 } },
    ])
    expect(rows).toHaveLength(3) // Aram x2 years + Ani x1 (2020 null skipped)
    expect(rows.find((r) => r.name === 'Ani' && r.year === 2020)).toBeUndefined()
  })

  it('assigns rank per year+sex by descending count, never a fabricated rank', () => {
    const rows = toBabyNameRecords([
      { nameKey: 'a', originalName: 'Ա', canonicalName: 'A', gender: 'male', yearlyData: { '2020': 100 } },
      { nameKey: 'b', originalName: 'Բ', canonicalName: 'B', gender: 'male', yearlyData: { '2020': 300 } },
      { nameKey: 'c', originalName: 'Գ', canonicalName: 'C', gender: 'male', yearlyData: { '2020': 200 } },
    ])
    const byName = Object.fromEntries(rows.map((r) => [r.name, r.rank]))
    expect(byName).toEqual({ B: 1, C: 2, A: 3 })
  })

  it('keeps male and female records with the same canonical name in separate rank pools (never merged)', () => {
    const rows = toBabyNameRecords([
      { nameKey: 'x', originalName: 'Խ', canonicalName: 'Sam', gender: 'male', yearlyData: { '2020': 10 } },
      { nameKey: 'y', originalName: 'Ս', canonicalName: 'Sam', gender: 'female', yearlyData: { '2020': 50 } },
    ])
    const male = rows.find((r) => r.sex === 'male')!
    const female = rows.find((r) => r.sex === 'female')!
    expect(male.rank).toBe(1) // only male-2020 name -> rank 1 within its own pool
    expect(female.rank).toBe(1) // only female-2020 name -> rank 1 within its own pool
    expect(male.source).toBe('armstat')
    expect(female.source).toBe('armstat')
  })
})
