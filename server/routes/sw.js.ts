// See server/routes/dev-sw.js.ts for full context — identical self-
// unregistering shim served at /sw.js in case the stale service worker
// from a previous project on localhost was registered at that path.
const SCRIPT = `
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    } catch {}
    try {
      await self.registration.unregister()
    } catch {}
    try {
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        try { client.navigate(client.url) } catch {}
      }
    } catch {}
  })())
})
self.addEventListener('fetch', () => {})
`

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'application/javascript; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  return SCRIPT
})
