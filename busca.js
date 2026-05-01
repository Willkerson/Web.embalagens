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

function mostrarSugestoes(query) {
  var box = document.getElementById('searchSuggestions');
  if (!box) return;
  if (!query || query.length < 2) { esconderSugestoes(); return; }

  var results = buscaFuzzy(query);
  var exatos  = results.filter(function(r) { return r.score >= 60; });
  var fuzzy   = results.filter(function(r) { return r.score >= 30 && r.score < 60; });
  if (!results.length) { esconderSugestoes(); return; }

  var html = '';
  var shown = 0;

  if (exatos.length) {
    exatos.slice(0, 5).forEach(function(r) {
      var p    = r.prod;
      var ico  = catEmojis[p.subcategoria] || catEmojis[p.categoria] || '📦';
      var cat  = subLabels[p.subcategoria] || p.categoria || '';
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
  }

  if (fuzzy.length && shown < 6) {
    html += '<div class="sug-section-label">💡 Você quis dizer…</div>';
    fuzzy.slice(0, Math.min(3, 6 - shown)).forEach(function(r) {
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
    });
  }

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
