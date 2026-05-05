import { useMemo, useState } from 'react';
import Wheel from './components/Wheel';
import ResultModal from './components/ResultModal';
import Settings from './components/Settings';
import MoodSelector from './components/MoodSelector';
import { useLetterboxd } from './hooks/useLetterboxd';
import { filterByMood } from './utils/moodFilter';
import { load, save, KEYS } from './utils/storage';

const MOCK_GAMES_AND_MUSIC = [
  {
    type: 'game',
    title: 'Hades',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg',
    genres: ['Action', 'Roguelike'],
    url: 'https://store.steampowered.com/app/1145360/',
  },
  {
    type: 'game',
    title: 'Stardew Valley',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
    genres: ['Casual', 'Relaxing', 'Cozy'],
    url: 'https://store.steampowered.com/app/413150/',
  },
  {
    type: 'music',
    title: 'Lo-fi Beats Mix',
    image: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    genres: ['Lo-fi', 'Chill'],
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
  },
  {
    type: 'music',
    title: 'Synthwave Drive',
    image: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    genres: ['Electronic', 'Synthwave'],
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
  },
];

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

  const allItems = useMemo(
    () => [...movies, ...MOCK_GAMES_AND_MUSIC],
    [movies]
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

      {moviesError && (
        <div className="text-red-400 text-sm mb-3">⚠️ {moviesError}</div>
      )}
      {moviesLoading && (
        <div className="text-gray-400 text-sm mb-3">
          Загружаем жанры из TMDB: {moviesProgress.done}/{moviesProgress.total}
        </div>
      )}

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
