// TMDB lookup for poster + genres. Caches per (title, year) in localStorage
// with a 30-day TTL — genres rarely change and watchlists can be large.
import { load, save } from './storage';

const CACHE_KEY = 'tmdb-cache';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

let cache = null;
function getCache() {
  if (cache === null) cache = load(CACHE_KEY, {});
  return cache;
}
function persist() {
  save(CACHE_KEY, cache);
}

// TMDB free-tier genre IDs — small enough to embed; saves a /genre/movie/list call.
const GENRE_NAMES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

export async function lookupMovie(title, year, apiKey) {
  if (!apiKey) return { genres: [], image: null };

  const key = `${title.toLowerCase()}|${year || ''}`;
  const c = getCache();
  const hit = c[key];
  if (hit && Date.now() - hit.t < TTL_MS) {
    return { genres: hit.genres, image: hit.image };
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    query: title,
    include_adult: 'false',
  });
  if (year) params.set('primary_release_year', String(year));

  let result = { genres: [], image: null };
  try {
    const r = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
    if (r.ok) {
      const json = await r.json();
      const top = json?.results?.[0];
      if (top) {
        result = {
          genres: (top.genre_ids || []).map((id) => GENRE_NAMES[id]).filter(Boolean),
          image: top.poster_path ? POSTER_BASE + top.poster_path : null,
        };
      }
    }
  } catch {
    // network/CORS — fall through with empty result, still cache to avoid retry storms
  }

  c[key] = { t: Date.now(), genres: result.genres, image: result.image };
  persist();
  return result;
}
