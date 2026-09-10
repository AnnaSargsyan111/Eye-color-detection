// One-off data extraction script — NOT shipped to the app bundle.
//
// Parses the official ONS "Baby names in England and Wales" spreadsheets
// (Open Government Licence v3.0) into a flat JSON dataset consumed by the
// Baby Names feature. The app itself never parses XLSX — only this script does,
// against files downloaded directly from ons.gov.uk.
//
// To re-run when ONS publishes a new year:
//   1. npm install --save-dev xlsx   (not a permanent dependency — see README note)
//   2. Download the relevant ONS files into DIR below
//   3. node scripts/build-baby-names-data.mjs
//   4. npm uninstall xlsx
import XLSX from 'xlsx'
import fs from 'node:fs'
import path from 'node:path'

const DIR = 'C:/Users/annas/AppData/Local/Temp/claude/C--Users-annas-OneDrive-Desktop-komp/5bfc1a7d-d71c-484d-89d8-e0c8e46efd11/scratchpad/ons'
const OUT_FILE = path.join(import.meta.dirname, '..', 'src', 'babyNames', 'data', 'babyNamesONS.json')

const MIN_YEAR = 2000
const MAX_WIDE_YEAR = 2021 // last year covered by the consolidated 1996-2021 file
const records = []

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

// --- 1. Consolidated 1996-2021 file: one row per name, wide columns per year ---
function parseWideFile() {
  const wb = XLSX.readFile(path.join(DIR, '1996to2021.xlsx'))
  const sheetsBySex = { male: '1', female: '2' }

  for (const [sex, sheetName] of Object.entries(sheetsBySex)) {
    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' })
    const header = rows[7] // ["Name", "2021 Rank", "2021 Count", "2020 Rank", ...]

    // Map each year to its [rankCol, countCol] indices.
    const yearColumns = new Map()
    for (let col = 1; col < header.length; col += 2) {
      const label = String(header[col] || '')
      const match = label.match(/^(\d{4}) Rank$/)
      if (match) yearColumns.set(Number(match[1]), col)
    }

    for (const row of rows.slice(8)) {
      const name = row[0]
      if (!name || typeof name !== 'string') continue

      for (const [year, rankCol] of yearColumns) {
        if (year < MIN_YEAR || year > MAX_WIDE_YEAR) continue
        const rank = toNumber(row[rankCol])
        const count = toNumber(row[rankCol + 1])
        if (rank === null || rank > 100) continue // keep top 100 only
        records.push({ name, sex, year, rank, count })
      }
    }
  }
}

// --- 2. Individual per-year files (2022+): Table_1 = England & Wales top 100 ---
function parseYearFile(file, sex, year) {
  const wb = XLSX.readFile(path.join(DIR, file))
  const ws = wb.Sheets['Table_1']
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: '' })
  // Header row is "Rank, Name, Count, Change in Rank Since ..., Change in Rank Since ..."
  const headerIdx = rows.findIndex((r) => r[0] === 'Rank' || r[0] === 'Rank in England')
  if (headerIdx === -1) throw new Error(`Could not find header row in ${file}`)

  for (const row of rows.slice(headerIdx + 1)) {
    const rank = toNumber(row[0])
    const name = row[1]
    const count = toNumber(row[2])
    if (rank === null || !name) continue
    records.push({ name, sex, year, rank, count })
  }
}

parseWideFile()
;[2022, 2023, 2024, 2025].forEach((year) => {
  parseYearFile(`boys${year}.xlsx`, 'male', year)
  parseYearFile(`girls${year}.xlsx`, 'female', year)
})

records.sort((a, b) => b.year - a.year || (a.sex === b.sex ? a.rank - b.rank : a.sex.localeCompare(b.sex)))

const years = [...new Set(records.map((r) => r.year))].sort((a, b) => a - b)
const output = {
  source: 'Office for National Statistics — Baby names in England and Wales',
  licence: 'Open Government Licence v3.0',
  retrievedFrom: 'https://www.ons.gov.uk/peoplepopulationandcommunity/birthsdeathsandmarriages/livebirths',
  years,
  recordCount: records.length,
  records,
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, JSON.stringify(output))

console.log(`Wrote ${records.length} records covering years ${years[0]}-${years[years.length - 1]} to ${OUT_FILE}`)
console.log('Sample:', records.slice(0, 3))
