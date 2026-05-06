const TYPE_BADGE = {
  movie: { label: 'Letterboxd', tag: 'Film' },
  game: { label: 'Steam', tag: 'Game' },
  music: { label: 'YouTube', tag: 'Music' },
};

export default function ResultModal({ result, onClose, onSpinAgain }) {
  if (!result) return null;
  const badge = TYPE_BADGE[result.type] || { label: result.type, tag: '' };
  const year = result.year ? ` · ${result.year}` : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-ink-900 border border-ink-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* poster strip */}
        <div className="relative md:w-2/5 aspect-[3/4] md:aspect-auto bg-ink-950 shrink-0">
          {result.image ? (
            <img
              src={result.image}
              alt={result.title}
              className="w-full h-full object-cover opacity-90"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <div className="absolute top-3 left-3 label-caps text-ink-100 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
            {badge.tag}{year}
          </div>
          <div className="absolute bottom-3 left-3 right-3 font-serif text-ink-50 text-lg leading-tight truncate">
            {result.title}
          </div>
        </div>

        {/* details */}
        <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 label-caps">
              <span className="text-ember-400">·</span>
              <span>{badge.label}</span>
              <span className="text-ink-500">·</span>
              <span>The wheel chose</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-ink-50 mt-2 leading-tight">
              {result.title}
            </h2>
            {result.genres?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 label-caps">
                {result.genres.slice(0, 5).map((g) => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-6">
            {result.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-ink-50 text-ink-950 hover:bg-white transition-colors text-sm tracking-wide font-medium"
              >
                Открыть
              </a>
            )}
            <button
              type="button"
              onClick={onSpinAgain}
              className="px-4 py-2 rounded-lg bg-ember-500 hover:bg-ember-400 text-white transition-colors text-sm tracking-wide font-medium"
            >
              Крутить ещё ↻
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-ink-500/30 text-ink-400 hover:text-ink-50 hover:border-ink-400 transition-colors text-sm tracking-wide"
            >
              Не сегодня
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
