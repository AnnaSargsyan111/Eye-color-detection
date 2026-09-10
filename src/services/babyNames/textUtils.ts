// Unicode-aware helpers. `Array.from` (not `.length`/charCodeAt) so combining
// marks and surrogate-pair characters count as one visible character each —
// required for correctly handling Armenian script once that data is added.

/** Number of Unicode code points in the name (never a UTF-8 byte length). */
export function nameLength(name: string): number {
  return Array.from(name.trim()).length
}

/** The first Unicode code point of the name, locale-uppercased. */
export function firstLetter(name: string, locale?: string): string {
  const trimmed = name.trim()
  const first = Array.from(trimmed)[0] ?? ''
  return locale ? first.toLocaleUpperCase(locale) : first.toLocaleUpperCase()
}

/** Locale used for case-folding and alphabetical sorting, per data source. */
export function localeForSource(source: 'armstat' | 'ons_england_wales'): string {
  return source === 'armstat' ? 'hy' : 'en'
}

/** Distinct first letters actually present in `names`, sorted for that source's locale. */
export function distinctFirstLetters(names: string[], source: 'armstat' | 'ons_england_wales'): string[] {
  const locale = localeForSource(source)
  const letters = new Set(names.map((n) => firstLetter(n, locale)))
  return [...letters].sort((a, b) => a.localeCompare(b, locale))
}
