import { useEffect } from 'react';

const TYPE_DOT = {
  movie: '#ff8a3a',
  game: '#7dd3a8',
};
const TYPE_LABEL = { movie: 'Film', game: 'Game' };

export default function HistoryModal({ open, entries, onClear, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm flex items-start justify-center p-4 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-paper-50 border border-paper-200 rounded-2xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-3 flex items-start justify-between border-b border-paper-200">
          <div>
            <div className="label-caps">Recent fates</div>
            <h2 className="font-serif text-2xl text-ink-900 mt-1">
              История <em className="italic">спинов</em>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="label-caps text-ink-500 hover:text-ember-500 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full text-ink-500 hover:text-ink-900 hover:bg-paper-100 transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {entries.length === 0 ? (
            <div className="px-6 py-12 text-center text-ink-500 text-sm">
              Колесо ещё не крутилось.
            </div>
          ) : (
            <ul>
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="border-b border-paper-200 last:border-b-0"
                >
                  <a
                    href={e.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-paper-100 transition-colors"
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: TYPE_DOT[e.type] }}
                    />
                    <span className="flex-1 text-ink-900 text-sm truncate">
                      {e.title}
                    </span>
                    <span className="label-caps text-ink-500 shrink-0">
                      {TYPE_LABEL[e.type] || e.type}
                    </span>
                    <span className="label-caps text-ink-500 shrink-0 tabular-nums">
                      {formatTime(e.at)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
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
