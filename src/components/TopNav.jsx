export default function TopNav({
  totalItems,
  muted,
  onToggleMute,
  onOpenHistory,
  onOpenSettings,
}) {
  return (
    <header className="border-b border-paper-200">
      <div className="px-6 md:px-10 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="#top" className="font-serif text-xl text-ink-900 leading-none">
          Wheel <em className="font-serif italic">of</em> Fate
        </a>

        {/* Center nav */}
        <nav className="flex items-center gap-7">
          <NavBtn onClick={onOpenHistory}>History</NavBtn>
          <NavBtn onClick={onOpenSettings}>Settings</NavBtn>
        </nav>

        {/* Right: mute + counter */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleMute}
            className="text-ink-500 hover:text-ink-900 transition-colors"
            title={muted ? 'Включить звук' : 'Выключить звук'}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="label-caps">In wheel</span>
            <span className="font-serif text-lg text-ink-900 leading-none tabular-nums">
              {totalItems}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] tracking-widest2 uppercase text-ink-500 hover:text-ink-900 transition-colors"
    >
      {children}
    </button>
  );
}
