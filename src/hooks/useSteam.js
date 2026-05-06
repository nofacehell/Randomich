import { useEffect, useState } from 'react';
import { load, save } from '../utils/storage';

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

export function useSteam(steamId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!steamId) {
      setItems([]);
      setError(null);
      return;
    }
    if (!/^\d{17}$/.test(steamId)) {
      setError('Steam ID должен быть 17-значным числом (64-bit)');
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setProgress({ done: 0, total: 0 });

    (async () => {
      try {
        const wlRes = await fetch(
          `/api/steam?action=wishlist&steamid=${steamId}`
        );
        if (!wlRes.ok) {
          const j = await safeJson(wlRes);
          throw new Error(j?.error || `wishlist fetch failed (${wlRes.status})`);
        }
        const { items: wl } = await wlRes.json();
        if (cancelled) return;

        if (!wl || wl.length === 0) {
          setItems([]);
          setLoading(false);
          setError('Wishlist пуст или профиль приватный');
          return;
        }

        const appids = wl.map((it) => String(it.appid));
        const c = getCache();
        const now = Date.now();
        const needFetch = appids.filter(
          (id) => !c[id] || now - c[id].t > TTL_MS
        );

        setProgress({ done: appids.length - needFetch.length, total: appids.length });

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
                // Mark as missing so we don't refetch every load
                c[id] = { t: now, missing: true };
              }
            }
            persist();
          }
          setProgress({
            done: appids.length - needFetch.length + Math.min(i + BATCH_SIZE, needFetch.length),
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
              genres: [...(entry.genres || []), ...(entry.categories || [])],
              url: `https://store.steampowered.com/app/${id}/`,
            };
          })
          .filter(Boolean);

        setItems(games);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Не удалось загрузить wishlist');
        setItems([]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [steamId]);

  return { items, loading, error, progress };
}

async function safeJson(r) {
  try { return await r.json(); } catch { return null; }
}
