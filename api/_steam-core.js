// Shared Steam handler used by both the Vite dev middleware (dev-api/steam.js)
// and the Vercel serverless function (api/steam.js). Talks to two upstream
// Steam endpoints that don't send CORS, so the browser has to go through us.

const APPDETAILS_PARALLEL_CAP = 20;

export async function handleSteam(req, res, url) {
  const params =
    url?.searchParams || new URL(req.url, 'http://x').searchParams;
  const action = params.get('action');

  if (action === 'wishlist') return wishlist(params, res);
  if (action === 'library') return library(params, res);
  if (action === 'appdetails') return appdetails(params, res);

  return json(res, 400, { error: 'unknown action' });
}

async function wishlist(params, res) {
  const steamid = params.get('steamid');
  if (!steamid || !/^\d{17}$/.test(steamid)) {
    return json(res, 400, { error: 'steamid must be a 17-digit number' });
  }

  const target = `https://api.steampowered.com/IWishlistService/GetWishlist/v1/?steamid=${steamid}`;
  const upstream = await fetch(target);

  if (!upstream.ok) {
    return json(res, 502, { error: 'upstream_error', status: upstream.status });
  }

  const data = await upstream.json();
  return json(
    res,
    200,
    { items: data?.response?.items || [] },
    { 'cache-control': 'public, max-age=300' }
  );
}

async function library(params, res) {
  const steamid = params.get('steamid');
  const apiKey = params.get('key');
  if (!steamid || !/^\d{17}$/.test(steamid)) {
    return json(res, 400, { error: 'steamid must be a 17-digit number' });
  }
  if (!apiKey) {
    return json(res, 400, {
      error: 'steam_key_required',
      message:
        'Steam Web API key required. Get one at https://steamcommunity.com/dev/apikey',
    });
  }

  const target =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${encodeURIComponent(apiKey)}` +
    `&steamid=${steamid}` +
    `&include_appinfo=true` +
    `&include_played_free_games=true` +
    `&format=json`;

  const upstream = await fetch(target);
  if (upstream.status === 401 || upstream.status === 403) {
    return json(res, upstream.status, {
      error: 'invalid_key_or_private',
      message:
        'Steam rejected the API key, or the profile’s game details are private.',
    });
  }
  if (!upstream.ok) {
    return json(res, 502, { error: 'upstream_error', status: upstream.status });
  }

  const data = await upstream.json();
  const games = data?.response?.games || [];
  // Shape down to what the client actually uses — avoids leaking playtime
  // details we don't need.
  const slim = games.map((g) => ({
    appid: g.appid,
    name: g.name,
    playtime_forever: g.playtime_forever || 0,
  }));
  return json(
    res,
    200,
    { games: slim },
    { 'cache-control': 'public, max-age=300' }
  );
}

async function appdetails(params, res) {
  const appids = params.get('appids');
  if (!appids) {
    return json(res, 400, { error: 'appids is required' });
  }

  // Steam appdetails reliably returns one app per call; chained appids are
  // ignored beyond the first. Fan out in parallel with a hard cap.
  const ids = appids.split(',').filter(Boolean).slice(0, APPDETAILS_PARALLEL_CAP);
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
        // single-app failure shouldn't kill the batch
      }
    })
  );

  return json(
    res,
    200,
    { apps: results },
    { 'cache-control': 'public, max-age=86400' }
  );
}

function json(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
}
