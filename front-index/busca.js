// ─────────────────────────────────────────────────────────────
// BUSCA.JS — Sugestões de busca e handlers do campo de pesquisa
// ─────────────────────────────────────────────────────────────

var _sugTimeout = null;
var _tocandoSugestao = false;
var _debouncedSearch = debounce(function(q) { mostrarSugestoes(q); }, 120);

// ─────────────────────────────────────────────────────────────
// 🎂 EASTER EGG — Aniversário da Laryssa
// ─────────────────────────────────────────────────────────────
var _laryssaAtivado = false;

function _normalNome(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

function _verificarLaryssa(query) {
  var q = _normalNome(query);
  // Aceita "laryssa", "larissa", "larissa" com variações de digitação
  if (q === 'laryssa' || q === 'larissa' || q === 'larysa' || q === 'larisssa') {
    if (!_laryssaAtivado) {
      _laryssaAtivado = true;
      _dispararAniversario();
    }
    return true;
  }
  return false;
}

function _dispararAniversario() {
  // ── Injeta estilos da animação ──
  if (!document.getElementById('laryssa-style')) {
    var style = document.createElement('style');
    style.id = 'laryssa-style';
    style.textContent = [
      '@keyframes _confettiDrop {',
      '  0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }',
      '  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }',
      '}',
      '@keyframes _baloesFloat {',
      '  0%   { transform: translateY(0) scale(1);    opacity: 1; }',
      '  100% { transform: translateY(-120vh) scale(.8); opacity: 0; }',
      '}',
      '@keyframes _cardPop {',
      '  0%   { opacity: 0; transform: translate(-50%,-50%) scale(.6); }',
      '  60%  { transform: translate(-50%,-50%) scale(1.06); }',
      '  100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }',
      '}',
      '@keyframes _pulse {',
      '  0%,100% { transform: scale(1); }',
      '  50%     { transform: scale(1.08); }',
      '}',
      '@keyframes _shimmer {',
      '  0%   { background-position: -200% center; }',
      '  100% { background-position:  200% center; }',
      '}',
      '._laryssa-overlay {',
      '  position: fixed; inset: 0; z-index: 9999;',
      '  pointer-events: none;',
      '}',
      '._laryssa-card {',
      '  position: fixed; top: 50%; left: 50%;',
      '  transform: translate(-50%,-50%);',
      '  z-index: 10000; pointer-events: all;',
      '  background: #fff;',
      '  border-radius: 24px;',
      '  padding: 2rem 2.5rem;',
      '  text-align: center;',
      '  box-shadow: 0 32px 80px rgba(0,0,0,.28);',
      '  max-width: 340px; width: 90vw;',
      '  animation: _cardPop .5s cubic-bezier(.34,1.56,.64,1) both;',
      '}',
      '._laryssa-card h2 {',
      '  font-size: 1.5rem; margin: .5rem 0 .25rem;',
      '  background: linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#ff6b6b);',
      '  background-size: 200% auto;',
      '  -webkit-background-clip: text; background-clip: text;',
      '  -webkit-text-fill-color: transparent;',
      '  animation: _shimmer 2s linear infinite, _pulse 1.8s ease-in-out infinite;',
      '}',
      '._laryssa-card p {',
      '  font-size: .95rem; color: #555; line-height: 1.6; margin: .75rem 0 1.25rem;',
      '}',
      '._laryssa-card button {',
      '  background: linear-gradient(135deg,#ff6b6b,#ffd93d);',
      '  color: #fff; border: none; border-radius: 99px;',
      '  padding: .65rem 2rem; font-size: .95rem; font-weight: 700;',
      '  cursor: pointer; transition: transform .15s, box-shadow .15s;',
      '  box-shadow: 0 4px 16px rgba(255,107,107,.4);',
      '}',
      '._laryssa-card button:hover { transform: scale(1.05); }',
      '._confetti {',
      '  position: fixed; top: -12px;',
      '  width: 10px; height: 14px; border-radius: 2px;',
      '  animation: _confettiDrop linear forwards;',
      '  pointer-events: none; z-index: 9998;',
      '}',
      '._balao {',
      '  position: fixed; bottom: -60px;',
      '  font-size: 2.5rem; line-height: 1;',
      '  animation: _baloesFloat linear forwards;',
      '  pointer-events: none; z-index: 9998;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Confetes ──
  var cores = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9a3c','#ff63b8'];
  var frag = document.createDocumentFragment();
  for (var i = 0; i < 90; i++) {
    (function(i) {
      var c = document.createElement('div');
      c.className = '_confetti';
      c.style.left      = Math.random() * 100 + 'vw';
      c.style.background = cores[Math.floor(Math.random() * cores.length)];
      c.style.width     = (8 + Math.random() * 8) + 'px';
      c.style.height    = (10 + Math.random() * 10) + 'px';
      c.style.animationDelay    = (Math.random() * 2.5) + 's';
      c.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
      c.style.opacity   = (0.7 + Math.random() * 0.3).toString();
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      frag.appendChild(c);
      setTimeout(function() { if (c.parentNode) c.parentNode.removeChild(c); }, 6000);
    })(i);
  }
  document.body.appendChild(frag);

  // ── Balões ──
  var baloesEmojis = ['🎈','🎀','🎊','🎉','💖','✨','🌟'];
  for (var b = 0; b < 12; b++) {
    (function(b) {
      var el = document.createElement('div');
      el.className = '_balao';
      el.textContent = baloesEmojis[Math.floor(Math.random() * baloesEmojis.length)];
      el.style.left = (5 + Math.random() * 90) + 'vw';
      el.style.animationDelay    = (Math.random() * 1.5) + 's';
      el.style.animationDuration = (3 + Math.random() * 3) + 's';
      el.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
      document.body.appendChild(el);
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 7000);
    })(b);
  }

  // ── Card de felicitações ──
  var card = document.createElement('div');
  card.className = '_laryssa-card';
  card.innerHTML =
    '<div style="font-size:3rem;line-height:1;margin-bottom:.25rem">🎂</div>' +
    '<h2>Feliz Aniversário,<br>Laryssa! 🎉</h2>' +
    '<p>Que seu dia seja incrível,<br>cheio de amor, alegria e<br>muitas embalagens lindas! 🎁✨</p>' +
    '<button onclick="this.closest(\'._laryssa-card\').remove();document.getElementById(\'searchInput\').value=\'\';esconderSugestoes();">💖 Obrigada!</button>';

  document.body.appendChild(card);

  // Fecha também ao clicar fora do card
  setTimeout(function() {
    document.addEventListener('click', function fecharCard(e) {
      if (card.parentNode && !card.contains(e.target)) {
        card.remove();
        document.removeEventListener('click', fecharCard);
      }
    });
  }, 600);

  // Reset da flag após 10s para permitir ativar de novo
  setTimeout(function() { _laryssaAtivado = false; }, 10000);
}
// ─────────────────────────────────────────────────────────────
// FIM DO EASTER EGG
// ─────────────────────────────────────────────────────────────

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

  // 🎂 Verifica easter egg antes de qualquer coisa
  if (_verificarLaryssa(query)) {
    esconderSugestoes();
    document.getElementById('searchInput').value = '';
    return;
  }

  var qNorm = normalizar(query);
  var todosProds = prods().filter(function(p) { return !p.oculto; });

  var diretos = todosProds.filter(function(p) {
    var nNorm = normalizar(p.nome);
    var mNorm = normalizar(p.marca || '');
    return nNorm.includes(qNorm) || mNorm.includes(qNorm);
  });

  var palavras = qNorm.split(/\s+/).filter(Boolean);
  var jaEncontrados = diretos.map(function(p) { return p.id; });

  var porPalavras = palavras.length > 1
    ? todosProds.filter(function(p) {
        if (jaEncontrados.indexOf(p.id) >= 0) return false;
        var nNorm = normalizar(p.nome) + ' ' + normalizar(p.marca || '');
        return palavras.every(function(w) { return nNorm.includes(w); });
      })
    : [];

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

  var encontrados = diretos.concat(porPalavras);
  var totalDireto = encontrados.length;

  if (!totalDireto && !fuzzyProds.length) { esconderSugestoes(); return; }

  var html = '';

  if (totalDireto > 0) {
    var limite = 7;
    html += '<div class="sug-section-label" style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px 5px">' +
      '<span>' + totalDireto + ' produto' + (totalDireto !== 1 ? 's' : '') + ' encontrado' + (totalDireto !== 1 ? 's' : '') + '</span>' +
      (totalDireto > limite
        ? '<span onclick="confirmarBuscaCompleta()" style="color:var(--blue);font-weight:700;cursor:pointer;font-size:.7rem;padding:2px 6px">Ver todos ' + totalDireto + ' →</span>'
        : '') +
    '</div>';

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

    if (totalDireto > limite) {
      html += '<div onclick="confirmarBuscaCompleta()" style="text-align:center;padding:10px;font-size:.78rem;font-weight:600;color:var(--blue);cursor:pointer;border-top:1px solid var(--border);background:var(--blue-soft)">Ver todos os ' + totalDireto + ' resultados →</div>';
    }
  }

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
