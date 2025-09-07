const CACHE_NAME = "packingfriend-v7";
const OFFLINE_PAGE = "./offline.html";
const PRECACHE = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  OFFLINE_PAGE
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if(event.request.mode === 'navigate'){
    event.respondWith(
      fetch(event.request).then(resp => {
        // put in cache for offline
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return resp;
      }).catch(() => caches.match(OFFLINE_PAGE))
    );
    return;
  }

  // for resources: try cache first then network (cache warm)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(resp => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resp.clone()));
        return resp;
      }).catch(()=>undefined);
    })
  );
});
