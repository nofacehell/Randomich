// GET /api/steam?steamid=...
// Stub for stage 6 — Steam wishlist proxy will be implemented next.

export async function handler(req, res) {
  res.statusCode = 501;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ error: 'not_implemented_yet' }));
}

export default handler;
