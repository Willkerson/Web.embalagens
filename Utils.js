// ─────────────────────────────────────────────────────────────
// UTILS.JS — Funções utilitárias puras (sem dependência de DOM)
// ─────────────────────────────────────────────────────────────

function debounce(fn, ms) {
  var t;
  return function() {
    clearTimeout(t);
    t = setTimeout(fn.apply.bind(fn, this, arguments), ms);
  };
}

function salvarCarrinho() {
  try { sessionStorage.setItem('cia_cart', JSON.stringify(carrinho)); } catch(e) {}
}

function restaurarCarrinho() {
  try {
    var s = sessionStorage.getItem('cia_cart');
    if (s) carrinho = JSON.parse(s);
  } catch(e) { carrinho = {}; }
}

function salvarHash() {
  var h = estado.cat !== 'todos' ? estado.cat : '';
  if (h) history.replaceState(null, '', '#' + h);
  else   history.replaceState(null, '', location.pathname + location.search);
}

function lerHash() {
  var h = (location.hash || '').replace('#', '');
  if (h && catMap[h]) { estado.cat = h; estado.sub = 'todas'; }
}

function getEsgotadosSet() {
  try { return new Set(JSON.parse(localStorage.getItem(ESGOTADOS_KEY) || '[]')); }
  catch(e) { return new Set(); }
}

function isEsgotado(p) {
  return p.esgotado === true || getEsgotadosSet().has(p.id);
}

function getMarcasDisponiveis(lista) {
  var marcas = {};
  lista.forEach(function(p) {
    var m = (p.marca || '').trim();
    if (m) marcas[m] = true;
  });
  return Object.keys(marcas).sort();
}

// ─── Fuzzy Search Engine ───────────────────────────────────────

function normalizar(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

function levenshtein(a, b) {
  var la = a.length, lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  if (Math.abs(la - lb) > 5) return 99;
  var prev = [];
  for (var j = 0; j <= lb; j++) prev[j] = j;
  for (var i = 1; i <= la; i++) {
    var curr = [i];
    for (var j2 = 1; j2 <= lb; j2++) {
      curr[j2] = a[i-1] === b[j2-1]
        ? prev[j2-1]
        : 1 + Math.min(prev[j2], curr[j2-1], prev[j2-1]);
    }
    prev = curr;
  }
  return prev[lb];
}

function fuzzyScore(haystack, needle) {
  var h = normalizar(haystack);
  var n = normalizar(needle);
  if (!n) return 0;
  if (h.includes(n)) return 100;
  var hWords = h.split(/\s+/);
  var nWords = n.split(/\s+/);
  var totalScore = 0;
  nWords.forEach(function(nw) {
    if (!nw) return;
    var best = 0;
    hWords.forEach(function(hw) {
      if (!hw) return;
      if (hw === nw)                       { best = Math.max(best, 90); return; }
      if (hw.startsWith(nw) || nw.startsWith(hw)) { best = Math.max(best, 80); return; }
      if (hw.includes(nw)   || nw.includes(hw))   { best = Math.max(best, 70); return; }
      var maxDist = Math.floor(Math.max(nw.length, hw.length) / 4);
      if (maxDist < 1) maxDist = 1;
      var dist = levenshtein(
        nw.length > hw.length ? nw : hw,
        nw.length > hw.length ? hw : nw
      );
      if (dist <= maxDist) best = Math.max(best, 60 - dist * 10);
    });
    totalScore += best;
  });
  return totalScore / nWords.length;
}

function highlightMatch(text, query) {
  var norm = normalizar(text);
  var nq   = normalizar(query);
  if (!nq) return text;
  var words = nq.split(/\s+/).filter(Boolean);
  var highlighted = text;
  words.forEach(function(w) {
    if (!w) return;
    var idx = norm.indexOf(w);
    if (idx >= 0) {
      highlighted =
        highlighted.substring(0, idx) +
        '<span class="sug-match">' + highlighted.substring(idx, idx + w.length) + '</span>' +
        highlighted.substring(idx + w.length);
    }
  });
  return highlighted;
}

function buscaFuzzy(query) {
  var lista = prods().filter(function(p) { return !p.oculto; });
  var results = [];
  lista.forEach(function(p) {
    var scoreNome  = fuzzyScore(p.nome, query);
    var scoreMarca = fuzzyScore(p.marca || '', query) * 0.7;
    var score      = Math.max(scoreNome, scoreMarca);
    if (score >= 30) results.push({ prod: p, score: score });
  });
  results.sort(function(a, b) { return b.score - a.score; });
  return results;
}
