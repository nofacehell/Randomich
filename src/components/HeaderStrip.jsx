export default function HeaderStrip({ totalItems, sourceCount, moodCount, onOpenSettings }) {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const year = now.getFullYear();

  return (
    <header className="w-full px-6 md:px-10 py-5 flex items-start justify-between text-[11px] tracking-widest2 uppercase text-ink-500">
      <div className="font-sans">
        Wheel of Fate <span className="text-ink-400">·</span> No. 047
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:block font-sans text-right leading-tight">
          <div>An Evening in {month} {year}</div>
          <div className="text-ink-400 mt-0.5">
            {totalItems} items <span className="text-ink-500">·</span> {sourceCount} sources <span className="text-ink-500">·</span> {moodCount} moods
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full border border-ink-500/40 hover:border-ember-400 hover:text-ember-400 transition-colors flex items-center justify-center"
          title="Настройки источников"
          aria-label="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
