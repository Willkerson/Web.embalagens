// ─────────────────────────────────────────────────────────────
// BUSCA.JS — Sugestões de busca e handlers do campo de pesquisa
// ─────────────────────────────────────────────────────────────

var _sugTimeout = null;
var _debouncedSearch = debounce(function(q) { mostrarSugestoes(q); }, 120);

function esconderSugestoes() {
  var el = document.getElementById('searchSuggestions');
  if (el) { el.classList.remove('on'); el.innerHTML = ''; }
}

function hideSuggestionsDelayed() {
  _sugTimeout = setTimeout(esconderSugestoes, 200);
}

function handleSearchFocus() {
  clearTimeout(_sugTimeout);
  var q = document.getElementById('searchInput').value.trim();
  if (q.length >= 2) mostrarSugestoes(q);
}

// ── BUSCA POR TODAS AS PALAVRAS (resolve "garrafa pet 500ml") ──
// Retorna true se TODAS as palavras da query aparecem no nome do produto
function contemTodasPalavras(nome, query) {
  var nomeLower = nome.toLowerCase();
  var palavras  = query.toLowerCase().trim().split(/\s+/);
  return palavras.every(function(p) { return nomeLower.indexOf(p) >= 0; });
}

function mostrarSugestoes(query) {
  var box = document.getElementById('searchSuggestions');
  if (!box) return;
  if (!query || query.length < 2) { esconderSugestoes(); return; }

  var q = query.toLowerCase().trim();

  // 1º — busca exata por todas as palavras (prioridade máxima)
  var todosProd   = prods ? prods() : (window.listaProdutosPlanilha || []);
  var exatosPalavras = todosProd.filter(function(p) {
    return !isEsgotado(p) && contemTodasPalavras(p.nome, q);
  });

  // 2º — busca fuzzy normal (resultado original)
  var fuzzyResults = buscaFuzzy(query);
  var exatos = fuzzyResults.filter(function(r) { return r.score >= 60; });
  var fuzzy  = fuzzyResults.filter(function(r) { return r.score >= 30 && r.score < 60; });

  // Mescla: exatosPalavras primeiro, depois fuzzy, sem duplicatas
  var mostrados = {};
  var html = '';
  var shown = 0;

  // Bloco 1: matches exatos por palavras
  exatosPalavras.slice(0, 6).forEach(function(p) {
    mostrados[p.id] = true;
    var ico  = catEmojis[p.subcategoria] || catEmojis[p.categoria] || '📦';
    var cat  = subLabels[p.subcategoria] || p.categoria || '';
    var nome = highlightMatch(p.nome, query);
    html +=
      '<div class="search-sug-item" onclick="selecionarSugestao(' + p.id + ')">' +
        '<span class="sug-ico">' + ico + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="sug-name">' + nome + '</div>' +
          (cat ? '<div class="sug-cat">' + cat + '</div>' : '') +
        '</div>' +
        (parseFloat(p.preco) > 0
          ? '<div class="sug-cat">R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') + '</div>'
          : '') +
      '</div>';
    shown++;
  });

  // Bloco 2: exatos fuzzy que ainda não apareceram
  exatos.forEach(function(r) {
    if (shown >= 7) return;
    if (mostrados[r.prod.id]) return;
    mostrados[r.prod.id] = true;
    var p   = r.prod;
    var ico = catEmojis[p.subcategoria] || catEmojis[p.categoria] || '📦';
    var cat = subLabels[p.subcategoria] || p.categoria || '';
    var nome = highlightMatch(p.nome, query);
    var esgTag = isEsgotado(p)
      ? '<span style="font-size:.6rem;background:#ea580c;color:#fff;padding:1px 6px;border-radius:99px;margin-left:4px;font-weight:700">ESGOTADO</span>'
      : '';
    html +=
      '<div class="search-sug-item" onclick="selecionarSugestao(' + p.id + ')">' +
        '<span class="sug-ico">' + ico + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="sug-name">' + nome + esgTag + '</div>' +
          (cat ? '<div class="sug-cat">' + cat + '</div>' : '') +
        '</div>' +
        (parseFloat(p.preco) > 0
          ? '<div class="sug-cat">R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') + '</div>'
          : '') +
      '</div>';
    shown++;
  });

  // Bloco 3: sugestões fuzzy ("você quis dizer")
  var fuzzyNovos = fuzzy.filter(function(r) { return !mostrados[r.prod.id]; });
  if (fuzzyNovos.length && shown < 7) {
    html += '<div class="sug-section-label">💡 Você quis dizer…</div>';
    fuzzyNovos.slice(0, 3).forEach(function(r) {
      if (shown >= 7) return;
      var p   = r.prod;
      var ico = catEmojis[p.subcategoria] || catEmojis[p.categoria] || '📦';
      html +=
        '<div class="search-sug-item" onclick="selecionarSugestao(' + p.id + ')">' +
          '<span class="sug-ico">' + ico + '</span>' +
          '<div style="flex:1;min-width:0"><div class="sug-name">' + p.nome + '</div></div>' +
          (parseFloat(p.preco) > 0
            ? '<div class="sug-cat">R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') + '</div>'
            : '') +
        '</div>';
      shown++;
    });
  }

  if (!shown) { esconderSugestoes(); return; }

  box.innerHTML = html;
  box.classList.add('on');
}

function selecionarSugestao(id) {
  var prod = prods().find(function(p) { return p.id === id; });
  if (!prod) return;
  esconderSugestoes();
  document.getElementById('searchInput').value = prod.nome;
  estado.busca  = prod.nome.toLowerCase();
  estado.cat    = 'todos';
  estado.sub    = 'todas';
  estado.marca  = 'todas';
  document.querySelectorAll('.ftab').forEach(function(b) { b.classList.remove('on'); });
  var all = document.querySelector('.ftab[data-cat="todos"]');
  if (all) all.classList.add('on');
  document.querySelectorAll('.subtabs').forEach(function(b) { b.classList.remove('on'); });
  document.getElementById('brandFilterWrap').classList.remove('on');
  renderizar();
}

function limparBusca() {
  estado.busca = '';
  var inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  esconderSugestoes();
}

function buscarPorTermo(termo) {
  limparBusca();
  estado.cat   = 'todos';
  estado.sub   = 'todas';
  estado.marca = 'todas';
  estado.busca = termo.toLowerCase();
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
  estado.busca = q.toLowerCase();
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
    esconderSugestoes();
  }
  _debouncedRender();
}
