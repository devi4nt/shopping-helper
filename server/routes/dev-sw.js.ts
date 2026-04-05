// Self-unregistering service worker shim.
//
// Some browsers have a stale service worker registered on localhost from a
// previous project (e.g. one that used vite-plugin-pwa / @vite-pwa/nuxt).
// That SW intercepts requests and caches responses with wrong MIME types,
// which breaks JS module loading in Safari and causes auth/cookie weirdness.
//
// When the browser fetches the SW script to update it, we return this
// payload, which unregisters itself, clears all caches, and reloads open
// tabs. After that the site behaves normally. See also server/routes/sw.js.ts
// which shares the same handler in case the stale SW was registered at /sw.js.
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
