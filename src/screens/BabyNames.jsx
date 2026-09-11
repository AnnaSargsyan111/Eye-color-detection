import { useEffect, useMemo, useState } from 'react'
import Button from '../components/Button.jsx'
import NameRow from '../components/NameRow.jsx'
import AiraSidebar from '../components/AiraSidebar.jsx'
import MobileTopBar from '../components/MobileTopBar.jsx'
import ViewAllModal from '../components/ViewAllModal.jsx'
import { useSavedNames } from '../babyNames/SavedNamesContext.jsx'
import { useRecommendationFlow } from '../babyNames/RecommendationContext.jsx'
import { getTopNamesForSource, searchNamesForSource, SOURCE_LABELS } from '../services/babyNames/index.js'

const SEX_LABEL = { male: 'Boy', female: 'Girl' }
const SEARCH_PLACEHOLDER = { male: 'e.g. Boris', female: 'e.g. Anna' }
const VISIBLE_COUNT = 10

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// Column labels for the shared NameRow layout (rank / name / count / save)
// used by both the top-names table and the search-results list below.
function NamesTableHeader() {
  return (
    <div className="flex items-center justify-between gap-3 px-base pb-1">
      <div className="flex items-center gap-3">
        <span className="w-10 text-caption font-semibold text-text-secondary/70">Rank</span>
        <span className="text-caption font-semibold text-text-secondary/70">Name</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-caption font-semibold text-text-secondary/70">Births</span>
        <span className="w-5" aria-hidden="true" />
      </div>
    </div>
  )
}

// The actual browse/search screen — reached from BabyNamesLanding, which
// owns the Gender + Location choice. Both screens read/write the same
// RecommendationContext preferences, so this screen (and the recommendation
// wizard it links to) always reflects whatever was picked on Landing.
export default function BabyNames({ onNavigate }) {
  const [query, setQuery] = useState('')
  const [showAllTop, setShowAllTop] = useState(false)
  const { isSaved, saveName, removeName } = useSavedNames()
  const { preferences, startFlow } = useRecommendationFlow()
  const { source, gender } = preferences

  // Reachable via a direct hash link without ever visiting Landing, where
  // Gender/Location are chosen — bounce back there rather than rendering
  // with nothing selected.
  useEffect(() => {
    if (!source || !gender) onNavigate('baby-names')
  }, [source, gender, onNavigate])

  const searchResults = useMemo(
    () => (query.trim() ? searchNamesForSource(source, gender, query) : []),
    [query, source, gender]
  )
  const topNames = useMemo(() => getTopNamesForSource(source, gender, 100), [source, gender])

  // No confirmation here — the heart just toggles saved state immediately;
  // this table never loses a row either way. Removing is only a "are you
  // sure" moment on the Saved Names page itself, where it's the only copy.
  function toggleSave(record) {
    if (isSaved(record)) {
      removeName(record)
    } else {
      saveName(record)
    }
  }

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <AiraSidebar active="baby-names" onNavigate={onNavigate} />
      <MobileTopBar title="Baby Names" onBack={() => onNavigate('baby-names')} />

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

          <div className="flex flex-col gap-1.5">
            <span className="text-label font-medium text-text-primary">Search a name</span>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-4 text-text-secondary">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder={SEARCH_PLACEHOLDER[gender]}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-button border border-border-default bg-surface py-md pl-10 pr-base text-body text-text-primary placeholder:text-text-secondary outline-none transition-colors focus:border-[1.5px] focus:border-border-focus"
              />
            </div>
          </div>

          {query.trim() && (
            <div className="flex flex-col gap-1 rounded-card border border-border-default bg-surface p-lg">
              {searchResults.length === 0 ? (
                <p className="text-body text-text-secondary">
                  No {SEX_LABEL[gender].toLowerCase()} name matching "{query}" found in the top {SEX_LABEL[gender].toLowerCase()}{' '}
                  names for {SOURCE_LABELS[source]}.
                </p>
              ) : (
                <>
                  <NamesTableHeader />
                  {searchResults.map((r) => {
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
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-md">
            <h2 className="text-body font-semibold text-text-primary">
              Top {Math.min(VISIBLE_COUNT, topNames.length) || VISIBLE_COUNT} {SEX_LABEL[gender]} names
            </h2>

            {topNames.length === 0 ? (
              <div className="rounded-card border border-border-default bg-surface p-lg text-body text-text-secondary">
                We don't have enough {SOURCE_LABELS[source]} data yet for this selection — check back once more data is
                available.
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1 rounded-card border border-border-default bg-surface p-lg">
                  <NamesTableHeader />
                  {topNames.slice(0, VISIBLE_COUNT).map((r) => {
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
                {topNames.length > VISIBLE_COUNT && (
                  <button
                    type="button"
                    onClick={() => setShowAllTop(true)}
                    className="self-start text-link font-semibold text-brand-primary underline"
                  >
                    View all →
                  </button>
                )}
              </>
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
        </div>
      </div>

      <ViewAllModal
        open={showAllTop}
        title={`Top ${topNames.length} ${SEX_LABEL[gender]} names`}
        onClose={() => setShowAllTop(false)}
      >
        <NamesTableHeader />
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
      </ViewAllModal>
    </div>
  )
}
