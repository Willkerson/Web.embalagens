const CACHE = "loja-v2";
const ARQUIVOS = [
  "/index.html",
  "/manifest.json",
  "/front-index/config.js",
  "/front-index/utils.js",
  "/front-index/busca.js",
  "/front-index/filtros.js",
  "/front-index/render.js",
  "/front-index/carrinho.js",
  "/front-index/checkout.js",
  "/front-index/nav.js",
  "/front-index/mobile-fix.js",
  "/front-index/app.js",
  "/front-index/estilo.css",
  "/front-index/mobile.css"
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

// FETCH — network-first, cai pro cache só se estiver offline.
// Isso garante que produtos.json/produto-imagens.json (que mudam com
// frequência pela automação) sempre tentem vir atualizados da rede.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignora requisições externas (API GitHub, CDNs, etc) — browser lida direto
  if (url.origin !== self.location.origin) {
    return;
  }

  // Ignora métodos não-GET (POST, PUT, PATCH, DELETE)
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