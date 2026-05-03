// ─────────────────────────────────────────────────────────────
// BUSCA.JS — Sugestões de busca e handlers do campo de pesquisa
// ─────────────────────────────────────────────────────────────

var _sugTimeout = null;
var _tocandoSugestao = false; // flag para mobile: evita fechar ao recolher teclado
var _debouncedSearch = debounce(function(q) { mostrarSugestoes(q); }, 120);

function esconderSugestoes() {
  if (_tocandoSugestao) return; // usuário está selecionando — não fecha
  var el = document.getElementById('searchSuggestions');
  if (el) { el.classList.remove('on'); el.innerHTML = ''; }
}

function hideSuggestionsDelayed() {
  // Delay maior no mobile para não fechar ao recolher teclado
  var delay = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 400 : 200;
  _sugTimeout = setTimeout(esconderSugestoes, delay);
}

function handleSearchFocus() {
  clearTimeout(_sugTimeout);
  var q = document.getElementById('searchInput').value.trim();
  if (q.length >= 2) mostrarSugestoes(q);
}

// Registra touchstart nas sugestões para não fechar ao tocar nelas (mobile)
document.addEventListener('DOMContentLoaded', function() {
  var box = document.getElementById('searchSuggestions');
  if (!box) return;
  box.addEventListener('touchstart', function() {
    _tocandoSugestao = true;
  }, { passive: true });
  box.addEventListener('touchend', function() {
    setTimeout(function() { _tocandoSugestao = false; }, 500);
  }, { passive: true });
});

function mostrarSugestoes(query) {
  var box = document.getElementById('searchSuggestions');
  if (!box) return;
  if (!query || query.length < 2) { esconderSugestoes(); return; }

  var qNorm = normalizar(query);
  var todosProds = prods().filter(function(p) { return !p.oculto; });

  // ── PASSO 1: substring direta (mais confiável para buscas compostas) ──
  // Ex: "garrafa pet" encontra TODOS os produtos que contêm "garrafa pet" no nome
  var diretos = todosProds.filter(function(p) {
    return normalizar(p.nome).includes(qNorm) ||
           normalizar(p.marca || '').includes(qNorm);
  });

  // ── PASSO 2: busca por TODAS as palavras (AND) ──
  // Ex: "garrafa 500" → nome deve conter "garrafa" E "500"
  var palavras = qNorm.split(/\s+/).filter(Boolean);
  var porPalavras = palavras.length > 1
    ? todosProds.filter(function(p) {
        var n = normalizar(p.nome) + ' ' + normalizar(p.marca || '');
        return palavras.every(function(w) { return n.includes(w); }) &&
               diretos.indexOf(p) < 0; // não duplica
      })
    : [];

  // ── PASSO 3: fuzzy para complementar (menos prioritário) ──
  var fuzzyResults = buscaFuzzy(query)
    .filter(function(r) {
      return r.score >= 40 &&
             diretos.indexOf(r.prod) < 0 &&
             porPalavras.indexOf(r.prod) < 0;
    })
    .map(function(r) { return r.prod; });

  // Total encontrado por substring/palavras (para o cabeçalho)
  var totalDireto = diretos.length + porPalavras.length;

  if (!totalDireto && !fuzzyResults.length) { esconderSugestoes(); return; }

  var html = '';

  // Cabeçalho com contagem quando há muitos resultados diretos
  if (totalDireto > 0) {
    if (totalDireto > 5) {
      // Mostra quantos foram encontrados + botão "ver todos"
      html += '<div class="sug-section-label" style="display:flex;align-items:center;justify-content:space-between">' +
        '<span>🔎 ' + totalDireto + ' produto' + (totalDireto > 1 ? 's' : '') + ' encontrado' + (totalDireto > 1 ? 's' : '') + '</span>' +
        '<span onclick="confirmarBuscaCompleta()" style="color:var(--blue);font-weight:700;cursor:pointer;font-size:.7rem">Ver todos →</span>' +
      '</div>';
    }

    // Mostra os primeiros 6 resultados diretos
    diretos.concat(porPalavras).slice(0, 6).forEach(function(p) {
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
    });
  }

  // Fuzzy como sugestão alternativa (só se resultados diretos forem poucos)
  if (fuzzyResults.length && totalDireto < 4) {
    html += '<div class="sug-section-label">💡 Você quis dizer…</div>';
    fuzzyResults.slice(0, 3).forEach(function(p) {
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

// Confirma a busca atual e fecha sugestões (mostra todos no grid)
function confirmarBuscaCompleta() {
  esconderSugestoes();
  renderizar();
  var c = document.getElementById('containerProdutos');
  if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
