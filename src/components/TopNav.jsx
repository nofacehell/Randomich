export default function TopNav({
  totalItems,
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

        {/* Right counter */}
        <div className="flex items-center gap-2">
          <span className="label-caps">In wheel</span>
          <span className="font-serif text-lg text-ink-900 leading-none tabular-nums">
            {totalItems}
          </span>
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
