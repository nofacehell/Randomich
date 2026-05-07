// Local dev proxy for Steam endpoints. The actual logic lives in
// api/_steam-core.js so prod (Vercel) and dev (Vite middleware) stay in sync.
import { handleSteam } from '../api/_steam-core.js';

export async function handler(req, res, url) {
  return handleSteam(req, res, url);
}

export default async function (req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  return handleSteam(req, res, url);
}
