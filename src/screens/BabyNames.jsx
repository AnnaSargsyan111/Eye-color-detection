import { useMemo, useState } from 'react'
import TextField from '../components/TextField.jsx'
import Button from '../components/Button.jsx'
import NameRow from '../components/NameRow.jsx'
import AiraSidebar from '../components/AiraSidebar.jsx'
import ConfirmRemoveModal from '../components/ConfirmRemoveModal.jsx'
import { useSavedNames } from '../babyNames/SavedNamesContext.jsx'
import { useRecommendationFlow } from '../babyNames/RecommendationContext.jsx'
import {
  getLatestYear,
  getTopNamesForSource,
  searchNamesForSource,
  SOURCE_ATTRIBUTION,
  SOURCE_LABELS,
} from '../services/babyNames/index.js'

const SEX_LABEL = { male: 'Boy', female: 'Girl' }

// The actual browse/search screen — reached from BabyNamesLanding, which
// owns the Gender + Location choice. Both screens read/write the same
// RecommendationContext preferences, so this screen (and the recommendation
// wizard it links to) always reflects whatever was picked on Landing.
export default function BabyNames({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [pendingRemove, setPendingRemove] = useState(null)
  const { isSaved, saveName, removeName } = useSavedNames()
  const { preferences, startFlow } = useRecommendationFlow()
  const { source, gender } = preferences

  const latestYear = getLatestYear(source, gender)
  const searchResults = useMemo(
    () => (query.trim() ? searchNamesForSource(source, query) : []),
    [query, source]
  )
  const topNames = useMemo(() => getTopNamesForSource(source, gender, 100), [source, gender])

  function toggleSave(record) {
    if (isSaved(record)) {
      setPendingRemove(record)
    } else {
      saveName(record)
    }
  }

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <div className="hidden md:block">
        <AiraSidebar active="baby-names" onNavigate={onNavigate} />
      </div>
      <div className="flex items-center gap-3 border-b border-border-default bg-surface px-base py-md md:hidden">
        <button type="button" onClick={() => onNavigate('baby-names')} aria-label="Back" className="text-lg text-text-secondary">
          ←
        </button>
        <span className="text-label font-semibold text-text-primary">Baby Names</span>
      </div>

      <div className="flex flex-col items-center p-xl md:ml-[76px]">
        <div className="flex w-full max-w-[640px] flex-col gap-xl">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onNavigate('baby-names')}
              className="hidden w-fit text-lg text-text-secondary transition-colors hover:text-text-primary md:block"
              aria-label="Back"
            >
              ←
            </button>
            <h1 className="text-h1 font-semibold text-text-primary">
              {SEX_LABEL[gender]} names in {SOURCE_LABELS[source]}
            </h1>
          </div>

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
                  No name matching "{query}" found in the official {SOURCE_LABELS[source]} data.
                </p>
              ) : (
                searchResults.map((r) => {
                  const record = { name: r.name, sex: r.sex }
                  const isCurrent = r.year === latestYear
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
            <h2 className="text-body font-semibold text-text-primary">
              Top {topNames.length || 100} {SEX_LABEL[gender]} names{latestYear ? ` — ${latestYear}` : ''}
            </h2>

            {topNames.length === 0 ? (
              <div className="rounded-card border border-border-default bg-surface p-lg text-body text-text-secondary">
                We don't have enough {SOURCE_LABELS[source]} data yet for this selection — check back once more data is
                available.
              </div>
            ) : (
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
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-card border border-border-default bg-surface p-lg">
            <div className="flex flex-col gap-1">
              <h2 className="text-body font-semibold text-text-primary">Find names you'll love</h2>
              <p className="text-caption text-text-secondary">Share your preferences and discover names picked for you.</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                // Gender/Location are already shared with the recommendation
                // flow via the same context — this just resets the rest of
                // the wizard's answers to defaults for a fresh run.
                startFlow({ gender, source })
                onNavigate('rec-1')
              }}
            >
              Get recommendations →
            </Button>
          </div>

          <p className="text-center text-caption text-text-secondary">Source: {SOURCE_ATTRIBUTION[source]}.</p>
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
