import { useMemo, useState } from 'react'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'
import NameRow from '../components/NameRow.jsx'
import AiraSidebar from '../components/AiraSidebar.jsx'
import ConfirmRemoveModal from '../components/ConfirmRemoveModal.jsx'
import { useSavedNames } from '../babyNames/SavedNamesContext.jsx'
import { useRecommendationFlow } from '../babyNames/RecommendationContext.jsx'
import { LATEST_YEAR, SOURCE_ATTRIBUTION, YEARS, getTopNames, searchNames } from '../babyNames/index.js'

const SEX_LABEL = { male: 'Boy', female: 'Girl' }

export default function BabyNames({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [sex, setSex] = useState('female')
  const [pendingRemove, setPendingRemove] = useState(null)
  const { isSaved, saveName, removeName } = useSavedNames()
  const { startFlow } = useRecommendationFlow()

  const searchResults = useMemo(() => (query.trim() ? searchNames(query) : []), [query])
  const topNames = useMemo(() => getTopNames(sex, LATEST_YEAR, 100), [sex])

  function toggleSave(record) {
    if (isSaved(record)) {
      setPendingRemove(record)
    } else {
      saveName(record)
    }
  }

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <AiraSidebar active="baby-names" onNavigate={onNavigate} />

      <div className="ml-[76px] flex flex-col items-center p-xl">
        <div className="flex w-full max-w-[640px] flex-col gap-xl">
          <h1 className="text-h1 font-semibold text-text-primary">Baby Names</h1>

          <TextField
            label="Search a name"
            placeholder="e.g. Olivia"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query.trim() && (
            <div className="flex flex-col gap-1 rounded-card border border-border-default bg-surface p-lg">
              {searchResults.length === 0 ? (
                <p className="text-body text-text-secondary">
                  No name matching "{query}" found in the official ONS top 100 for {YEARS[0]}–{LATEST_YEAR}.
                </p>
              ) : (
                searchResults.map((r) => {
                  const record = { name: r.name, sex: r.sex }
                  const isCurrent = r.year === LATEST_YEAR
                  return (
                    <NameRow
                      key={`${r.name}-${r.sex}`}
                      name={`${r.name} · ${SEX_LABEL[r.sex]}`}
                      meta={isCurrent ? `Rank #${r.rank} in ${r.year}` : `Rank #${r.rank} in ${r.year} (not current)`}
                      saved={isSaved(record)}
                      onToggleSave={() => toggleSave(record)}
                    />
                  )
                })
              )}
            </div>
          )}

          <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <h2 className="text-body font-semibold text-text-primary">
                Top 100 {SEX_LABEL[sex]} names — {LATEST_YEAR}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={sex === 'female' ? 'primary' : 'secondary'}
                  className="!px-base !py-1.5 !text-caption"
                  onClick={() => setSex('female')}
                >
                  Girls
                </Button>
                <Button
                  variant={sex === 'male' ? 'primary' : 'secondary'}
                  className="!px-base !py-1.5 !text-caption"
                  onClick={() => setSex('male')}
                >
                  Boys
                </Button>
              </div>
            </div>

            <div className="flex max-h-[480px] flex-col gap-1 overflow-y-auto rounded-card border border-border-default bg-surface p-lg">
              {topNames.map((r) => {
                const record = { name: r.name, sex: r.sex }
                return (
                  <NameRow
                    key={r.name}
                    rank={r.rank}
                    name={r.name}
                    meta={r.count.toLocaleString()}
                    saved={isSaved(record)}
                    onToggleSave={() => toggleSave(record)}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-card border border-border-default bg-surface p-lg">
            <div className="flex flex-col gap-1">
              <h2 className="text-body font-semibold text-text-primary">Find names you'll love</h2>
              <p className="text-caption text-text-secondary">Share your preferences and discover names picked for you.</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                // Carries the gender already chosen here into Step 1; Location
                // defaults there since this screen doesn't have its own selector.
                startFlow({ gender: sex })
                onNavigate('rec-1')
              }}
            >
              Get recommendations →
            </Button>
          </div>

          <p className="text-center text-caption text-text-secondary">
            Source: {SOURCE_ATTRIBUTION.source}, {SOURCE_ATTRIBUTION.licence}.
          </p>
        </div>
      </div>

      <ConfirmRemoveModal
        open={!!pendingRemove}
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          removeName(pendingRemove)
          setPendingRemove(null)
        }}
      />
    </div>
  )
}
