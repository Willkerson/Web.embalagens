// ─────────────────────────────────────────────────────────────
// APP.JS
// ─────────────────────────────────────────────────────────────
async function carregarProdutos() {
  try {
    const [respProdutos, respImagens, respVisibilidade] = await Promise.all([
      fetch('front-index/produtos.json'),
      // produto-imagens.json e produto-visibilidade.json são opcionais: se
      // ainda não existirem ou derem erro, o site continua funcionando
      // normalmente (sem foto extra / sem nada desativado).
      fetch('front-index/produto-imagens.json').catch(function () { return null; }),
      fetch('front-index/produto-visibilidade.json').catch(function () { return null; })
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

    let visibilidade = {};
    if (respVisibilidade && respVisibilidade.ok) {
      try {
        visibilidade = await respVisibilidade.json();
      } catch (e) {
        console.warn('produto-visibilidade.json inválido, seguindo sem ocultar nada.', e);
      }
    }

    window.produtos = produtos;

    // Garante campos mínimos + mescla imagem separada
    window.produtos.forEach(function (p, i) {
      // FIX: garante que todo produto tem campo "id" (usa codigo ou índice)
      if (!p.id) p.id = p.codigo || String(i);

      // FIX CRÍTICO: até aqui p.categoria era a string BRUTA que vem do
      // ConnectPlug (ex: "PRODUTO DE LIMPEZA", "Embalagem", "-"...), que
      // nunca bate com as chaves usadas pelos filtros do site (caixas,
      // sacolas, festa...). Isso fazia toda aba do menu (fora "Todos")
      // sempre dar 0 resultado. Aqui chamamos mapearProduto(), que já
      // existia em mapeamento.js mas nunca era usado, pra traduzir de
      // verdade a categoria/subcategoria antes de qualquer filtro rodar.
      var mapeado = (typeof mapearProduto === 'function')
        ? mapearProduto(p)
        : { cat: 'diversos', sub: 'outros' };
      p.categoria    = mapeado.cat || 'diversos';
      p.subcategoria = mapeado.sub || '';

      // FIX: extrai a marca (fabricante) a partir do nome do produto —
      // ex: "SACOLA KRAFT M 1UN 19X12X26 DANUBIO" → marca "DANUBIO".
      // Isso ativa as sub-abas de marca que já existiam em filtros.js
      // mas nunca apareciam porque p.marca nunca era preenchido.
      p.marca = (typeof extrairMarca === 'function') ? extrairMarca(p.nome) : '';

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

      // ── Produto desativado da loja (produto-visibilidade.json) ──
      // Reaproveita o mesmo campo "oculto" que o restante do site já
      // respeita pra não mostrar no catálogo — mas o estoque.html não usa
      // esse arquivo pra nada, então o produto continua aparecendo lá
      // normalmente pro controle de estoque.
      if (visibilidade[p.codigo] || visibilidade[p.id]) {
        p.oculto = true;
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
