import { useEffect, useState } from 'react';
import { load, save } from '../utils/storage';

// Shared cache used by both wishlist and library — keyed by appid, so the
// same game enriched once works for either source.
const CACHE_KEY = 'steam-app-cache';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 10;

let cache = null;
function getCache() {
  if (cache === null) cache = load(CACHE_KEY, {});
  return cache;
}
function persist() {
  save(CACHE_KEY, cache);
}

// Hook factory: feed it an appid-list fetcher and an empty-message,
// it gives back the same {items, loading, error, progress} shape.
function useSteamSource({ fetchAppids, deps, emptyMessage, errorPrefix }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!fetchAppids) {
      setItems([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setProgress({ done: 0, total: 0 });

    (async () => {
      try {
        const appids = await fetchAppids();
        if (cancelled) return;

        if (!appids || appids.length === 0) {
          setItems([]);
          setLoading(false);
          setError(emptyMessage);
          return;
        }

        const c = getCache();
        const now = Date.now();
        const needFetch = appids.filter(
          (id) => !c[id] || now - c[id].t > TTL_MS
        );
        setProgress({
          done: appids.length - needFetch.length,
          total: appids.length,
        });

        for (let i = 0; i < needFetch.length; i += BATCH_SIZE) {
          if (cancelled) return;
          const batch = needFetch.slice(i, i + BATCH_SIZE);
          const r = await fetch(
            `/api/steam?action=appdetails&appids=${batch.join(',')}`
          );
          if (r.ok) {
            const { apps } = await r.json();
            for (const id of batch) {
              if (apps[id]) {
                c[id] = { t: now, ...apps[id] };
              } else {
                c[id] = { t: now, missing: true };
              }
            }
            persist();
          }
          setProgress({
            done:
              appids.length -
              needFetch.length +
              Math.min(i + BATCH_SIZE, needFetch.length),
            total: appids.length,
          });
        }

        if (cancelled) return;

        const games = appids
          .map((id) => {
            const entry = c[id];
            if (!entry || entry.missing) return null;
            return {
              type: 'game',
              title: entry.name,
              image: entry.header_image,
              genres: [
                ...(entry.genres || []),
                ...(entry.categories || []),
              ],
              url: `https://store.steampowered.com/app/${id}/`,
            };
          })
          .filter(Boolean);

        setItems(games);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(`${errorPrefix}: ${err.message || err}`);
        setItems([]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { items, loading, error, progress };
}

export function useSteam(steamId) {
  const validId = steamId && /^\d{17}$/.test(steamId);
  return useSteamSource({
    fetchAppids: validId
      ? async () => {
          const res = await fetch(
            `/api/steam?action=wishlist&steamid=${steamId}`
          );
          if (!res.ok) {
            const j = await safeJson(res);
            throw new Error(j?.error || `HTTP ${res.status}`);
          }
          const { items: wl } = await res.json();
          return wl.map((it) => String(it.appid));
        }
      : null,
    deps: [steamId],
    emptyMessage: 'Wishlist пуст или профиль приватный',
    errorPrefix: 'Steam wishlist',
  });
}

export function useSteamLibrary(steamId, apiKey) {
  const validId = steamId && /^\d{17}$/.test(steamId);
  const validKey = apiKey && apiKey.length >= 16;
  return useSteamSource({
    fetchAppids: validId && validKey
      ? async () => {
          const res = await fetch(
            `/api/steam?action=library&steamid=${steamId}&key=${encodeURIComponent(apiKey)}`
          );
          if (!res.ok) {
            const j = await safeJson(res);
            throw new Error(j?.message || j?.error || `HTTP ${res.status}`);
          }
          const { games } = await res.json();
          return games.map((g) => String(g.appid));
        }
      : null,
    deps: [steamId, apiKey],
    emptyMessage: 'Библиотека пуста или скрыта в настройках приватности',
    errorPrefix: 'Steam library',
  });
}

async function safeJson(r) {
  try {
    return await r.json();
  } catch {
    return null;
  }
}
