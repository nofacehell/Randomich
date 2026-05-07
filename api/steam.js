// Vercel serverless function. Mirrors the dev-api/steam.js handler.
import { handleSteam } from './_steam-core.js';

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  return handleSteam(req, res, url);
}
