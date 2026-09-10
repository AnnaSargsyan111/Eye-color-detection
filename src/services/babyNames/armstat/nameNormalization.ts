// Deterministic Armenian -> English name normalization. No AI, no runtime
// translation service — every name resolves the same way every time, from
// either a curated canonical spelling or a fixed transliteration table.

/**
 * Stable identity key for a source name: Unicode-normalized (NFC), trimmed,
 * internal whitespace collapsed, lowercased using the Armenian locale. Used
 * for merging/dedup/trend matching — never for display.
 */
export function normalizeNameKey(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('hy')
}

/**
 * Canonical English spellings for every name ArmStatBank's male (PS-pp-11-2025)
 * and female (PS-pp-9-2025) "most common newborn names" tables return, keyed
 * by their exact source spelling. Extendable: add an entry here for any name
 * that needs a specific spelling rather than the transliteration fallback.
 */
export const CANONICAL_NAME_MAP: Record<string, string> = {
  // Male (PS-pp-11-2025.px)
  Աբել: 'Abel',
  Ադամ: 'Adam',
  Ալբերտ: 'Albert',
  Ալեն: 'Alen',
  Ալեքս: 'Alex',
  Ալեքսանդր: 'Alexander',
  Անդրանիկ: 'Andranik',
  Աշոտ: 'Ashot',
  Ավետ: 'Avet',
  Արամ: 'Aram',
  Արամե: 'Arame',
  Արեգ: 'Areg',
  Արեն: 'Aren',
  Արթուր: 'Artur',
  Արման: 'Arman',
  Արսեն: 'Arsen',
  Արտակ: 'Artak',
  Արտյոմ: 'Artyom',
  Արմեն: 'Armen',
  Գագիկ: 'Gagik',
  Գարիկ: 'Garik',
  Գոռ: 'Gor',
  Գրիգոր: 'Grigor',
  Գուրգեն: 'Gurgen',
  Գևորգ: 'Gevorg',
  Դանիել: 'Daniel',
  Դավիթ: 'Davit',
  Էդգար: 'Edgar',
  Էդուարդ: 'Eduard',
  Էրիկ: 'Erik',
  Ժորա: 'Zhora',
  Լեո: 'Leo',
  Լևոն: 'Levon',
  Խաչիկ: 'Khachik',
  Կարեն: 'Karen',
  Հակոբ: 'Hakob',
  Համլետ: 'Hamlet',
  Հայկ: 'Hayk',
  Հարություն: 'Harutyun',
  Հենրի: 'Henri',
  Հովիկ: 'Hovik',
  Հովհաննես: 'Hovhannes',
  Մանվել: 'Manvel',
  Մարկ: 'Mark',
  Մարտին: 'Martin',
  Մաքս: 'Max',
  Մերուժան: 'Meruzhan',
  Մենուա: 'Menua',
  Միհրան: 'Mihran',
  Միշա: 'Misha',
  Միսակ: 'Misak',
  Միքայել: 'Mikayel',
  Մխիթար: 'Mkhitar',
  Մհեր: 'Mher',
  Մոնթե: 'Monte',
  Մովսես: 'Movses',
  Մուշեղ: 'Musheg',
  Նարեկ: 'Narek',
  Նորայր: 'Norayr',
  Նոյ: 'Noy',
  Ռազմիկ: 'Razmik',
  Ռաֆիկ: 'Rafik',
  Ռաֆայել: 'Rafael',
  Ռոբերտ: 'Robert',
  Ռոման: 'Roman',
  Ռուբեն: 'Ruben',
  Սամվել: 'Samvel',
  Սարգիս: 'Sargis',
  Սերգեյ: 'Sergey',
  Սուրեն: 'Suren',
  Վահե: 'Vahe',
  Վահան: 'Vahan',
  Վահագն: 'Vahagn',
  Վան: 'Van',
  Վարդան: 'Vardan',
  Վոլոդյա: 'Volodya',
  Տիգրան: 'Tigran',

  // Female (PS-pp-9-2025.px)
  Ադրիանա: 'Adriana',
  Ալլա: 'Alla',
  Ալինա: 'Alina',
  Ալվարդ: 'Alvard',
  Արիանա: 'Ariana',
  Արինա: 'Arina',
  Ամալյա: 'Amalya',
  Ամելի: 'Ameli',
  Անի: 'Ani',
  Աննա: 'Anna',
  Անուշ: 'Anush',
  Անժելա: 'Anzhela',
  Անահիտ: 'Anahit',
  Անգելինա: 'Angelina',
  Աստղիկ: 'Astghik',
  Արմինե: 'Armine',
  Արփի: 'Arpi',
  Արփինե: 'Arpine',
  Արևիկ: 'Arevik',
  Գայանե: 'Gayane',
  Գոհար: 'Gohar',
  Դիանա: 'Diana',
  Եվա: 'Yeva',
  Էլեն: 'Elen',
  Էլինա: 'Elina',
  Էմիլի: 'Emili',
  Էմմա: 'Emma',
  Էվա: 'Eva',
  Թամարա: 'Tamara',
  Իրինա: 'Irina',
  Լաուրա: 'Laura',
  Լիա: 'Lia',
  Լիանա: 'Liana',
  Լիկա: 'Lika',
  Լիլի: 'Lili',
  Լիլիա: 'Lilia',
  Լիլիթ: 'Lilit',
  Լինա: 'Lina',
  Լուիզա: 'Luiza',
  Լուսինե: 'Lusine',
  Լուսե: 'Luse',
  Լուսի: 'Lusi',
  Լյուսի: 'Lyusi',
  Կարինա: 'Karina',
  Կարինե: 'Karine',
  Հասմիկ: 'Hasmik',
  Հռիփսիմե: 'Hripsime',
  Մանե: 'Mane',
  Մալենա: 'Malena',
  Մարգարիտա: 'Margarita',
  Մարի: 'Mari',
  Մարիա: 'Maria',
  Մարիամ: 'Mariam',
  Մարինա: 'Marina',
  Մարինե: 'Marine',
  Մարիաննա: 'Marianna',
  Մերի: 'Meri',
  Մելինե: 'Meline',
  Միլա: 'Mila',
  Միլանա: 'Milana',
  Միլենա: 'Milena',
  Մոնիկա: 'Monika',
  Յանա: 'Yana',
  Նանե: 'Nane',
  Նատալի: 'Natali',
  Նարե: 'Nare',
  Նարինե: 'Narine',
  Նելլի: 'Nelli',
  Շուշան: 'Shushan',
  Ջուլիետա: 'Julieta',
  Ռիտա: 'Rita',
  Ռոզա: 'Roza',
  Ռուզաննա: 'Ruzanna',
  Սառա: 'Sara',
  Սեդա: 'Seda',
  Սյուզի: 'Syuzi',
  Սյուզաննա: 'Syuzanna',
  Սյունե: 'Syune',
  Սոնա: 'Sona',
  Սոֆի: 'Sofi',
  Սոֆյա: 'Sofya',
  Սվետլանա: 'Svetlana',
  Սուսաննա: 'Susanna',
  Վարդուհի: 'Varduhi',
  Վիկտորյա: 'Viktoria',
  Տաթև: 'Tatev',
  Տաթևիկ: 'Tatevik',
  Քնարիկ: 'Knarik',
  Քրիստինե: 'Kristine',
}

/** normalizeNameKey(armenianSpelling) -> canonical English, built once from CANONICAL_NAME_MAP so lookups are whitespace/formatting-robust. */
const CANONICAL_BY_KEY: Map<string, string> = new Map(
  Object.entries(CANONICAL_NAME_MAP).map(([armenian, english]) => [normalizeNameKey(armenian), english])
)

// Deterministic fallback transliteration table (Eastern Armenian, common
// romanization). Only used for a name that isn't in CANONICAL_NAME_MAP —
// every name currently returned by both ArmStatBank endpoints above IS
// mapped, so this only matters if ArmStatBank adds a new name later.
const TRANSLITERATION_TABLE: Record<string, string> = {
  ա: 'a', բ: 'b', գ: 'g', դ: 'd', ե: 'e', զ: 'z', է: 'e', ը: 'y', թ: 't',
  ժ: 'zh', ի: 'i', լ: 'l', խ: 'kh', ծ: 'ts', կ: 'k', հ: 'h', ձ: 'dz', ղ: 'gh',
  ճ: 'ch', մ: 'm', յ: 'y', ն: 'n', շ: 'sh', ո: 'o', չ: 'ch', պ: 'p', ջ: 'j',
  ռ: 'r', ս: 's', վ: 'v', տ: 't', ր: 'r', ց: 'ts', ւ: 'u', փ: 'p', ք: 'k',
  օ: 'o', ֆ: 'f', և: 'ev',
}

/** Deterministic, character-level transliteration fallback — always the same output for the same input, never AI/network-based. */
export function transliterateArmenian(name: string): string {
  const trimmed = name.normalize('NFC').trim().replace(/\s+/g, ' ')
  const letters = Array.from(trimmed).map((ch) => {
    const lower = ch.toLocaleLowerCase('hy')
    const mapped = TRANSLITERATION_TABLE[lower]
    if (mapped === undefined) return ch
    return ch === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1)
  })
  const result = letters.join('')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * Resolves the canonical English spelling for an Armenian source name:
 * CANONICAL_NAME_MAP first (matched via the normalized key, so whitespace/
 * case variants of a mapped name still resolve), else the deterministic
 * transliteration fallback. Same input always produces the same output.
 */
export function getCanonicalEnglishName(originalName: string): string {
  const key = normalizeNameKey(originalName)
  const mapped = CANONICAL_BY_KEY.get(key)
  if (mapped) return mapped
  return transliterateArmenian(originalName)
}
