// ─────────────────────────────────────────────────────────────
// APP.JS
// ─────────────────────────────────────────────────────────────
async function carregarProdutos() {
  try {
    const resposta = await fetch('front-index/produtos.json');
    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }
    window.produtos = await resposta.json();
    // Garante campos mínimos
    window.produtos.forEach(function(p) {
      if (!p.categoria)   p.categoria   = 'todos';
      if (!p.subcategoria) p.subcategoria = '';
      if (!p.marca)       p.marca       = '';
      if (!p.estoque)     p.estoque     = 0;
      if (!p.preco)       p.preco       = 0;
    });
    console.log(window.produtos.length + ' produtos carregados');
    estado.cat               = 'todos';
    estado.sub               = 'todas';
    estado.busca             = '';
    estado.marca             = 'todas';
    estado.precoFiltro       = null;
    estado.produtoSelecionado = null; // FIX
    document.dispatchEvent(new CustomEvent('planilhaCarregada'));
  } catch (erro) {
    console.error('Erro ao carregar produtos.json', erro);
  }
}
carregarProdutos();

// ─────────────────────────────────────────────────────────────
// Inicialização
// ─────────────────────────────────────────────────────────────
function inicializarLoja() {
  if (typeof restaurarCarrinho === 'function') restaurarCarrinho();
  estado.cat               = 'todos';
  estado.sub               = 'todas';
  estado.busca             = '';
  estado.marca             = 'todas';
  estado.precoFiltro       = null;
  estado.produtoSelecionado = null; // FIX
  if (typeof updateBadge  === 'function') updateBadge();
  if (typeof renderizar   === 'function') renderizar();
}

document.addEventListener(
  'planilhaCarregada',
  function() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inicializarLoja);
    } else {
      inicializarLoja();
    }
  },
  { once: true }
);
