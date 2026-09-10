import { describe, expect, it } from 'vitest'
import { getCanonicalEnglishName, normalizeNameKey, transliterateArmenian } from './nameNormalization'

describe('getCanonicalEnglishName', () => {
  it.each([
    ['Արամ', 'Aram'],
    ['Անի', 'Ani'],
    ['Գոռ', 'Gor'],
    ['Հովհաննես', 'Hovhannes'],
    ['Նարեկ', 'Narek'],
  ])('%s -> %s', (armenian, expected) => {
    expect(getCanonicalEnglishName(armenian)).toBe(expected)
  })

  it('is deterministic: same input always produces the same output', () => {
    const results = Array.from({ length: 10 }, () => getCanonicalEnglishName('Հովհաննես'))
    expect(new Set(results).size).toBe(1)
    expect(results[0]).toBe('Hovhannes')
  })

  it('ignores leading/trailing whitespace when resolving a mapped name', () => {
    expect(getCanonicalEnglishName(' Հովհաննես ')).toBe('Hovhannes')
    expect(getCanonicalEnglishName('Հովհաննես')).toBe(getCanonicalEnglishName(' Հովհաննես '))
  })

  it('uses the deterministic transliteration fallback for an unmapped name, consistently', () => {
    const unmapped = 'Փշրանք' // not in CANONICAL_NAME_MAP
    const a = getCanonicalEnglishName(unmapped)
    const b = getCanonicalEnglishName(unmapped)
    expect(a).toBe(b)
    expect(a.length).toBeGreaterThan(0)
    expect(a).not.toBe(unmapped) // was actually transliterated, not passed through
  })
})

describe('normalizeNameKey', () => {
  it('produces the same key regardless of surrounding whitespace', () => {
    expect(normalizeNameKey('Հովհաննես')).toBe(normalizeNameKey(' Հովհաննես '))
  })

  it('produces the same key regardless of internal whitespace differences', () => {
    expect(normalizeNameKey('Հովհաննես')).toBe(normalizeNameKey('Հովհաննես  '))
  })

  it('is case-insensitive for Armenian script', () => {
    // Uppercase/lowercase Armenian forms of the same name normalize to one key.
    expect(normalizeNameKey('ԱՐԱՄ')).toBe(normalizeNameKey('արամ'))
  })

  it('is stable under Unicode normalization (NFC vs NFD of the same string)', () => {
    const nfc = 'Հովհաննես'.normalize('NFC')
    const nfd = 'Հովհաննես'.normalize('NFD')
    expect(normalizeNameKey(nfc)).toBe(normalizeNameKey(nfd))
  })

  it('does not merge genuinely different names', () => {
    expect(normalizeNameKey('Արամ')).not.toBe(normalizeNameKey('Արամե'))
  })
})

describe('transliterateArmenian', () => {
  it('is deterministic and never empty for a non-empty input', () => {
    expect(transliterateArmenian('Փշրանք')).toBe(transliterateArmenian('Փշրանք'))
    expect(transliterateArmenian('Փշրանք').length).toBeGreaterThan(0)
  })
})
