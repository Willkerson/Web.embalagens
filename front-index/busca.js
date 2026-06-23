// ─────────────────────────────────────────────────────────────
// BUSCA.JS — Sugestões de busca e handlers do campo de pesquisa
// ─────────────────────────────────────────────────────────────
function precoNum(valor) {
  return parseFloat(String(valor).replace(',', '.'));
}
var _sugTimeout = null;
var _tocandoSugestao = false;
var _debouncedSearch = debounce(function(q) { mostrarSugestoes(q); }, 120);


function esconderSugestoes() {
  if (_tocandoSugestao) return;
  var el = document.getElementById('searchSuggestions');
  if (el) { el.classList.remove('on'); el.innerHTML = ''; }
}

function hideSuggestionsDelayed() {
  var delay = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 400 : 200;
  _sugTimeout = setTimeout(esconderSugestoes, delay);
}

function handleSearchFocus() {
  clearTimeout(_sugTimeout);
  var q = document.getElementById('searchInput').value.trim();
  if (q.length >= 2) mostrarSugestoes(q);
}

document.addEventListener('DOMContentLoaded', function() {

  var inp = document.getElementById('searchInput');

  if (inp) {
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') confirmarBuscaCompleta();
    });
  }

  var box = document.getElementById('searchSuggestions');

  if (!box) return;

  box.addEventListener('touchstart', function() {
    _tocandoSugestao = true;
  }, { passive: true });

  box.addEventListener('touchend', function() {
    setTimeout(function() {
      _tocandoSugestao = false;
    }, 500);
  }, { passive: true });

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



  // ── Busca por preço ──────────────────────────────────────────
  var precoQuery = _extrairPreco(query);
  if (precoQuery !== null) {
    var todosParaPreco = prods().filter(function(p) { return !p.oculto && estoqueNum(p.estoque) > 0; });
    var porPreco = todosParaPreco.filter(function(p) {
      var v = precoNum(p.preco)
      return !isNaN(v) && Math.abs(v - precoQuery) <= 0.05;
    });
    if (porPreco.length === 0) {
      box.innerHTML = '<div class="sug-section-label" style="padding:12px 14px">Nenhum produto com preço R$ ' + precoQuery.toFixed(2).replace('.', ',') + '</div>';
      box.classList.add('on');
    } else {
      var html = '<div class="sug-section-label" style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px 5px">' +
        '<span>💰 ' + porPreco.length + ' produto' + (porPreco.length !== 1 ? 's' : '') + ' por R$ ' + precoQuery.toFixed(2).replace('.', ',') + '</span>' +
        '</div>';
      porPreco.slice(0, 8).forEach(function(p) {
        var ico = catEmojis[p.subcategoria] || catEmojis[p.categoria] || '📦';
        var cat = subLabels[p.subcategoria] || p.categoria || '';
        var esgTag = isEsgotado(p) ? '<span style="font-size:.6rem;background:#ea580c;color:#fff;padding:1px 6px;border-radius:99px;margin-left:4px;font-weight:700">ESGOTADO</span>' : '';
        html += '<div class="search-sug-item" onclick="selecionarSugestao(' + p.id + ')">' +
          '<span class="sug-ico">' + ico + '</span>' +
          '<div style="flex:1;min-width:0">' +
            '<div class="sug-name">' + p.nome + esgTag + '</div>' +
            (cat ? '<div class="sug-cat">' + cat + '</div>' : '') +
          '</div>' +
          '<div class="sug-cat" style="white-space:nowrap;color:#16a34a;font-weight:700">R$ ' + precoNum(p.preco).toFixed(2).replace('.', ',') + '</div>' +
        '</div>';
      });
      if (porPreco.length > 8) {
        html += '<div onclick="confirmarBuscaCompleta()" style="text-align:center;padding:10px;font-size:.78rem;font-weight:600;color:var(--blue);cursor:pointer;border-top:1px solid var(--border);background:var(--blue-soft)">Ver todos os ' + porPreco.length + ' resultados →</div>';
      }
      box.innerHTML = html;
      box.classList.add('on');
    }
    return;
  }

  // ── Busca normal por nome/marca ──────────────────────────────
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

  var jaEncontrados = diretos.map(function(p) {
    return p.id;
  });

  var porPalavras = palavras.length > 1
    ? todosProds.filter(function(p) {
        if (jaEncontrados.indexOf(p.id) >= 0) return false;

        var nNorm =
          normalizar(p.nome) + ' ' +
          normalizar(p.marca || '');

        return palavras.every(function(w) {
          return nNorm.includes(w);
        });
      })
    : [];

  var idsJaVistos = diretos.concat(porPalavras).map(function(p) { return p.id; });
  var fuzzyProds = [];
  if (diretos.length + porPalavras.length < 3) {
    fuzzyProds = buscaFuzzy(query)
      .filter(function(r) { return r.score >= 45 && idsJaVistos.indexOf(r.prod.id) < 0; })
      .map(function(r) { return r.prod; })
      .slice(0, 4);
  }

  var encontrados = diretos.concat(porPalavras);
  var totalDireto = encontrados.length;

  if (!totalDireto && !fuzzyProds.length) { esconderSugestoes(); return; }

  var html = '';

  if (totalDireto > 0) {
    var limite = 7;
    html += '<div class="sug-section-label" style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px 5px">' +
      '<span>' + totalDireto + ' produto' + (totalDireto !== 1 ? 's' : '') + ' encontrado' + (totalDireto !== 1 ? 's' : '') + '</span>' +
      (totalDireto > limite ? '<span onclick="confirmarBuscaCompleta()" style="color:var(--blue);font-weight:700;cursor:pointer;font-size:.7rem;padding:2px 6px">Ver todos ' + totalDireto + ' →</span>' : '') +
    '</div>';
    encontrados.slice(0, limite).forEach(function(p) {
      var ico  = catEmojis[p.subcategoria] || catEmojis[p.categoria] || '📦';
      var cat  = subLabels[p.subcategoria] || p.categoria || '';
      var nome = highlightMatch(p.nome, query);
      var esgTag = isEsgotado(p) ? '<span style="font-size:.6rem;background:#ea580c;color:#fff;padding:1px 6px;border-radius:99px;margin-left:4px;font-weight:700">ESGOTADO</span>' : '';
      html += '<div class="search-sug-item" onclick="selecionarSugestao(' + p.id + ')">' +
        '<span class="sug-ico">' + ico + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div class="sug-name">' + nome + esgTag + '</div>' +
          (cat ? '<div class="sug-cat">' + cat + '</div>' : '') +
        '</div>' +
        (precoNum(p.preco) > 0 ? '<div class="sug-cat" style="white-space:nowrap">R$ ' + precoNum(p.preco).toFixed(2).replace('.', ',') + '</div>' : '') +
      '</div>';
    });
    if (totalDireto > limite) {
      html += '<div onclick="confirmarBuscaCompleta()" style="text-align:center;padding:10px;font-size:.78rem;font-weight:600;color:var(--blue);cursor:pointer;border-top:1px solid var(--border);background:var(--blue-soft)">Ver todos os ' + totalDireto + ' resultados →</div>';
    }
  }

  if (fuzzyProds.length) {
    html += '<div class="sug-section-label">💡 Você quis dizer…</div>';
    fuzzyProds.forEach(function(p) {
      var ico = catEmojis[p.subcategoria] || catEmojis[p.categoria] || '📦';
      html += '<div class="search-sug-item" onclick="selecionarSugestao(' + p.id + ')">' +
        '<span class="sug-ico">' + ico + '</span>' +
        '<div style="flex:1;min-width:0"><div class="sug-name">' + p.nome + '</div></div>' +
        (precoNum(p.preco) > 0 ? '<div class="sug-cat" style="white-space:nowrap">R$ ' + precoNum(p.preco).toFixed(2).replace('.', ',') + '</div>' : '') +
      '</div>';
    });
  }

  box.innerHTML = html;
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
