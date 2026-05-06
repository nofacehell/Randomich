import { useEffect, useState } from 'react';

const YOUTUBE_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Accepts either a bare playlistId or any URL containing ?list=...
export function extractPlaylistId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    return u.searchParams.get('list');
  } catch {
    return null;
  }
}

export function useYoutube(playlistUrl) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playlistUrl) {
      setItems([]);
      setError(null);
      return;
    }
    if (!YOUTUBE_KEY) {
      setError('YouTube API key не настроен (VITE_YOUTUBE_API_KEY)');
      return;
    }
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError('Не удалось распознать playlistId в URL');
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const all = [];
        let pageToken = '';
        // Hard cap at 200 tracks — keeps quota sane for huge playlists.
        for (let page = 0; page < 4; page++) {
          if (cancelled) return;
          const params = new URLSearchParams({
            part: 'snippet',
            maxResults: '50',
            playlistId,
            key: YOUTUBE_KEY,
          });
          if (pageToken) params.set('pageToken', pageToken);
          const r = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?${params}`
          );
          if (!r.ok) {
            const j = await r.json().catch(() => null);
            const msg =
              j?.error?.message || `playlistItems failed (${r.status})`;
            throw new Error(msg);
          }
          const data = await r.json();
          for (const it of data.items || []) {
            const s = it.snippet;
            const videoId = s?.resourceId?.videoId;
            if (!videoId || !s?.title || s.title === 'Private video' || s.title === 'Deleted video') {
              continue;
            }
            all.push({
              type: 'music',
              title: s.title,
              image:
                s.thumbnails?.medium?.url ||
                s.thumbnails?.default?.url ||
                null,
              genres: [],
              url: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
            });
          }
          pageToken = data.nextPageToken || '';
          if (!pageToken) break;
        }
        if (cancelled) return;
        setItems(all);
        setLoading(false);
        if (all.length === 0) setError('Плейлист пустой или приватный');
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Не удалось загрузить плейлист');
        setItems([]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [playlistUrl]);

  return { items, loading, error };
}
