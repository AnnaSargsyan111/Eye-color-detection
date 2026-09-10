import HeartButton from './HeartButton.jsx'

// The single shared baby-name row/card design used everywhere in the Baby
// Names experience (search results, top-100 browse list, Saved Names page)
// so saved state and visuals stay identical across all of them.
export default function NameRow({ rank, name, meta, saved, onToggleSave }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-input px-base py-md transition-colors hover:bg-bg-page">
      <div className="flex items-center gap-3">
        {rank != null && <span className="w-6 text-center text-body text-text-secondary">{rank}</span>}
        <span className="text-body font-medium text-text-primary">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        {meta && <span className="text-caption text-text-secondary">{meta}</span>}
        <HeartButton saved={saved} onClick={onToggleSave} />
      </div>
    </div>
  )
}
