const TYPE_LABELS = {
  movie: '🎬 Фильм',
  game: '🎮 Игра',
  music: '🎵 Музыка',
};

export default function ResultModal({ result, onClose, onSpinAgain }) {
  if (!result) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {result.image && (
          <img
            src={result.image}
            alt={result.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="p-6 space-y-3">
          <div className="text-sm text-gray-400">
            {TYPE_LABELS[result.type] || result.type}
          </div>
          <h2 className="text-2xl font-bold">{result.title}</h2>
          {result.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-3">
            {result.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors"
              >
                Открыть
              </a>
            )}
            <button
              type="button"
              onClick={onSpinAgain}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Крутить ещё
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
