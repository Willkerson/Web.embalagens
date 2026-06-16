// ─────────────────────────────────────────────────────────────
// PRODUTOS_LOADER.JS
// Substitui o antigo produtos_planilha.js
// Faz fetch de produtos.json + imagens.json, monta
// window.produtos e avisa os scripts dependentes.
// ─────────────────────────────────────────────────────────────

(function () {
  // ── Caminhos dos JSONs (ajuste se mudar de pasta) ──────────
  var BASE = 'front-index/data/';          // pasta dos JSONs
  var URL_PRODUTOS = BASE + 'produtos.json';
  var URL_IMAGENS  = BASE + 'imagens.json';

  // ── Evento que avisa que os dados estão prontos ────────────
  // app.js e admin-data.js escutam 'planilhaCarregada'
  function dispararEvento() {
    document.dispatchEvent(new Event('planilhaCarregada'));
  }

  // ── Combina os dois JSONs no formato esperado pelos scripts ─
  function combinar(produtos, imagens) {
    return produtos.map(function (p) {
      var img = imagens[p.id] || null;
      if (img && !p.imagem) {          // só injeta se o produto não tiver imagem própria
        p.imagem   = img.imagem   || img;   // suporta string simples OU objeto {imagem, imgmode}
        p.imgmode  = img.imgmode  || 'thumbnail';
      }
      return p;
    });
  }

  // ── Fetch paralelo ─────────────────────────────────────────
  Promise.all([
    fetch(URL_PRODUTOS).then(function (r) {
      if (!r.ok) throw new Error('Erro ao carregar produtos.json: ' + r.status);
      return r.json();
    }),
    fetch(URL_IMAGENS).then(function (r) {
      if (!r.ok) throw new Error('Erro ao carregar imagens.json: ' + r.status);
      return r.json();
    })
  ])
  .then(function (resultados) {
    var produtos = resultados[0];
    var imagens  = resultados[1];
    window.produtos = combinar(produtos, imagens);
    dispararEvento();
  })
  .catch(function (erro) {
    console.error('[Loader] Falha ao carregar dados:', erro);
    // Mesmo com erro dispara o evento (site abre vazio em vez de travar)
    window.produtos = [];
    dispararEvento();
  });
})();
