import { useState } from 'react';
import Wheel from './components/Wheel';
import ResultModal from './components/ResultModal';
import Settings from './components/Settings';
import { load, save, KEYS } from './utils/storage';

const MOCK_ITEMS = [
  {
    type: 'movie',
    title: 'The Grand Budapest Hotel',
    image: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    genres: ['Comedy', 'Drama'],
    url: 'https://letterboxd.com/film/the-grand-budapest-hotel/',
  },
  {
    type: 'movie',
    title: 'Blade Runner 2049',
    image: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    genres: ['Sci-Fi', 'Drama'],
    url: 'https://letterboxd.com/film/blade-runner-2049/',
  },
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
    genres: ['Casual', 'Relaxing'],
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

const DEFAULT_SETTINGS = { letterboxd: '', steamId: '', youtube: '' };

export default function App() {
  const [result, setResult] = useState(null);
  const [settings, setSettings] = useState(() =>
    load(KEYS.settings, DEFAULT_SETTINGS)
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
      <Wheel items={MOCK_ITEMS} onResult={setResult} />
      <ResultModal
        result={result}
        onClose={() => setResult(null)}
        onSpinAgain={() => setResult(null)}
      />
    </div>
  );
}
