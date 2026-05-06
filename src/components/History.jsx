const TYPE_DOT = {
  movie: '#ff8a3a',
  game: '#7dd3a8',
  music: '#c084fc',
};

export default function History({ entries, onClear }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="label-caps">Recent fates</span>
        <button
          type="button"
          onClick={onClear}
          className="label-caps hover:text-ember-400 transition-colors"
        >
          clear
        </button>
      </div>
      <ul className="space-y-1">
        {entries.slice(0, 5).map((e) => (
          <li
            key={e.id}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-ink-900/40 border border-ink-500/10 text-[12px]"
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: TYPE_DOT[e.type] }}
            />
            <a
              href={e.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 truncate text-ink-100 hover:text-ember-400 transition-colors"
            >
              {e.title}
            </a>
            <span className="shrink-0 text-[10px] text-ink-500 tracking-wide">
              {formatTime(e.at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
