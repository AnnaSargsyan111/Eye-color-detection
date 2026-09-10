import { useState } from 'react'
import AiraSidebar from '../components/AiraSidebar.jsx'
import NameRow from '../components/NameRow.jsx'
import ConfirmRemoveModal from '../components/ConfirmRemoveModal.jsx'
import { useSavedNames } from '../babyNames/SavedNamesContext.jsx'

const SEX_LABEL = { male: 'Boy', female: 'Girl' }

export default function SavedNames({ onNavigate }) {
  const { savedNames, removeName } = useSavedNames()
  const [pendingRemove, setPendingRemove] = useState(null)

  return (
    <div className="min-h-screen w-full bg-bg-page font-sans">
      <AiraSidebar active="saved-names" onNavigate={onNavigate} />

      <div className="ml-[76px] flex flex-col items-center p-xl">
        <div className="flex w-full max-w-[640px] flex-col gap-xl">
          <h1 className="text-h1 font-semibold text-text-primary">Saved Names</h1>

          {savedNames.length === 0 ? (
            <p className="text-body text-text-secondary">You haven't saved any names yet.</p>
          ) : (
            <div className="flex flex-col gap-1 rounded-card border border-border-default bg-surface p-lg">
              {savedNames.map((n) => (
                <NameRow
                  key={`${n.name}-${n.sex}`}
                  name={n.sex ? `${n.name} · ${SEX_LABEL[n.sex] ?? n.sex}` : n.name}
                  saved
                  onToggleSave={() => setPendingRemove(n)}
                />
              ))}
            </div>
          )}
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
