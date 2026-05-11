const TYPE_BADGE = {
  movie: 'Letterboxd',
  game: 'Steam',
};

const MOOD_LABEL = {
  any: 'все равно',
  chill: 'расслабиться',
  hype: 'бодро',
  sad: 'погрустить',
  fun: 'угарнуть',
};

export default function ResultModal({ result, mood, onClose, onSpinAgain }) {
  if (!result) return null;
  const badge = TYPE_BADGE[result.type] || result.type;
  const year = result.year ? `${result.year}` : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-paper-50 border border-paper-200 rounded-2xl overflow-hidden shadow-2xl flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mini poster */}
        <div className="w-32 md:w-40 shrink-0 bg-paper-200 flex items-center justify-center overflow-hidden">
          {result.image ? (
            <img
              src={result.image}
              alt={result.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div className="text-ink-400 text-3xl">·</div>
          )}
        </div>

        {/* Centre details */}
        <div className="flex-1 p-5 md:p-6 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 label-caps mb-1.5">
            <span>· {badge}</span>
            <span className="text-paper-300">·</span>
            <span>The wheel chose</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-ink-900 leading-tight truncate">
            {result.title}
          </h2>
          <div className="flex items-center gap-3 mt-1.5 text-[12px] text-ink-500">
            {year && <span>{year}</span>}
            {year && mood && mood !== 'any' && <span>·</span>}
            {mood && mood !== 'any' && (
              <span>
                matched mood «{MOOD_LABEL[mood]}»
              </span>
            )}
          </div>
          {result.genres?.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 label-caps mt-3">
              {result.genres.slice(0, 3).map((g) => (
                <span key={g}>{g}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right CTAs — vertical stack on small, inline on md+ */}
        <div className="flex flex-col items-stretch justify-center gap-2 p-5 md:p-6 shrink-0 border-l border-paper-200 min-w-[160px]">
          {result.url && (
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-ink-900 hover:bg-ink-700 text-paper-50 text-center text-sm tracking-wide font-medium transition-colors"
            >
              Открыть ↗
            </a>
          )}
          <button
            type="button"
            onClick={onSpinAgain}
            className="px-4 py-2 rounded-lg bg-ember-500 hover:bg-ember-400 text-white text-sm tracking-wide font-medium transition-colors"
          >
            Крутить ещё ↻
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-paper-200 text-ink-700 hover:bg-paper-100 text-sm tracking-wide transition-colors"
          >
            Не сегодня
          </button>
        </div>
      </div>
    </div>
  );
}
