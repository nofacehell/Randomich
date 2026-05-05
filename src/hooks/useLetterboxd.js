import { useEffect, useState } from 'react';
import { csvToObjects } from '../utils/csv';
import { lookupMovie } from '../utils/tmdb';

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Letterboxd watchlist CSV columns (as of 2024-2025):
// Date, Name, Year, Letterboxd URI
function parseWatchlist(csvText) {
  if (!csvText || !csvText.trim()) return [];
  const rows = csvToObjects(csvText);
  return rows
    .filter((r) => r.Name)
    .map((r) => ({
      type: 'movie',
      title: r.Name,
      year: r.Year ? parseInt(r.Year, 10) : null,
      url: r['Letterboxd URI'] || null,
      image: null,
      genres: [],
    }));
}

export function useLetterboxd(csvText) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!csvText) {
      setItems([]);
      setError(null);
      return;
    }

    let cancelled = false;
    const base = parseWatchlist(csvText);
    if (base.length === 0) {
      setItems([]);
      setError('CSV пустой или формат не распознан');
      return;
    }

    setItems(base);
    setError(null);

    if (!TMDB_KEY) {
      // No key — show titles without genres/posters. Mood filter for movies
      // will skip them (filter requires non-empty genres).
      return;
    }

    setLoading(true);
    setProgress({ done: 0, total: base.length });

    (async () => {
      const enriched = [...base];
      for (let i = 0; i < enriched.length; i++) {
        if (cancelled) return;
        const m = enriched[i];
        const { genres, image } = await lookupMovie(m.title, m.year, TMDB_KEY);
        enriched[i] = { ...m, genres, image };
        if (i % 5 === 0 || i === enriched.length - 1) {
          setItems([...enriched]);
          setProgress({ done: i + 1, total: enriched.length });
        }
      }
      if (!cancelled) {
        setItems(enriched);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [csvText]);

  return { items, loading, error, progress };
}
