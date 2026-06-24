/*
 * NEXUS v3 — Service Worker
 * Permet l'installation en PWA sur Android et la mise en cache de l'interface.
 * Les appels API Anthropic passent toujours par le réseau (pas de cache).
 */

const CACHE = 'nexus-v3';
const FICHIERS = ['./NEXUS-v3.html', './nexus-manifest.json'];

// Installation : mise en cache des fichiers de l'app
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FICHIERS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cles =>
      Promise.all(cles.filter(c => c !== CACHE).map(c => caches.delete(c)))
    )
  );
  self.clients.claim();
});

// Stratégie de cache : Network First pour les API, Cache First pour l'interface
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Les appels Anthropic passent TOUJOURS par le réseau — jamais en cache
  if (url.hostname.includes('anthropic.com') ||
      url.hostname.includes('finnhub.io') ||
      url.hostname.includes('fonts.googleapis.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Interface : Cache First (rapide, fonctionne hors-ligne)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
