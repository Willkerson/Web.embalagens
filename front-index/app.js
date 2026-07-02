// ─────────────────────────────────────────────────────────────
// APP.JS
// ─────────────────────────────────────────────────────────────
async function carregarProdutos() {
  try {
    const [respProdutos, respImagens] = await Promise.all([
      fetch('front-index/produtos.json'),
      // produto-imagens.json é opcional: se ainda não existir ou der erro,
      // o site continua funcionando normalmente, só sem foto extra.
      fetch('front-index/produto-imagens.json').catch(function () { return null; })
    ]);

    if (!respProdutos.ok) {
      throw new Error(`Erro HTTP ${respProdutos.status}`);
    }

    const produtos = await respProdutos.json();

    let imagens = {};
    if (respImagens && respImagens.ok) {
      try {
        imagens = await respImagens.json();
      } catch (e) {
        console.warn('produto-imagens.json inválido, seguindo sem fotos extras.', e);
      }
    }

    window.produtos = produtos;

    // Garante campos mínimos + mescla imagem separada
    window.produtos.forEach(function (p, i) {
      // FIX: garante que todo produto tem campo "id" (usa codigo ou índice)
      if (!p.id) p.id = p.codigo || String(i);
      if (!p.categoria)    p.categoria    = 'todos';
      if (!p.subcategoria) p.subcategoria = '';
      if (!p.marca)        p.marca        = '';
      if (!p.estoque)      p.estoque      = 0;
      if (!p.preco)        p.preco        = 0;

      // ── Mescla imagem do arquivo separado (produto-imagens.json) ──
      // Chave usada: codigo do produto (fallback: id).
      // Nunca sobrescreve se o produtos.json já trouxer uma imagem própria.
      if (!p.imagem) {
        const img = imagens[p.codigo] || imagens[p.id];
        if (img) {
          p.imagem  = img.imagem  || img.url || '';
          p.imgmode = img.imgmode || 'thumbnail';
        }
      }
    });

    console.log(window.produtos.length + ' produtos carregados');
    console.log('Exemplo de produto:', window.produtos[0]); // DEBUG — remova depois

    estado.cat                = 'todos';
    estado.sub                = 'todas';
    estado.busca              = '';
    estado.marca              = 'todas';
    estado.precoFiltro        = null;
    estado.produtoSelecionado = null;
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
  estado.cat                = 'todos';
  estado.sub                = 'todas';
  estado.busca              = '';
  estado.marca              = 'todas';
  estado.precoFiltro        = null;
  estado.produtoSelecionado = null;
  if (typeof updateBadge === 'function') updateBadge();
  if (typeof renderizar  === 'function') renderizar();
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
