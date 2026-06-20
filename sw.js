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

  // força ativação imediata
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

// FETCH (corrigido para não quebrar arquivos JS/HTML)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // só cacheia respostas válidas
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
