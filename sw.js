const CACHE = "loja-v1";
const ARQUIVOS = [
  "/Web.embalagens/index.html",
  "/Web.embalagens/manifest.json",
  "/Web.embalagens/front-index/config.js",
  "/Web.embalagens/front-index/utils.js",
  "/Web.embalagens/front-index/busca.js",
  "/Web.embalagens/front-index/filtros.js",
  "/Web.embalagens/front-index/render.js",
  "/Web.embalagens/front-index/carrinho.js",
  "/Web.embalagens/front-index/checkout.js",
  "/Web.embalagens/front-index/nav.js",
  "/Web.embalagens/front-index/mobile-fix.js",
  "/Web.embalagens/front-index/app.js",
  "/Web.embalagens/front-index/estilo.css",
  "/Web.embalagens/front-index/mobile.css"
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
