const TYPE_DOT = {
  movie: '#ff8a3a',
  game: '#7dd3a8',
  music: '#c084fc',
};
const TYPE_LABEL = { movie: 'Film', game: 'Game', music: 'Music' };

// Big featured card for the most recent spin.
export default function LastSpin({ entry }) {
  if (!entry) {
    return (
      <div className="rounded-xl border border-paper-200 px-4 py-6 text-center text-ink-500 text-sm italic">
        Колесо ещё не крутилось.
      </div>
    );
  }

  return (
    <a
      href={entry.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-paper-200 hover:border-paper-300 transition-colors group overflow-hidden"
    >
      <div className="flex">
        <div className="w-28 h-28 bg-paper-200 shrink-0 overflow-hidden flex items-center justify-center">
          {entry.image ? (
            <img
              src={entry.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: TYPE_DOT[entry.type] }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 label-caps mb-1.5">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: TYPE_DOT[entry.type] }}
              />
              <span>{TYPE_LABEL[entry.type] || entry.type}</span>
              <span className="text-paper-300">·</span>
              <span>{formatTime(entry.at)}</span>
            </div>
            <div className="font-serif text-xl text-ink-900 leading-tight truncate group-hover:text-ember-500 transition-colors">
              {entry.title}
            </div>
          </div>
          <span className="label-caps text-ink-500 group-hover:text-ember-500 transition-colors mt-2">
            Open ↗
          </span>
        </div>
      </div>
    </a>
  );
}

// Compact recent-history list rendered under the big card.
export function RecentList({ entries }) {
  if (!entries || entries.length === 0) return null;
  return (
    <ul className="mt-3 space-y-1">
      {entries.map((e) => (
        <li key={e.id}>
          <a
            href={e.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-paper-100 transition-colors group"
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: TYPE_DOT[e.type] }}
            />
            <span className="flex-1 text-[13px] text-ink-700 truncate group-hover:text-ink-900">
              {e.title}
            </span>
            <span className="label-caps text-ink-500 shrink-0 tabular-nums">
              {formatTime(e.at)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
}
