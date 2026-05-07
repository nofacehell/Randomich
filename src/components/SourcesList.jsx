// Vertical 3-row source list as on the mockup. Empty sources are dimmed
// and offer a quick "connect" link that opens the settings modal.
const ROWS = [
  { id: 'movie', label: 'Letterboxd watchlist', unit: 'films', dot: '#ff8a3a' },
  { id: 'game', label: 'Steam wishlist', unit: 'games', dot: '#7dd3a8' },
  { id: 'music', label: 'YouTube playlist', unit: 'tracks', dot: '#c084fc' },
];

export default function SourcesList({ counts, connected, onConnect }) {
  return (
    <ul className="divide-y divide-paper-200">
      {ROWS.map((r) => {
        const n = counts[r.id] ?? 0;
        const on = connected[r.id];
        return (
          <li
            key={r.id}
            className="flex items-center gap-3 py-2.5 text-sm"
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: on ? r.dot : '#d8caa9' }}
            />
            <span
              className={
                on
                  ? 'flex-1 text-ink-900'
                  : 'flex-1 text-ink-500'
              }
            >
              {r.label}
            </span>
            {on ? (
              <span className="text-ink-500 text-xs tabular-nums">
                {n} {r.unit}
              </span>
            ) : (
              <button
                type="button"
                onClick={onConnect}
                className="label-caps text-ember-500 hover:text-ember-600 transition-colors"
              >
                Connect
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
