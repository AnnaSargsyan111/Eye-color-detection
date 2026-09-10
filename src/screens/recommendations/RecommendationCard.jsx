import HeartButton from '../../components/HeartButton.jsx'

const STYLE_INDICATOR = {
  trending: '↑ Trending',
  timeless: '● Timeless',
  distinctive: '◆ Distinctive',
  mixed: null,
}

// The Results-screen card: same card visual language (rounded-card,
// border-default, surface, existing spacing/text tokens) as the rest of the
// Baby Names experience, extended with the rank/style/explanation a
// recommendation needs. Heart button wired to the same SavedNamesContext as
// every other Baby Names screen — no separate save system.
export default function RecommendationCard({ result, style, saved, onToggleSave }) {
  const indicator = STYLE_INDICATOR[style]

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border-default bg-surface p-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-body font-semibold text-text-primary">{result.name}</span>
          <span className="text-caption text-text-secondary">
            Rank #{result.latestRank} · {result.latestCount.toLocaleString()} in {result.latestYear}
            {indicator ? ` · ${indicator}` : ''}
          </span>
        </div>
        <HeartButton saved={saved} onClick={onToggleSave} />
      </div>
      <p className="text-caption text-text-secondary">
        <span className="font-medium text-text-primary">Why this name? </span>
        {result.explanation}
      </p>
    </div>
  )
}
