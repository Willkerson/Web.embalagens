const CACHE = "estoque-v2";
const ARQUIVOS = [
  "/Web.embalagens/estoque.html",
  "/Web.embalagens/app.js",
  "/Web.embalagens/manifest.json",
  "/Web.embalagens/front-index/produtos.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ARQUIVOS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ✅ Ignora requisições externas (API GitHub, etc) — browser lida diretamente
  if (url.origin !== self.location.origin) {
    return;
  }

  // ✅ Ignora métodos não-GET (POST, PUT, PATCH, DELETE)
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          !response ||
          response.status !== 200 ||
          response.type !== "basic"
        ) {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
