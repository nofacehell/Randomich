import { useEffect, useMemo, useState } from 'react';
import HeaderStrip from './components/HeaderStrip';
import FooterStrip from './components/FooterStrip';
import Wheel from './components/Wheel';
import ResultModal from './components/ResultModal';
import Settings from './components/Settings';
import MoodSelector from './components/MoodSelector';
import CategoryFilter from './components/CategoryFilter';
import CurrentlyInWheel from './components/CurrentlyInWheel';
import History from './components/History';
import { useLetterboxd } from './hooks/useLetterboxd';
import { useSteam } from './hooks/useSteam';
import { useYoutube } from './hooks/useYoutube';
import { filterByMood } from './utils/moodFilter';
import { load, save, KEYS } from './utils/storage';

const DEFAULT_SETTINGS = {
  letterboxdCsv: '',
  letterboxdFileName: '',
  steamId: '',
  youtube: '',
};
const DEFAULT_ENABLED = { movie: true, game: true, music: true };
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
  const [enabled, setEnabled] = useState(() =>
    load('enabled', DEFAULT_ENABLED)
  );
  const [history, setHistory] = useState(() => load(KEYS.history, []));
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(() => {
    const s = load(KEYS.settings, DEFAULT_SETTINGS);
    return !s.letterboxdCsv && !s.steamId && !s.youtube;
  });

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
  const sourcesConnected = useMemo(
    () => ({
      letterboxd: !!settings.letterboxdCsv,
      steam: !!settings.steamId,
      youtube: !!settings.youtube,
    }),
    [settings]
  );
  const sourceCount =
    +sourcesConnected.letterboxd +
    +sourcesConnected.steam +
    +sourcesConnected.youtube;

  const filteredItems = useMemo(() => {
    const byCategory = allItems.filter((it) => enabled[it.type]);
    return filterByMood(byCategory, mood);
  }, [allItems, mood, enabled]);

  useEffect(() => {
    setShuffleSeed(0);
  }, [filteredItems.length, mood, enabled]);

  const wheelItems = useMemo(() => {
    if (!shuffleSeed) return filteredItems;
    return shuffleArray(filteredItems, shuffleSeed);
  }, [filteredItems, shuffleSeed]);

  const handleSaveSettings = (next) => {
    setSettings(next);
    save(KEYS.settings, next);
  };
  const handleToggleCategory = (id) => {
    const next = { ...enabled, [id]: !enabled[id] };
    setEnabled(next);
    save('enabled', next);
  };
  const handleResult = (item) => {
    setResult(item);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
      type: item.type,
      title: item.title,
      url: item.url,
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

  const anyLoading = moviesLoading || gamesLoading || tracksLoading;

  return (
    <div className="bg-aurora min-h-screen flex flex-col">
      <HeaderStrip
        totalItems={allItems.length}
        sourceCount={sourceCount}
        moodCount={5}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Hero copy */}
      <div className="px-6 md:px-10 pt-2 pb-8">
        <h1 className="font-serif text-5xl md:text-7xl text-ink-50 leading-[1.05] max-w-3xl">
          One <em className="text-ember-400 not-italic">
            <span className="italic font-serif">random</span>
          </em>
          <br />
          from your own lists
        </h1>
      </div>

      {/* Two-column main */}
      <main className="flex-1 px-6 md:px-10 pb-8 grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,400px)] gap-8 items-start">
        {/* LEFT: wheel */}
        <section className="flex items-center justify-center min-h-[460px]">
          {filteredItems.length < 2 ? (
            <EmptyState
              count={filteredItems.length}
              hasSources={sourceCount > 0}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          ) : (
            <Wheel items={wheelItems} onResult={handleResult} />
          )}
        </section>

        {/* RIGHT: mood + currently-in-wheel + filters + history */}
        <aside className="space-y-6">
          <div>
            <span className="label-caps block mb-3">Mood</span>
            <MoodSelector selected={mood} onSelect={setMood} />
          </div>

          <CategoryFilter
            enabled={enabled}
            onToggle={handleToggleCategory}
            counts={counts}
          />

          <CurrentlyInWheel
            items={wheelItems}
            shuffled={shuffleSeed !== 0}
            onShuffle={handleShuffle}
            onReset={handleResetShuffle}
          />

          {/* Loading / error rows */}
          {(anyLoading ||
            moviesError ||
            gamesError ||
            tracksError) && (
            <div className="space-y-1 text-[11px] tracking-wide font-sans">
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

          <History entries={history} onClear={handleClearHistory} />
        </aside>
      </main>

      <FooterStrip counts={counts} sources={sourcesConnected} />

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initial={settings}
        onSave={handleSaveSettings}
      />

      <ResultModal
        result={result}
        onClose={() => setResult(null)}
        onSpinAgain={() => setResult(null)}
      />
    </div>
  );
}

function Status({ children, error }) {
  return (
    <div className={error ? 'text-ember-400' : 'text-ink-400'}>{children}</div>
  );
}

function EmptyState({ count, hasSources, onOpenSettings }) {
  return (
    <div className="text-center max-w-sm">
      <div className="font-serif text-3xl text-ink-100 italic leading-tight mb-3">
        Колесо ждёт
      </div>
      <p className="text-ink-400 text-sm leading-relaxed mb-5">
        {hasSources
          ? `Под эти настройки подходит ${count} элемент${
              count === 1 ? '' : 'ов'
            }. Включи больше категорий или смени настроение.`
          : 'Подключи хотя бы один источник, чтобы крутить колесо.'}
      </p>
      {!hasSources && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="px-5 py-2 rounded-lg bg-ember-500 hover:bg-ember-400 text-white text-sm font-medium tracking-wide"
        >
          Connect sources
        </button>
      )}
    </div>
  );
}
