const CATEGORIES = [
  { id: 'movie', emoji: '🎬', label: 'Фильмы' },
  { id: 'game', emoji: '🎮', label: 'Игры' },
  { id: 'music', emoji: '🎵', label: 'Музыка' },
];

export default function CategoryFilter({ enabled, onToggle, counts }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-4">
      {CATEGORIES.map((c) => {
        const on = enabled[c.id];
        const n = counts?.[c.id] ?? 0;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onToggle(c.id)}
            disabled={n === 0}
            className={[
              'px-3 py-1.5 rounded-full border text-sm transition-all',
              on
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-transparent border-gray-800 text-gray-600 line-through',
              n === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className="mr-1">{c.emoji}</span>
            {c.label}
            <span className="ml-1.5 text-xs text-gray-400">{n}</span>
          </button>
        );
      })}
    </div>
  );
}
