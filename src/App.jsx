import { useEffect, useMemo, useState } from 'react';
import Wheel from './components/Wheel';
import ResultModal from './components/ResultModal';
import Settings from './components/Settings';
import MoodSelector from './components/MoodSelector';
import CategoryFilter from './components/CategoryFilter';
import History from './components/History';
import ShuffleControls from './components/ShuffleControls';
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
  const [shuffleSeed, setShuffleSeed] = useState(0); // 0 = original order

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

  const filteredItems = useMemo(() => {
    const byCategory = allItems.filter((it) => enabled[it.type]);
    return filterByMood(byCategory, mood);
  }, [allItems, mood, enabled]);

  // Reset shuffle when the underlying list changes — otherwise stale indices
  // would map to wrong items.
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

  const handleShuffle = () => {
    setShuffleSeed(Date.now());
  };
  const handleResetShuffle = () => {
    setShuffleSeed(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
        🎡 Wheel of Fate
      </h1>
      <Settings initial={settings} onSave={handleSaveSettings} />
      <MoodSelector selected={mood} onSelect={setMood} />
      <CategoryFilter
        enabled={enabled}
        onToggle={handleToggleCategory}
        counts={counts}
      />

      <div className="space-y-1 text-sm mb-3">
        {moviesError && <div className="text-red-400">🎬 {moviesError}</div>}
        {moviesLoading && (
          <div className="text-gray-400">
            🎬 Загружаем жанры из TMDB: {moviesProgress.done}/{moviesProgress.total}
          </div>
        )}
        {gamesError && <div className="text-red-400">🎮 {gamesError}</div>}
        {gamesLoading && (
          <div className="text-gray-400">
            🎮 Загружаем игры из Steam: {gamesProgress.done}/{gamesProgress.total}
          </div>
        )}
        {tracksError && <div className="text-red-400">🎵 {tracksError}</div>}
        {tracksLoading && (
          <div className="text-gray-400">🎵 Загружаем плейлист…</div>
        )}
      </div>

      {filteredItems.length < 2 ? (
        <div className="text-center text-gray-400 p-8 max-w-md">
          Под эти настройки подходит {filteredItems.length} элемент
          {filteredItems.length === 1 ? '' : 'ов'}. Включи больше категорий,
          смени настроение или загрузи источники.
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-3">
            В колесе: {filteredItems.length}
          </div>
          <ShuffleControls
            shuffled={shuffleSeed !== 0}
            onShuffle={handleShuffle}
            onReset={handleResetShuffle}
          />
          <Wheel items={wheelItems} onResult={handleResult} />
        </>
      )}

      <History entries={history} onClear={handleClearHistory} />

      <ResultModal
        result={result}
        onClose={() => setResult(null)}
        onSpinAgain={() => setResult(null)}
      />
    </div>
  );
}
