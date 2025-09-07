const CACHE_NAME = "packmybag-v2";
const OFFLINE_URL = "offline.html";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      return cache.addAll(["./", "./index.html", "./manifest.json", "./offline.html", "./icon-192.png", "./icon-512.png"]);
    })
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(k => { if(k!==CACHE_NAME) return caches.delete(k); }))
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).catch(()=>caches.match(e.request).then(r=>r || caches.match(OFFLINE_URL)))
  );
});
