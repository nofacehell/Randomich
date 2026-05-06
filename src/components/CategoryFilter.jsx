const CATEGORIES = [
  { id: 'movie', label: 'Films', dot: '#ff8a3a' },
  { id: 'game', label: 'Games', dot: '#7dd3a8' },
  { id: 'music', label: 'Music', dot: '#c084fc' },
];

export default function CategoryFilter({ enabled, onToggle, counts }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="label-caps mr-1">Sources</span>
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
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-wide uppercase transition-all',
              on
                ? 'bg-ink-900 border border-ink-500/30 text-ink-100'
                : 'bg-transparent border border-ink-500/15 text-ink-500 line-through',
              n === 0
                ? 'opacity-30 cursor-not-allowed'
                : 'cursor-pointer hover:border-ink-400',
            ].join(' ')}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: c.dot }}
            />
            {c.label}
            <span className="text-ink-400">{n}</span>
          </button>
        );
      })}
    </div>
  );
}
