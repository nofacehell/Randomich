const TYPE_EMOJI = { movie: '🎬', game: '🎮', music: '🎵' };

export default function History({ entries, onClear }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-400">
          Последние результаты
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-400"
        >
          Очистить
        </button>
      </div>
      <ul className="space-y-1">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-sm"
          >
            <span className="shrink-0">{TYPE_EMOJI[e.type] || '•'}</span>
            <a
              href={e.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 truncate hover:text-purple-400"
            >
              {e.title}
            </a>
            <span className="shrink-0 text-xs text-gray-500">
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
