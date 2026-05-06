// Compact chip-list of items currently in the wheel + shuffle/reset actions.
const MAX_VISIBLE = 6;

export default function CurrentlyInWheel({
  items,
  shuffled,
  onShuffle,
  onReset,
}) {
  const visible = items.slice(0, MAX_VISIBLE);
  const more = Math.max(0, items.length - MAX_VISIBLE);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="label-caps">Currently in the wheel</span>
        <div className="flex items-center gap-1">
          <IconBtn
            onClick={onShuffle}
            title="Перемешать порядок"
            aria-label="Shuffle"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </IconBtn>
          <IconBtn
            onClick={onReset}
            disabled={!shuffled}
            title="Вернуть исходный порядок"
            aria-label="Reset"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </IconBtn>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-ink-500 text-xs italic">пусто</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {visible.map((it, i) => (
            <span
              key={`${it.title}-${i}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-900/70 border border-ink-500/15 text-[11px] text-ink-100 tracking-wide max-w-[180px]"
              title={it.title}
            >
              <Dot type={it.type} />
              <span className="truncate uppercase">{truncate(it.title, 18)}</span>
            </span>
          ))}
          {more > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-ink-500/15 text-[11px] text-ink-400 tracking-wide">
              + {more} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className="w-7 h-7 rounded-full text-ink-400 hover:text-ember-400 hover:bg-ink-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
    />
  );
}

function Dot({ type }) {
  const color =
    type === 'movie' ? '#ff8a3a' : type === 'game' ? '#7dd3a8' : '#c084fc';
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
      style={{ background: color }}
    />
  );
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
