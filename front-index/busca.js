// ─────────────────────────────────────────────────────────────
// BUSCA.JS — Sugestões de busca e handlers do campo de pesquisa
// ─────────────────────────────────────────────────────────────
function precoNum(valor) {
  return parseFloat(String(valor).replace(',', '.'));
}
var _debouncedSearch = debounce(function(q) { mostrarSugestoes(q); }, 120);

// A caixa de sugestões é posicionada via CSS (position:absolute, relativo
// a #searchWrap que tem position:relative — ver estilo.css e mobile.css).
// Isso já a mantém sempre colada embaixo do campo de busca, tanto no
// desktop quanto no mobile.
//
// OBS: antes isso era feito calculando pixels exatos em JS com
// position:fixed a partir de inp.getBoundingClientRect(). O problema é
// que no iOS, quando o teclado virtual abre, a página rola pra manter o
// campo visível acima do teclado — mas esse scroll nem sempre dispara o
// evento "scroll" da window (é o visualViewport que muda). Resultado: a
// caixa ficava "grudada" na posição antiga (lá em cima), enquanto o campo
// de busca real descia pra perto do teclado — cobrindo a barra de busca
// com a lista de sugestões. Usar position:absolute (relativo ao próprio
// container do campo) elimina esse cálculo manual e o bug junto.
function posicionarSugestoes() {
  // Mantido como no-op por compatibilidade com as chamadas existentes.
  // O posicionamento agora é 100% CSS.
}

function esconderSugestoes() {
  var el = document.getElementById('searchSuggestions');
  if (el) { el.classList.remove('on'); el.innerHTML = ''; }
}

function handleSearchFocus() {
  var q = document.getElementById('searchInput').value.trim();
  if (q.length >= 2) mostrarSugestoes(q);
}

document.addEventListener('DOMContentLoaded', function() {

  // Reposiciona se a página rolar ou o teclado mudar o tamanho da tela
  window.addEventListener('resize', posicionarSugestoes);
  window.addEventListener('scroll', posicionarSugestoes, { passive: true });

  var inp = document.getElementById('searchInput');

  if (inp) {
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') confirmarBuscaCompleta();
    });
  }

  // Fecha as sugestões só quando o toque/clique é de fato FORA da barra
  // de busca. Isso substitui o antigo "fecha ao perder o foco (blur)",
  // que fechava a caixa sozinho ao rolar a página ou ao tocar no botão
  // "OK"/"Buscar" do teclado do celular antes do clique registrar.
  document.addEventListener('touchstart', function(e) {
    if (!e.target.closest('#searchWrap')) esconderSugestoes();
  }, { passive: true });

  document.addEventListener('mousedown', function(e) {
    if (!e.target.closest('#searchWrap')) esconderSugestoes();
  });

});

function _extrairPreco(texto) {
  if (!texto) return null;

  // Remove "R$", troca ponto de milhar por nada, vírgula decimal por ponto
  texto = String(texto)
    .replace(/[Rr]\$/g, '')
    .replace(/\./g, '')      // remove pontos de milhar: "1.234,56" → "1234,56"
    .replace(',', '.')        // vírgula decimal → ponto: "1234,56" → "1234.56"
    .trim();

  var num = parseFloat(texto);

  return isNaN(num) ? null : num;
}
// ══════════════════════════════════════════════════════════════
// MOSTRAR SUGESTÕES (busca por nome/marca + busca por preço)
// ══════════════════════════════════════════════════════════════
function mostrarSugestoes(query) {
  var box = document.getElementById('searchSuggestions');
  if (!box) return;
  if (!query || query.length < 2) { esconderSugestoes(); return; }

  // ── Busca simples por nome/marca — mostra SÓ o nome do produto,
  //    sem código, sem categoria, sem preço. ──────────────────────
  var qNorm = normalizar(query);

  var todosProds = prods().filter(function(p) {
    return !p.oculto && estoqueNum(p.estoque) > 0;
  });

  var diretos = todosProds.filter(function(p) {
    var nNorm = normalizar(p.nome);
    var mNorm = normalizar(p.marca || '');
    return nNorm.includes(qNorm) || mNorm.includes(qNorm);
  });

  var palavras = qNorm.split(/\s+/).filter(Boolean);
  var idsDiretos = diretos.map(function(p) { return p.id; });

  var porPalavras = palavras.length > 1
    ? todosProds.filter(function(p) {
        if (idsDiretos.indexOf(p.id) >= 0) return false;
        var nNorm = normalizar(p.nome) + ' ' + normalizar(p.marca || '');
        return palavras.every(function(w) { return nNorm.includes(w); });
      })
    : [];

  var encontrados = diretos.concat(porPalavras);

  var idsJaVistos = encontrados.map(function(p) { return p.id; });
  var fuzzyProds = [];
  if (encontrados.length < 3) {
    fuzzyProds = buscaFuzzy(query)
      .filter(function(r) { return r.score >= 45 && idsJaVistos.indexOf(r.prod.id) < 0; })
      .map(function(r) { return r.prod; })
      .slice(0, 4);
  }

  if (!encontrados.length && !fuzzyProds.length) { esconderSugestoes(); return; }

  function itemHTML(p, nomeExibido, parecido) {
    var preco = precoNum(p.preco);
    var precoTxt = preco > 0
      ? '<span class="sug-price">R$ ' + preco.toFixed(2).replace('.', ',') + '</span>'
      : '';
    return '<div class="search-sug-item' + (parecido ? ' sug-parecido' : '') + '" onclick="selecionarSugestao(\'' + p.id + '\')">' +
      '<span class="sug-name">' + nomeExibido + '</span>' +
      precoTxt +
    '</div>';
  }

  var html = '';
  var limite = 8;

  encontrados.slice(0, limite).forEach(function(p) {
    html += itemHTML(p, highlightMatch(p.nome, query), false);
  });

  if (encontrados.length > limite) {
    html += '<div class="sug-ver-todos" onclick="confirmarBuscaCompleta()">Ver todos os ' + encontrados.length + ' resultados →</div>';
  }

  if (fuzzyProds.length) {
    html += '<div class="sug-section-label">🔎 Você quis dizer?</div>';
  }
  fuzzyProds.forEach(function(p) {
    html += itemHTML(p, p.nome, true);
  });

  box.innerHTML = html;
  posicionarSugestoes();
  box.classList.add('on');
}

// ── Confirma busca completa e filtra por preço ou texto ──────
function confirmarBuscaCompleta() {
  var inp = document.getElementById('searchInput');
  var q = inp ? inp.value.trim() : '';
  var precoQuery = _extrairPreco(q);

  esconderSugestoes();
  estado.produtoSelecionado = null; // FIX: limpa seleção anterior

  if (precoQuery !== null) {
    // FIX: era "estado.busca = prod.nome.toLowerCase()" — prod não existe aqui
    estado.busca       = '';
    estado.precoFiltro = precoQuery;
    estado.cat         = 'todos';
    estado.sub         = 'todas';
    estado.marca       = 'todas';
    document.querySelectorAll('.ftab').forEach(function(b) { b.classList.remove('on'); });
    var all = document.querySelector('.ftab[data-cat="todos"]');
    if (all) all.classList.add('on');
    document.querySelectorAll('.subtabs').forEach(function(b) { b.classList.remove('on'); });
    document.getElementById('brandFilterWrap').classList.remove('on');
  } else {
    estado.busca       = q.toLowerCase();
    estado.precoFiltro = null;
  }

  renderizar();
  var c = document.getElementById('containerProdutos');
  if (c) setTimeout(function() { c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
}

// selecionarSugestao está definida em render.js — não duplicar aqui

function limparBusca() {
  estado.busca              = '';
  estado.precoFiltro        = null;
  estado.produtoSelecionado = null; // FIX: limpa seleção anterior
  var inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  esconderSugestoes();
}

function buscarPorTermo(termo) {
  limparBusca();
  estado.cat         = 'todos';
  estado.sub         = 'todas';
  estado.marca       = 'todas';
  estado.busca       = termo.toLowerCase();
  estado.precoFiltro = null;
  document.getElementById('searchInput').value = termo;
  document.querySelectorAll('.ftab').forEach(function(b) { b.classList.remove('on'); });
  var all = document.querySelector('.ftab[data-cat="todos"]');
  if (all) all.classList.add('on');
  document.querySelectorAll('.subtabs').forEach(function(b) { b.classList.remove('on'); });
  document.getElementById('brandFilterWrap').classList.remove('on');
  fecharNav();
  renderizar();
  setTimeout(function() {
    var c = document.getElementById('containerProdutos');
    if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

function handleSearch(e) {
  var q = e.target.value;
  estado.busca              = q.toLowerCase();
  estado.precoFiltro        = null;
  estado.produtoSelecionado = null; // FIX: limpa seleção anterior ao digitar

  if (q.length >= 2) {
    estado.cat   = 'todos';
    estado.sub   = 'todas';
    estado.marca = 'todas';
    document.querySelectorAll('.ftab').forEach(function(b) { b.classList.remove('on'); });
    var all = document.querySelector('.ftab[data-cat="todos"]');
    if (all) all.classList.add('on');
    document.querySelectorAll('.subtabs').forEach(function(b) { b.classList.remove('on'); });
    document.getElementById('brandFilterWrap').classList.remove('on');
    _debouncedSearch(q);
  } else {
    // FIX: ao apagar o campo, esconde sugestões e re-renderiza todos os produtos
    esconderSugestoes();
  }

  _debouncedRender();
}
