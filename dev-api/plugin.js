// Vite plugin that mirrors the Vercel /api/* routes during local dev.
// Each route here should have a matching api/<name>.js Vercel function
// so prod and dev share the same fetch surface.

import { handler as steamHandler } from './steam.js';

const ROUTES = {
  '/api/steam': steamHandler,
};

export function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const handler = ROUTES[url.pathname];
        if (!handler) return next();

        try {
          await handler(req, res, url);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: String(err?.message || err) }));
        }
      });
    },
  };
}
