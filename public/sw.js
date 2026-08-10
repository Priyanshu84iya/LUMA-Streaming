/**
 * LUMA Streaming PWA Service Worker
 * Caching Strategy:
 *  - App Shell (JS/CSS/fonts/icons): Cache-first with version update mechanism
 *  - API / Supabase / proxy calls: Network-only (no stale data)
 *  - Images (posters, backdrops): Stale-while-revalidate (max 100 entries, 7 days)
 *  - Video streams (.m3u8, .ts, .mp4 video): Network-only (never cache)
 *  - Offline fallback: serve offline.html for navigation requests when network fails
 */

const SHELL_CACHE = 'luma-shell-v3';
const IMAGE_CACHE = 'luma-images-v3';
const OFFLINE_URL = '/offline.html';

// Static assets that form the app shell
const SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/splash.png',
];

// Patterns that should NEVER be cached (network-only)
const NEVER_CACHE_PATTERNS = [
  /supabase\.co/,            // Supabase API / auth / realtime
  /functions\/v1/,           // Edge functions / proxy
  /\.m3u8($|\?)/,            // HLS manifests
  /\.ts($|\?)/,              // HLS segments
  /googlevideo\.com/,        // YouTube CDN
  /akamaihd\.net/,           // Akamai CDN (video)
  /cloudfront\.net\/.*\.(mp4|webm|mkv|ts)/i,  // CloudFront video
  /jwplatform\.com/,         // JW Player
  /stream\./,                // Generic stream subdomains
  /\/stream\//,              // Stream path segments
  /googleapis\.com\/gtv/,    // Google video test streams
  /mux\.dev/,                // Mux streams
  /raw\.githubusercontent\.com/, // Extension manifests/plugins (dynamic data)
];

// Patterns for images (stale-while-revalidate)
const IMAGE_PATTERNS = [
  /images\.unsplash\.com/,
  /image\.tmdb\.org/,
  /img\.omdbapi\.com/,
  /m\.media-amazon\.com/,
  /icons\/icon/,
  /icons\/splash/,
];

// -----------------------------------------------------------
// INSTALL: cache shell assets
// -----------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      // Cache shell assets, ignoring individual failures
      const results = await Promise.allSettled(
        SHELL_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Failed to cache shell asset:', url, err);
          })
        )
      );
      console.log('[SW] Shell cache populated:', results.length, 'assets');
    })
  );
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
});

// -----------------------------------------------------------
// ACTIVATE: clean up old caches
// -----------------------------------------------------------
self.addEventListener('activate', (event) => {
  const allowedCaches = [SHELL_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys
          .filter((k) => !allowedCaches.includes(k))
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      );
      // Take control of all clients immediately
      await self.clients.claim();
      console.log('[SW] Activated. Version:', SHELL_CACHE);
      // Notify clients that a new version is ready
      const allClients = await self.clients.matchAll({ type: 'window' });
      allClients.forEach((client) => {
        client.postMessage({ type: 'SW_UPDATED', version: SHELL_CACHE });
      });
    })
  );
});

// -----------------------------------------------------------
// FETCH: routing logic
// -----------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;

  // 1. Never-cache patterns → network only
  if (NEVER_CACHE_PATTERNS.some((p) => p.test(req.url))) {
    return; // Let browser handle natively
  }

  // 2. Image requests → stale-while-revalidate
  if (IMAGE_PATTERNS.some((p) => p.test(req.url))) {
    event.respondWith(staleWhileRevalidate(req, IMAGE_CACHE, 100));
    return;
  }

  // 3. Navigation requests (HTML pages) → network-first with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(req));
    return;
  }

  // 4. Same-origin static assets (JS, CSS, fonts, etc.) → cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 5. Google Fonts → cache-first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 6. Everything else (cross-origin non-image) → network only
  return;
});

// -----------------------------------------------------------
// Strategy: Cache-First
// -----------------------------------------------------------
async function cacheFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const network = await fetch(req);
    if (network.ok) {
      cache.put(req, network.clone());
    }
    return network;
  } catch {
    const offlineFallback = await caches.match(OFFLINE_URL);
    return offlineFallback || new Response('Offline', { status: 503 });
  }
}

// -----------------------------------------------------------
// Strategy: Stale-While-Revalidate (with LRU-style max count)
// -----------------------------------------------------------
async function staleWhileRevalidate(req, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  const networkFetch = fetch(req)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(req, response.clone());
        await trimCache(cache, maxEntries);
      }
      return response;
    })
    .catch(() => null);

  return cached || (await networkFetch) || new Response('Image unavailable', { status: 503 });
}

// -----------------------------------------------------------
// Strategy: Network-First with Offline Fallback
// -----------------------------------------------------------
async function networkFirstWithOfflineFallback(req) {
  try {
    const network = await fetch(req);
    if (network.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(req, network.clone());
    }
    return network;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Serve offline page for navigation requests
    const offlinePage = await caches.match(OFFLINE_URL);
    return (
      offlinePage ||
      new Response('<h1>You are offline</h1>', {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      })
    );
  }
}

// -----------------------------------------------------------
// Helper: Trim cache to max entries
// -----------------------------------------------------------
async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    await cache.delete(keys[0]);
  }
}

// -----------------------------------------------------------
// Background Sync: handle offline actions (future use)
// -----------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CHECK_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: SHELL_CACHE });
  }
});
