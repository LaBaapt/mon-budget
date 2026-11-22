// Service worker : garde une copie de l'app sur le téléphone pour qu'elle marche hors ligne.
// - Les pages : on essaie d'abord internet (pour avoir la dernière version), sinon la copie.
// - Les autres fichiers (scripts, styles, icônes) : la copie d'abord, sinon internet.
// Tes données, elles, ne passent jamais par ici : elles restent dans IndexedDB.

const CACHE = 'mon-budget-v1';
const BASE = new URL('./', self.location).pathname; // "/mon-budget/"

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([BASE, `${BASE}manifest.webmanifest`])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Supprime les anciennes copies
  event.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requete = event.request;
  if (requete.method !== 'GET' || !requete.url.startsWith(self.location.origin)) return;

  if (requete.mode === 'navigate') {
    event.respondWith(
      fetch(requete)
        .then((reponse) => {
          const copie = reponse.clone();
          caches.open(CACHE).then((cache) => cache.put(BASE, copie));
          return reponse;
        })
        .catch(() => caches.match(BASE)),
    );
    return;
  }

  event.respondWith(
    caches.match(requete).then(
      (enCache) =>
        enCache ||
        fetch(requete).then((reponse) => {
          if (reponse.ok) {
            const copie = reponse.clone();
            caches.open(CACHE).then((cache) => cache.put(requete, copie));
          }
          return reponse;
        }),
    ),
  );
});
