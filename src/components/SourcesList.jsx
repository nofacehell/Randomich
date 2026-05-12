// Source list with three states per row:
//   not connected → "Connect" CTA opens settings
//   connected + enabled  → full colour, eye-icon open, clickable to mute
//   connected + muted    → faded, eye-icon crossed, clickable to re-enable
const ROWS = [
  {
    id: 'movie',
    label: 'Letterboxd watchlist',
    unit: 'films',
    dot: '#ff8a3a',
    emoji: '🎬',
  },
  {
    id: 'game',
    label: 'Steam wishlist + library',
    unit: 'games',
    dot: '#7dd3a8',
    emoji: '🎮',
  },
];

export default function SourcesList({
  counts,
  connected,
  enabled,
  onToggle,
  onConnect,
  letterboxdImportedAt,
}) {
  return (
    <ul className="divide-y divide-paper-200">
      {ROWS.map((r) => {
        const n = counts[r.id] ?? 0;
        const isConnected = connected[r.id];
        const isEnabled = enabled[r.id];
        const muted = isConnected && !isEnabled;

        return (
          <li key={r.id} className="text-sm">
            <div
              className={[
                'flex items-center gap-3 py-2.5',
                isConnected ? 'cursor-pointer group' : '',
              ].join(' ')}
              onClick={isConnected ? () => onToggle(r.id) : undefined}
              role={isConnected ? 'button' : undefined}
              tabIndex={isConnected ? 0 : undefined}
              onKeyDown={
                isConnected
                  ? (e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        onToggle(r.id);
                      }
                    }
                  : undefined
              }
              title={
                isConnected
                  ? muted
                    ? 'Click to enable'
                    : 'Click to mute'
                  : undefined
              }
            >
              {/* Type emoji with coloured backdrop */}
              <span
                className={[
                  'inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-[14px] transition-opacity',
                  muted ? 'opacity-35' : 'opacity-100',
                ].join(' ')}
                style={{
                  background: isConnected ? `${r.dot}22` : '#d8caa922',
                }}
              >
                {r.emoji}
              </span>

              <span
                className={[
                  'flex-1 transition-colors',
                  !isConnected && 'text-ink-500',
                  isConnected && isEnabled && 'text-ink-900',
                  muted && 'text-ink-500 line-through',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {r.label}
              </span>

              {!isConnected ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnect();
                  }}
                  className="label-caps text-ember-500 hover:text-ember-600 transition-colors"
                >
                  Connect
                </button>
              ) : (
                <>
                  <span
                    className={[
                      'text-xs tabular-nums transition-colors',
                      muted ? 'text-ink-500/60' : 'text-ink-500',
                    ].join(' ')}
                  >
                    {n} {r.unit}
                  </span>
                  <EyeIcon muted={muted} />
                </>
              )}
            </div>

            {/* Movie-only freshness sub-row */}
            {r.id === 'movie' && isConnected && letterboxdImportedAt && (
              <FreshnessNote
                ts={letterboxdImportedAt}
                onReimport={onConnect}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function EyeIcon({ muted }) {
  return (
    <span
      className={[
        'shrink-0 transition-colors',
        muted ? 'text-ink-400' : 'text-ink-700 group-hover:text-ember-500',
      ].join(' ')}
      aria-hidden="true"
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </span>
  );
}

function FreshnessNote({ ts, onReimport }) {
  const ageMs = Date.now() - ts;
  const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));
  const stale = days >= 30;
  const aging = days >= 14;

  const dot = stale ? '#d4520f' : aging ? '#ff8a3a' : '#9b8e76';

  return (
    <div className="flex items-center justify-between pl-10 pb-2.5 -mt-1 text-[11px] tracking-wide">
      <span className="inline-flex items-center gap-1.5 text-ink-500">
        <span
          className="inline-block w-1 h-1 rounded-full"
          style={{ background: dot }}
        />
        Imported {formatAge(days)}
        {stale && ' · time to refresh'}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReimport();
        }}
        className="shrink-0 inline-flex items-center gap-1 text-ink-500 hover:text-ember-500 transition-colors"
        title="Re-import CSV"
        aria-label="Re-import"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      </button>
    </div>
  );
}

function formatAge(days) {
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}
