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

  // ── PASSO 1: substring direta — mais confiável para termos compostos
  // "garrafa pet 500" encontra TODOS os nomes que contêm essa sequência
  var diretos = todosProds.filter(function(p) {
    var nNorm = normalizar(p.nome);
    var mNorm = normalizar(p.marca || '');
    return nNorm.includes(qNorm) || mNorm.includes(qNorm);
  });

  // ── PASSO 2: todas as palavras presentes (AND) — sem corte de limite
  // "garrafa 500ml" → nome precisa conter "garrafa" E "500ml"
  var palavras = qNorm.split(/\s+/).filter(Boolean);
  var jaEncontrados = diretos.map(function(p) { return p.id; });

  var porPalavras = palavras.length > 1
    ? todosProds.filter(function(p) {
        if (jaEncontrados.indexOf(p.id) >= 0) return false; // não duplica
        var nNorm = normalizar(p.nome) + ' ' + normalizar(p.marca || '');
        return palavras.every(function(w) { return nNorm.includes(w); });
      })
    : [];

  // ── PASSO 3: fuzzy como fallback (só quando diretos são poucos)
  var idsJaVistos = diretos.concat(porPalavras).map(function(p) { return p.id; });
  var fuzzyProds = [];
  if (diretos.length + porPalavras.length < 3) {
    fuzzyProds = buscaFuzzy(query)
      .filter(function(r) {
        return r.score >= 45 && idsJaVistos.indexOf(r.prod.id) < 0;
      })
      .map(function(r) { return r.prod; })
      .slice(0, 4);
  }

  var encontrados = diretos.concat(porPalavras); // todos sem limite
  var totalDireto = encontrados.length;

  if (!totalDireto && !fuzzyProds.length) { esconderSugestoes(); return; }

  var html = '';

  if (totalDireto > 0) {
    // Cabeçalho: mostra contagem total e "ver todos" quando há muitos
    var limite = 7; // máximo visível na lista dropdown
    html += '<div class="sug-section-label" style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px 5px">' +
      '<span>' + totalDireto + ' produto' + (totalDireto !== 1 ? 's' : '') + ' encontrado' + (totalDireto !== 1 ? 's' : '') + '</span>' +
      (totalDireto > limite
        ? '<span onclick="confirmarBuscaCompleta()" style="color:var(--blue);font-weight:700;cursor:pointer;font-size:.7rem;padding:2px 6px">Ver todos ' + totalDireto + ' →</span>'
        : '') +
    '</div>';

    // Lista os primeiros <limite> resultados
    encontrados.slice(0, limite).forEach(function(p) {
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
            ? '<div class="sug-cat" style="white-space:nowrap">R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') + '</div>'
            : '') +
        '</div>';
    });

    // Se há mais que o limite, mostra rodapé clicável
    if (totalDireto > limite) {
      html += '<div onclick="confirmarBuscaCompleta()" style="text-align:center;padding:10px;font-size:.78rem;font-weight:600;color:var(--blue);cursor:pointer;border-top:1px solid var(--border);background:var(--blue-soft)">Ver todos os ' + totalDireto + ' resultados →</div>';
    }
  }

  // Fuzzy como seção separada (só quando diretos são poucos)
  if (fuzzyProds.length) {
    html += '<div class="sug-section-label">💡 Você quis dizer…</div>';
    fuzzyProds.forEach(function(p) {
      var ico = catEmojis[p.subcategoria] || catEmojis[p.categoria] || '📦';
      html +=
        '<div class="search-sug-item" onclick="selecionarSugestao(' + p.id + ')">' +
          '<span class="sug-ico">' + ico + '</span>' +
          '<div style="flex:1;min-width:0"><div class="sug-name">' + p.nome + '</div></div>' +
          (parseFloat(p.preco) > 0
            ? '<div class="sug-cat" style="white-space:nowrap">R$ ' + parseFloat(p.preco).toFixed(2).replace('.', ',') + '</div>'
            : '') +
        '</div>';
    });
  }

  box.innerHTML = html;
  box.classList.add('on');
}

// Confirma a busca e mostra TODOS os resultados no grid principal
function confirmarBuscaCompleta() {
  esconderSugestoes();
  renderizar();
  var c = document.getElementById('containerProdutos');
  if (c) setTimeout(function() { c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
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
