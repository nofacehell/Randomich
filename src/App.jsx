import { useEffect, useMemo, useState } from 'react';
import TopNav from './components/TopNav';
import Wheel from './components/Wheel';
import ResultModal from './components/ResultModal';
import Settings from './components/Settings';
import HistoryModal from './components/HistoryModal';
import MoodSelector from './components/MoodSelector';
import SourcesList from './components/SourcesList';
import LastSpin, { RecentList } from './components/LastSpin';
import { useLetterboxd } from './hooks/useLetterboxd';
import { useSteam } from './hooks/useSteam';
import { useYoutube } from './hooks/useYoutube';
import { filterByMood, countMatched } from './utils/moodFilter';
import { load, save, KEYS } from './utils/storage';

const DEFAULT_SETTINGS = {
  letterboxdCsv: '',
  letterboxdFileName: '',
  steamId: '',
  youtube: '',
};
const HISTORY_LIMIT = 10;

// Seeded Fisher-Yates so a given seed always produces the same permutation —
// keeps the wheel stable across re-renders until the user re-shuffles.
function shuffleArray(arr, seed) {
  const out = arr.slice();
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function App() {
  const [result, setResult] = useState(null);
  const [settings, setSettings] = useState(() =>
    load(KEYS.settings, DEFAULT_SETTINGS)
  );
  const [mood, setMood] = useState('any');
  const [history, setHistory] = useState(() => load(KEYS.history, []));
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const [settingsOpen, setSettingsOpen] = useState(() => {
    const s = load(KEYS.settings, DEFAULT_SETTINGS);
    return !s.letterboxdCsv && !s.steamId && !s.youtube;
  });
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    items: movies,
    loading: moviesLoading,
    error: moviesError,
    progress: moviesProgress,
  } = useLetterboxd(settings.letterboxdCsv);

  const {
    items: games,
    loading: gamesLoading,
    error: gamesError,
    progress: gamesProgress,
  } = useSteam(settings.steamId);

  const {
    items: tracks,
    loading: tracksLoading,
    error: tracksError,
  } = useYoutube(settings.youtube);

  const allItems = useMemo(
    () => [...movies, ...games, ...tracks],
    [movies, games, tracks]
  );

  const counts = useMemo(
    () => ({
      movie: movies.length,
      game: games.length,
      music: tracks.length,
    }),
    [movies.length, games.length, tracks.length]
  );

  const connected = useMemo(
    () => ({
      movie: !!settings.letterboxdCsv,
      game: !!settings.steamId,
      music: !!settings.youtube,
    }),
    [settings]
  );

  const filteredItems = useMemo(
    () => filterByMood(allItems, mood),
    [allItems, mood]
  );
  const matchedCount = useMemo(
    () => countMatched(allItems, mood),
    [allItems, mood]
  );

  // Reset shuffle whenever the underlying list changes.
  useEffect(() => {
    setShuffleSeed(0);
  }, [filteredItems.length, mood]);

  const wheelItems = useMemo(() => {
    if (!shuffleSeed) return filteredItems;
    return shuffleArray(filteredItems, shuffleSeed);
  }, [filteredItems, shuffleSeed]);

  const handleSaveSettings = (next) => {
    setSettings(next);
    save(KEYS.settings, next);
  };

  const handleResult = (item) => {
    setResult(item);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
      type: item.type,
      title: item.title,
      url: item.url,
      image: item.image,
    };
    const next = [entry, ...history].slice(0, HISTORY_LIMIT);
    setHistory(next);
    save(KEYS.history, next);
  };

  const handleClearHistory = () => {
    setHistory([]);
    save(KEYS.history, []);
  };

  const handleShuffle = () => setShuffleSeed(Date.now());
  const handleResetShuffle = () => setShuffleSeed(0);

  const lastSpinEntry = history[0] || null;
  const recentEntries = history.slice(1, 6); // up to 5 prior spins under the featured card
  const anyLoading = moviesLoading || gamesLoading || tracksLoading;
  const anyError = moviesError || gamesError || tracksError;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        totalItems={allItems.length}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_minmax(420px,500px)] gap-0">
        {/* LEFT: wheel pane */}
        <section className="border-r border-paper-200 px-6 md:px-10 py-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="label-caps">The Wheel</span>
            <div className="flex items-center gap-3">
              <span className="label-caps font-mono">
                Seed · {seedFromState(history.length, mood, shuffleSeed)}
              </span>
              <div className="flex items-center gap-2">
                <PillBtn onClick={handleShuffle} active={shuffleSeed !== 0}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                  Shuffle
                </PillBtn>
                <PillBtn
                  onClick={handleResetShuffle}
                  disabled={shuffleSeed === 0}
                  ghost
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Reset
                </PillBtn>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[480px]">
            {wheelItems.length < 2 ? (
              <EmptyState
                count={wheelItems.length}
                hasSources={
                  connected.movie || connected.game || connected.music
                }
                onOpenSettings={() => setSettingsOpen(true)}
              />
            ) : (
              <Wheel items={wheelItems} onResult={handleResult} />
            )}
          </div>
        </section>

        {/* RIGHT: sidebar pane */}
        <aside className="px-6 md:px-8 py-6 space-y-7">
          {/* PICK A MOOD */}
          <section>
            <div className="label-caps mb-2">Pick a mood</div>
            <h2 className="font-serif text-3xl text-ink-900 leading-tight mb-1">
              Tonight I want to <em className="italic">feel</em>
            </h2>
            <p className="text-[12px] text-ink-500 mb-4">
              {mood === 'any'
                ? 'Mood narrows the wheel by genre tags before each spin.'
                : `Matched ${matchedCount} of ${allItems.length} items by genre — items without genre data also stay in the wheel.`}
            </p>
            <MoodSelector selected={mood} onSelect={setMood} />
          </section>

          <Divider />

          {/* SOURCES */}
          <section>
            <div className="label-caps mb-3">Sources</div>
            <SourcesList
              counts={counts}
              connected={connected}
              onConnect={() => setSettingsOpen(true)}
            />
            {(anyLoading || anyError) && (
              <div className="space-y-1 text-[11px] tracking-wide font-sans mt-3">
                {moviesLoading && (
                  <Status>
                    🎬 TMDB · {moviesProgress.done}/{moviesProgress.total}
                  </Status>
                )}
                {gamesLoading && (
                  <Status>
                    🎮 Steam · {gamesProgress.done}/{gamesProgress.total}
                  </Status>
                )}
                {tracksLoading && <Status>🎵 YouTube</Status>}
                {moviesError && <Status error>🎬 {moviesError}</Status>}
                {gamesError && <Status error>🎮 {gamesError}</Status>}
                {tracksError && <Status error>🎵 {tracksError}</Status>}
              </div>
            )}
          </section>

          <Divider />

          {/* LAST SPIN + recent */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="label-caps">Last spin</span>
              {history.length > 1 && (
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className="label-caps text-ink-500 hover:text-ember-500 transition-colors"
                >
                  See all · {history.length}
                </button>
              )}
            </div>
            <LastSpin entry={lastSpinEntry} />
            {recentEntries.length > 0 && (
              <>
                <div className="label-caps mt-5 mb-1">Earlier today</div>
                <RecentList entries={recentEntries} />
              </>
            )}
          </section>
        </aside>
      </main>

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initial={settings}
        onSave={handleSaveSettings}
      />

      <HistoryModal
        open={historyOpen}
        entries={history}
        onClear={handleClearHistory}
        onClose={() => setHistoryOpen(false)}
      />

      <ResultModal
        result={result}
        mood={mood}
        onClose={() => setResult(null)}
        onSpinAgain={() => setResult(null)}
      />
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-paper-200" />;
}

function PillBtn({ children, active, ghost, ...props }) {
  const base =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] tracking-widest2 uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed';
  const tone = active
    ? 'bg-ink-900 text-paper-50 hover:bg-ink-700'
    : ghost
      ? 'text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-paper-200'
      : 'text-ink-900 hover:bg-paper-100 border border-paper-200';
  return (
    <button type="button" {...props} className={`${base} ${tone}`}>
      {children}
    </button>
  );
}

function Status({ children, error }) {
  return (
    <div className={error ? 'text-ember-600' : 'text-ink-500'}>{children}</div>
  );
}

function EmptyState({ count, hasSources, onOpenSettings }) {
  return (
    <div className="text-center max-w-sm">
      <div className="font-serif text-3xl text-ink-900 italic leading-tight mb-3">
        Колесо ждёт
      </div>
      <p className="text-ink-500 text-sm leading-relaxed mb-5">
        {hasSources
          ? `Под это настроение подходит ${count} элемент${
              count === 1 ? '' : 'ов'
            }. Смени настроение или подключи ещё источник.`
          : 'Подключи хотя бы один источник, чтобы крутить колесо.'}
      </p>
      <button
        type="button"
        onClick={onOpenSettings}
        className="px-5 py-2 rounded-lg bg-ink-900 hover:bg-ink-700 text-paper-50 text-sm font-medium tracking-wide"
      >
        {hasSources ? 'Open settings' : 'Connect sources'}
      </button>
    </div>
  );
}

// Tiny pseudo-seed for the editorial header text — not cryptographic, just
// flavour. Changes on every spin / mood / shuffle so the page feels alive.
function seedFromState(historyLen, mood, shuffleSeed) {
  const base =
    (historyLen * 8675309 + mood.charCodeAt(0) * 1009 + (shuffleSeed | 0)) >>> 0;
  return '0x' + base.toString(16).toUpperCase().padStart(5, '0').slice(0, 5);
}
