import { useState } from 'react'
import AiraSidebar from '../components/AiraSidebar.jsx'
import MobileTopBar from '../components/MobileTopBar.jsx'
import NameRow from '../components/NameRow.jsx'
import ConfirmRemoveModal from '../components/ConfirmRemoveModal.jsx'
import ViewAllModal from '../components/ViewAllModal.jsx'
import { useSavedNames } from '../babyNames/SavedNamesContext.jsx'

const SEX_LABEL = { male: 'Boy', female: 'Girl' }
const VISIBLE_COUNT = 5

export default function SavedNames({ onNavigate }) {
  const { savedNames, removeName, removeAllNames } = useSavedNames()
  const [pendingRemove, setPendingRemove] = useState(null)
  const [confirmRemoveAll, setConfirmRemoveAll] = useState(false)
  const [showAll, setShowAll] = useState(false)

  function nameRow(n) {
    return (
      <NameRow
        key={`${n.name}-${n.sex}`}
        name={n.sex ? `${n.name} · ${SEX_LABEL[n.sex] ?? n.sex}` : n.name}
        saved
        onToggleSave={() => setPendingRemove(n)}
      />
    )
  }

  const removeAllButton = (
    <button
      type="button"
      onClick={() => setConfirmRemoveAll(true)}
      className="text-link font-semibold text-error underline"
    >
      Remove all
    </button>
  )

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <AiraSidebar active="saved-names" onNavigate={onNavigate} />
      <MobileTopBar title="Saved Names" />

      <div className="flex flex-col items-center p-xl md:ml-[76px]">
        <div className="flex w-full max-w-[640px] flex-col gap-xl">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-h1 font-semibold text-text-primary">Saved Names</h1>
            {savedNames.length > 1 && removeAllButton}
          </div>

          {savedNames.length === 0 ? (
            <p className="text-body text-text-secondary">You haven't saved any names yet.</p>
          ) : (
            <>
              <div className="flex flex-col gap-1 rounded-card border border-border-default bg-surface p-lg">
                {savedNames.slice(0, VISIBLE_COUNT).map(nameRow)}
              </div>
              {savedNames.length > VISIBLE_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="self-start text-link font-semibold text-brand-primary underline"
                >
                  View all →
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ViewAllModal
        open={showAll}
        title={`All ${savedNames.length} saved names`}
        onClose={() => setShowAll(false)}
        headerAction={savedNames.length > 1 ? removeAllButton : null}
      >
        {savedNames.map(nameRow)}
      </ViewAllModal>

      <ConfirmRemoveModal
        open={!!pendingRemove}
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          removeName(pendingRemove)
          setPendingRemove(null)
        }}
      />

      <ConfirmRemoveModal
        open={confirmRemoveAll}
        title="Remove all saved names?"
        message={`Are you sure you want to remove all ${savedNames.length} names from your saved names? This action can't be undone.`}
        confirmLabel="Remove all"
        onCancel={() => setConfirmRemoveAll(false)}
        onConfirm={() => {
          removeAllNames()
          setConfirmRemoveAll(false)
          setShowAll(false)
        }}
      />
    </div>
  )
}
