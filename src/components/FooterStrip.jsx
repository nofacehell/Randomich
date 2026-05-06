export default function FooterStrip({ counts, sources }) {
  return (
    <footer className="w-full px-6 md:px-10 py-5 flex items-center justify-between text-[11px] tracking-widest2 uppercase text-ink-500 font-sans">
      <div className="flex items-center gap-4">
        <CountDot color="#ff8a3a" label="Films" n={counts.movie} />
        <CountDot color="#7dd3a8" label="Games" n={counts.game} />
        <CountDot color="#c084fc" label="Music" n={counts.music} />
      </div>
      <div className="hidden md:flex items-center gap-2 text-ink-400">
        Connected
        <span className="text-ink-500">·</span>
        <SourceTag on={sources.letterboxd}>Letterboxd</SourceTag>
        <span className="text-ink-500">·</span>
        <SourceTag on={sources.steam}>Steam</SourceTag>
        <span className="text-ink-500">·</span>
        <SourceTag on={sources.youtube}>YouTube</SourceTag>
      </div>
    </footer>
  );
}

function CountDot({ color, label, n }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
      {label} <span className="text-ink-400">·</span> {n}
    </span>
  );
}

function SourceTag({ on, children }) {
  return (
    <span className={on ? 'text-ink-100' : 'text-ink-500/50 line-through'}>
      {children}
    </span>
  );
}
