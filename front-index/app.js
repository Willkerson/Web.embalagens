async function carregarProdutos() {
  try {
    const resposta = await fetch('front-index/produtos.json');
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

    window.produtos = await resposta.json();

    // ── MAPEAMENTO: traduz categoria do JSON → categoria do site ──
    window.produtos.forEach(function(p) {
      var m = mapearProduto(p);       // vem do mapeamento.js
      p.categoria   = m.cat;          // sobrescreve com a chave do site
      p.subcategoria = m.sub || '';   // subcategoria ou vazio
    });
    // ─────────────────────────────────────────────────────────────

    console.log(`${window.produtos.length} produtos carregados`);
    estado.cat = 'todos';
    estado.sub = 'todas';
    estado.busca = '';
    estado.marca = 'todas';
    estado.precoFiltro = null;
    document.dispatchEvent(new CustomEvent('planilhaCarregada'));
  } catch (erro) {
    console.error('Erro ao carregar produtos.json', erro);
  }
}
carregarProdutos();

// ─────────────────────────────────────────────────────────────
// APP.JS — Inicialização da página
// ─────────────────────────────────────────────────────────────

function inicializarLoja() {

  restaurarCarrinho();

  // NÃO usar mais os filtros antigos da planilha
  // lerHash();

  estado.cat = 'todos';
  estado.sub = 'todas';
  estado.busca = '';
  estado.marca = 'todas';
  estado.precoFiltro = null;

  updateBadge();
  renderizar();
}

document.addEventListener(
  'planilhaCarregada',
  function () {

    if (document.readyState === 'loading') {

      document.addEventListener(
        'DOMContentLoaded',
        inicializarLoja
      );

    } else {

      inicializarLoja();

    }
  },
  { once: true }
);
