import { describe, expect, it } from 'vitest'
import { predictEyeColor } from './index'
import { MODELED_COLORS, type FamilyInput, type FamilyMember, type ModeledColor, type PredictionResult } from './types'

function member(eyeColor: FamilyMember['eyeColor']): FamilyMember {
  return { eyeColor }
}

function baseInput(motherColor: FamilyMember['eyeColor'], fatherColor: FamilyMember['eyeColor']): FamilyInput {
  return { mother: member(motherColor), father: member(fatherColor) }
}

function expectValidDistribution(result: PredictionResult) {
  const colors = Object.keys(result.probabilities)
  expect(colors.sort()).toEqual([...MODELED_COLORS].sort())

  let sum = 0
  for (const color of MODELED_COLORS) {
    const p = result.probabilities[color]
    expect(Number.isFinite(p)).toBe(true)
    expect(p).toBeGreaterThanOrEqual(0)
    expect(p).toBeLessThanOrEqual(1)
    sum += p
  }
  expect(sum).toBeCloseTo(1, 6)

  expect(result.topResults).toHaveLength(3)
  for (const r of result.topResults) {
    expect(MODELED_COLORS).toContain(r.color)
  }
}

describe('predictEyeColor — output contract', () => {
  it('always returns exactly 7 probabilities and 3 topResults with valid numbers', () => {
    expectValidDistribution(predictEyeColor(baseInput('brown', 'blue')))
  })

  it('never contains NaN or Infinity across a range of inputs', () => {
    const inputs: FamilyInput[] = [
      baseInput('brown', 'brown'),
      baseInput('unknown', 'unknown'),
      baseInput('other', 'other'),
      { mother: member('brown'), father: member('blue'), greatGrandparents: [] },
    ]
    for (const input of inputs) expectValidDistribution(predictEyeColor(input))
  })

  it('is deterministic for identical input', () => {
    const input = baseInput('hazel', 'blue')
    const a = predictEyeColor(input)
    const b = predictEyeColor(input)
    expect(a).toEqual(b)
  })

  it('never lets Unknown or Other leak into topResults', () => {
    const result = predictEyeColor(baseInput('unknown', 'other'))
    for (const r of result.topResults) {
      expect(r.color).not.toBe('unknown' as unknown as ModeledColor)
      expect(r.color).not.toBe('other' as unknown as ModeledColor)
    }
  })
})

describe('predictEyeColor — parent scenarios', () => {
  it('1. Brown + Brown parents: brown is the most likely color', () => {
    const result = predictEyeColor(baseInput('brown', 'brown'))
    expectValidDistribution(result)
    expect(result.topResults[0].color).toBe('brown')
  })

  it('2. Blue + Blue parents: blue is the most likely color', () => {
    const result = predictEyeColor(baseInput('blue', 'blue'))
    expectValidDistribution(result)
    expect(result.topResults[0].color).toBe('blue')
  })

  it('3. Brown + Blue parents: produces a valid, non-degenerate distribution', () => {
    const result = predictEyeColor(baseInput('brown', 'blue'))
    expectValidDistribution(result)
    // Distant colors should still get some plausible weight, not be crowded to ~0.
    expect(result.probabilities.brown).toBeGreaterThan(0)
    expect(result.probabilities.blue).toBeGreaterThan(0)
  })

  it('4. Hazel + Blue parents: valid distribution', () => {
    expectValidDistribution(predictEyeColor(baseInput('hazel', 'blue')))
  })

  it('5. Green + Brown parents: valid distribution', () => {
    expectValidDistribution(predictEyeColor(baseInput('green', 'brown')))
  })

  it('6. One Unknown parent still produces a valid result with reduced information', () => {
    const both = predictEyeColor(baseInput('brown', 'brown'))
    const oneUnknown = predictEyeColor(baseInput('brown', 'unknown'))
    expectValidDistribution(oneUnknown)
    expect(oneUnknown.informationScore).toBeLessThan(both.informationScore)
  })

  it('7. Both parents Unknown: broad prior-like distribution with limited confidence', () => {
    const result = predictEyeColor(baseInput('unknown', 'unknown'))
    expectValidDistribution(result)
    expect(result.confidence).toBe('limited')
    expect(result.interpretation).toBe('limited_confidence')
    // No family evidence at all -> falls back to the exact uniform prior.
    for (const color of MODELED_COLORS) {
      expect(result.probabilities[color]).toBeCloseTo(1 / MODELED_COLORS.length, 6)
    }
  })
})

describe('predictEyeColor — grandparents and great-grandparents', () => {
  it('8. Complete grandparents increase informationScore over parents alone', () => {
    const parentsOnly = predictEyeColor(baseInput('brown', 'brown'))
    const withGrandparents = predictEyeColor({
      mother: member('brown'),
      father: member('brown'),
      maternalGrandmother: member('brown'),
      maternalGrandfather: member('brown'),
      paternalGrandmother: member('brown'),
      paternalGrandfather: member('brown'),
    })
    expectValidDistribution(withGrandparents)
    expect(withGrandparents.informationScore).toBeGreaterThan(parentsOnly.informationScore)
  })

  it('9. Complete great-grandparents refine but do not override strong parent evidence', () => {
    const result = predictEyeColor({
      mother: member('brown'),
      father: member('brown'),
      greatGrandparents: Array.from({ length: 8 }, () => member('blue')),
    })
    expectValidDistribution(result)
    // Two strong Brown parents vs. 8 weakly-weighted Blue great-grandparents: Brown should still lead.
    expect(result.topResults[0].color).toBe('brown')
  })

  it('a single great-grandparent never dominates two parents of the opposite color', () => {
    const result = predictEyeColor({
      mother: member('brown'),
      father: member('brown'),
      greatGrandparents: [member('blue')],
    })
    expect(result.topResults[0].color).toBe('brown')
  })

  it('10. All grandparents Unknown are ignored quantitatively (same evidence weight as omitting them)', () => {
    const omitted = predictEyeColor(baseInput('brown', 'brown'))
    const explicitlyUnknown = predictEyeColor({
      mother: member('brown'),
      father: member('brown'),
      maternalGrandmother: member('unknown'),
      maternalGrandfather: member('unknown'),
      paternalGrandmother: member('unknown'),
      paternalGrandfather: member('unknown'),
    })
    expect(explicitlyUnknown.probabilities).toEqual(omitted.probabilities)
  })

  it('11. All great-grandparents Unknown are ignored quantitatively', () => {
    const omitted = predictEyeColor(baseInput('brown', 'brown'))
    const explicitlyUnknown = predictEyeColor({
      mother: member('brown'),
      father: member('brown'),
      greatGrandparents: [member('unknown'), member('unknown')],
    })
    expect(explicitlyUnknown.probabilities).toEqual(omitted.probabilities)
  })
})

describe('predictEyeColor — Other, mixed families, identical families', () => {
  it('12. "Other" values contribute no quantitative evidence', () => {
    const withOther = predictEyeColor({ mother: member('other'), father: member('brown') })
    const withoutMother = predictEyeColor({ mother: member('unknown'), father: member('brown') })
    expect(withOther.probabilities).toEqual(withoutMother.probabilities)
  })

  it('13. Highly mixed family produces a valid, broader distribution rather than an error', () => {
    const result = predictEyeColor({
      mother: member('blue'),
      father: member('blue'),
      maternalGrandmother: member('brown'),
      maternalGrandfather: member('hazel'),
      paternalGrandmother: member('green'),
      paternalGrandfather: member('blue'),
    })
    expectValidDistribution(result)
  })

  it('14. All family members the same color never reaches 100% for one color', () => {
    const result = predictEyeColor({
      mother: member('brown'),
      father: member('brown'),
      maternalGrandmother: member('brown'),
      maternalGrandfather: member('brown'),
      paternalGrandmother: member('brown'),
      paternalGrandfather: member('brown'),
      greatGrandparents: Array.from({ length: 8 }, () => member('brown')),
    })
    expectValidDistribution(result)
    expect(result.probabilities.brown).toBeLessThan(1)
    for (const color of MODELED_COLORS) {
      if (color !== 'brown') expect(result.probabilities[color]).toBeGreaterThan(0)
    }
  })
})

describe('predictEyeColor — tie-breaking, sorting, and non-renormalization', () => {
  it('15. Equal-probability tie case resolves using the fixed tie-break order', () => {
    const result = predictEyeColor(baseInput('unknown', 'unknown'))
    expect(result.topResults.map((r) => r.color)).toEqual(['brown', 'hazel', 'green'])
  })

  it('16. Probabilities always normalize to ~1 across varied inputs', () => {
    const inputs: FamilyInput[] = [
      baseInput('brown', 'brown'),
      baseInput('blue', 'gray'),
      baseInput('unknown', 'brown'),
    ]
    for (const input of inputs) {
      const result = predictEyeColor(input)
      const sum = MODELED_COLORS.reduce((acc, c) => acc + result.probabilities[c], 0)
      expect(sum).toBeCloseTo(1, 6)
    }
  })

  it('17. Top-3 results are sorted by probability descending', () => {
    const result = predictEyeColor(baseInput('brown', 'blue'))
    expect(result.topResults[0].probability).toBeGreaterThanOrEqual(result.topResults[1].probability)
    expect(result.topResults[1].probability).toBeGreaterThanOrEqual(result.topResults[2].probability)
    expect(result.topResults.map((r) => r.rank)).toEqual([1, 2, 3])
  })

  it('18. Top-3 results retain their original (non-renormalized) probabilities', () => {
    const result = predictEyeColor(baseInput('brown', 'brown'))
    for (const r of result.topResults) {
      expect(r.probability).toBeCloseTo(result.probabilities[r.color], 12)
    }
    const top3Sum = result.topResults.reduce((acc, r) => acc + r.probability, 0)
    // The top 3 should not have been rescaled to sum to 1 (unless the other 4 are ~0).
    expect(top3Sum).toBeLessThanOrEqual(1)
  })

  it('19. No NaN/Infinity even for an entirely empty optional-fields input', () => {
    expectValidDistribution(predictEyeColor(baseInput('brown', 'brown')))
  })

  it('20. Deterministic across repeated calls with a complex input', () => {
    const input: FamilyInput = {
      mother: member('hazel'),
      father: member('green'),
      maternalGrandmother: member('blue'),
      maternalGrandfather: member('unknown'),
      paternalGrandmother: member('other'),
      paternalGrandfather: member('amber'),
      greatGrandparents: [member('black'), member('unknown'), member('gray')],
    }
    const first = predictEyeColor(input)
    const second = predictEyeColor(input)
    expect(first).toEqual(second)
  })
})
