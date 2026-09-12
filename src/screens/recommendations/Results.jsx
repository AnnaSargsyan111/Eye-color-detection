import { useMemo, useState } from 'react'
import RecommendationLayout from './RecommendationLayout.jsx'
import RecommendationCard from './RecommendationCard.jsx'
import ConfirmRemoveModal from '../../components/ConfirmRemoveModal.jsx'
import ViewAllModal from '../../components/ViewAllModal.jsx'
import Button from '../../components/Button.jsx'
import { useRecommendationFlow } from '../../babyNames/RecommendationContext.jsx'
import { useSavedNames } from '../../babyNames/SavedNamesContext.jsx'
import { generateRecommendations } from '../../services/babyNames/index.js'

const RELAXED_LABEL = { firstLetter: 'first letter', length: 'name length', popularity: 'popularity' }

export default function Results({ onNavigate }) {
  const { preferences, outcome, setOutcome, resetFlow } = useRecommendationFlow()
  const { isSaved, saveName, removeName } = useSavedNames()
  const [pendingRemove, setPendingRemove] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const VISIBLE_COUNT = 3

  // Resilience: if this screen is reached without going through Loading
  // (e.g. browser back/forward), compute the outcome on the spot instead of
  // rendering blank.
  const resolved = useMemo(() => {
    if (outcome) return outcome
    const computed = generateRecommendations(preferences)
    setOutcome(computed)
    return computed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome])

  function toggleSave(record) {
    if (isSaved(record)) {
      setPendingRemove(record)
    } else {
      saveName(record)
    }
  }

  const subtitle = resolved.insufficientData
    ? undefined
    : `${resolved.results.length} name${resolved.results.length === 1 ? '' : 's'} picked for you`

  return (
    <RecommendationLayout
      step={null}
      title="Your recommendations"
      subtitle={subtitle}
      onNavigate={onNavigate}
      onBack={() => onNavigate('rec-6')}
      hideFooter
    >
      {resolved.insufficientData ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-border-default bg-surface p-xl text-center">
          {preferences.firstLetter || preferences.length !== 'any' ? (
            <p className="text-body text-text-primary">
              Sorry, result not found.
              <br />
              Try adjust your filters.
            </p>
          ) : (
            <>
              <p className="text-body text-text-primary">
                We don't have enough matching names yet for these preferences.
              </p>
              <p className="text-caption text-text-secondary">
                Try widening your popularity, length, or letter preference — or check back once more data is available for this location.
              </p>
            </>
          )}
          <Button
            variant="primary"
            onClick={() => {
              // Re-entering the wizard from a "no results" state must start
              // completely clean — every step should look unanswered, exactly
              // like a first-time run, so nothing from the attempt that just
              // failed can leak into the next one.
              resetFlow()
              onNavigate('rec-1')
            }}
          >
            Adjust preferences
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-lg">
          {resolved.relaxedFilters.length > 0 && (
            <p className="rounded-input bg-bg-page px-base py-md text-caption text-text-secondary">
              We broadened {resolved.relaxedFilters.map((f) => RELAXED_LABEL[f]).join(', ')} to find enough matching names.
            </p>
          )}
          <div className="flex flex-col gap-3">
            {resolved.results.slice(0, VISIBLE_COUNT).map((result) => {
              const record = { name: result.name, sex: result.sex }
              return (
                <RecommendationCard
                  key={result.name}
                  result={result}
                  style={preferences.style}
                  saved={isSaved(record)}
                  onToggleSave={() => toggleSave(record)}
                />
              )
            })}
          </div>

          {resolved.results.length > VISIBLE_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="self-start text-link font-semibold text-brand-primary underline"
            >
              View all →
            </button>
          )}

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button variant="secondary" className="sm:flex-1" onClick={() => onNavigate('baby-names')}>
              Start over
            </Button>
            <Button
              variant="primary"
              className="sm:flex-1"
              onClick={() => {
                // Same as "Adjust preferences": starting another recommendation
                // run from here must not carry over this run's answers.
                resetFlow()
                onNavigate('rec-1')
              }}
            >
              Get recommendations
            </Button>
          </div>
        </div>
      )}

      <ViewAllModal open={showAll} title={`All ${resolved.results?.length ?? 0} recommendations`} onClose={() => setShowAll(false)}>
        {resolved.results?.map((result) => {
          const record = { name: result.name, sex: result.sex }
          return (
            <RecommendationCard
              key={result.name}
              result={result}
              style={preferences.style}
              saved={isSaved(record)}
              onToggleSave={() => toggleSave(record)}
            />
          )
        })}
      </ViewAllModal>

      <ConfirmRemoveModal
        open={!!pendingRemove}
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          removeName(pendingRemove)
          setPendingRemove(null)
        }}
      />
    </RecommendationLayout>
  )
}
