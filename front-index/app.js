// ─────────────────────────────────────────────────────────────
// CARREGA produtos.json
// ─────────────────────────────────────────────────────────────

window.produtos = [];

window.prods = function() {
    return window.produtos || [];
};

async function carregarProdutos() {
  try {

    const resposta = await fetch('front-index/produtos.json');

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    window.produtos = await resposta.json();

    console.log(`${window.produtos.length} produtos carregados`);

    // força filtros zerados
    estado.cat = 'todos';
    estado.sub = 'todas';
    estado.busca = '';
    estado.marca = 'todas';
    estado.precoFiltro = null;

    document.dispatchEvent(
      new CustomEvent('planilhaCarregada')
    );

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
