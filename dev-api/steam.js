// Local dev proxy for Steam endpoints (no CORS in prod either, so the
// same handler shape will be reused as a Vercel /api/steam.js function).
//
// Modes (selected by ?action=...):
//   wishlist&steamid=...     → IWishlistService/GetWishlist
//   appdetails&appids=1,2,3  → store appdetails for up to ~20 apps

export async function handler(req, res, url) {
  const params =
    url?.searchParams || new URL(req.url, 'http://x').searchParams;
  const action = params.get('action');

  if (action === 'wishlist') {
    return wishlist(params, res);
  }
  if (action === 'appdetails') {
    return appdetails(params, res);
  }

  res.statusCode = 400;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ error: 'unknown action' }));
}

async function wishlist(params, res) {
  const steamid = params.get('steamid');
  if (!steamid || !/^\d{17}$/.test(steamid)) {
    res.statusCode = 400;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'steamid must be a 17-digit number' }));
    return;
  }

  const target = `https://api.steampowered.com/IWishlistService/GetWishlist/v1/?steamid=${steamid}`;
  const upstream = await fetch(target);

  if (!upstream.ok) {
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'upstream_error', status: upstream.status }));
    return;
  }

  const json = await upstream.json();
  const items = json?.response?.items || [];

  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'public, max-age=300');
  res.end(JSON.stringify({ items }));
}

async function appdetails(params, res) {
  const appids = params.get('appids');
  if (!appids) {
    res.statusCode = 400;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'appids is required' }));
    return;
  }

  // Steam appdetails returns one app per call reliably; chained appids tend
  // to be ignored. Fan out in parallel, with a small concurrency limit.
  const ids = appids.split(',').filter(Boolean).slice(0, 20);
  const results = {};

  await Promise.all(
    ids.map(async (id) => {
      try {
        const r = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=en`
        );
        if (!r.ok) return;
        const j = await r.json();
        const entry = j?.[id];
        if (entry?.success && entry.data) {
          results[id] = {
            name: entry.data.name,
            header_image: entry.data.header_image,
            genres: (entry.data.genres || []).map((g) => g.description),
            categories: (entry.data.categories || []).map((c) => c.description),
          };
        }
      } catch {
        // skip
      }
    })
  );

  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'public, max-age=86400');
  res.end(JSON.stringify({ apps: results }));
}

export default async function (req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  return handler(req, res, url);
}
