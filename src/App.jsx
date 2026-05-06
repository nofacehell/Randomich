import { useMemo, useState } from 'react';
import Wheel from './components/Wheel';
import ResultModal from './components/ResultModal';
import Settings from './components/Settings';
import MoodSelector from './components/MoodSelector';
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

export default function App() {
  const [result, setResult] = useState(null);
  const [settings, setSettings] = useState(() =>
    load(KEYS.settings, DEFAULT_SETTINGS)
  );
  const [mood, setMood] = useState('any');

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
  const filteredItems = useMemo(
    () => filterByMood(allItems, mood),
    [allItems, mood]
  );

  const handleSaveSettings = (next) => {
    setSettings(next);
    save(KEYS.settings, next);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
        🎡 Wheel of Fate
      </h1>
      <Settings initial={settings} onSave={handleSaveSettings} />
      <MoodSelector selected={mood} onSelect={setMood} />

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
          Под это настроение подходит {filteredItems.length} элемент
          {filteredItems.length === 1 ? '' : 'ов'}. Попробуй другое настроение
          или «Всё равно».
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-3">
            В колесе: {filteredItems.length}
          </div>
          <Wheel items={filteredItems} onResult={setResult} />
        </>
      )}

      <ResultModal
        result={result}
        onClose={() => setResult(null)}
        onSpinAgain={() => setResult(null)}
      />
    </div>
  );
}
