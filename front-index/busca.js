// ─────────────────────────────────────────────────────────────
// BUSCA.JS — Sugestões de busca e handlers do campo de pesquisa
// ─────────────────────────────────────────────────────────────

var _sugTimeout = null;
var _tocandoSugestao = false;
var _debouncedSearch = debounce(function(q) { mostrarSugestoes(q); }, 120);

// ─────────────────────────────────────────────────────────────
// 🎂 EASTER EGG — Aniversário da Laryssa (versão amostrada)
// ─────────────────────────────────────────────────────────────
var _laryssaAtivado = false;
var _laryssaMsgIdx = 0;
var _laryssaTypeTimer = null;
var _laryssaMsgCount = 0;

var _laryssaMsgs = [
  'Feliz aniversário, Laryssa! 🎉 Que seu dia seja tão incrível quanto você — e olha que a régua tá alta! ✨',
  'Parabéns! 🥳 Que neste novo ano você receba só pedidos urgentes na véspera do feriado. Ah, não — esse é o pesadelo. Que venha muita coisa boa mesmo! 🎁',
  'Hoje é o dia da Laryssa! Aquela que chegou, tomou conta e não vai devolver. Feliz aniversário! 👑',
  'Muitos anos de vida, saúde, e clientes que mandam briefing completo! 🙏✨',
  'Parabéns, aniversariante! Que a vida te dê tanto quanto você dá de energia pra tudo que faz — e aí sim a festa nunca para! 🎊',
  'Feliz aniversário! 🎂 Hoje o universo inteiro conspirou a seu favor. Aproveita, que amanhã o e-mail volta. 😅💖',
  'Você merece: bolo incrível, zero reunião chata e 100% de pessoas maravilhosas ao redor. Parabéns! 🥂',
  'Um brinde à Laryssa! 🥂 Que seus projetos saiam do papel, sua caixa de entrada fique zerada e seu aniversário seja épico! 🎉',
  'A Laryssa entrou no chat ✨ — e o aniversário nunca mais foi o mesmo. Muitas felicidades! 🎈',
  'Parabéns! Que cada embalagem que você criar neste ano carregue um pouco da magia que você tem. 📦✨💖'
];

function _normalNome(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

function _verificarLaryssa(query) {
  var q = _normalNome(query);
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
  _injetarEstilosLaryssa();
  _lancarConfetesLaryssa(35);
  setTimeout(function() { _lancarBaloesLaryssa(); }, 200);
  _criarCardLaryssa();
  setTimeout(function() { _laryssaAtivado = false; }, 10000);
}

function _injetarEstilosLaryssa() {
  if (document.getElementById('laryssa-style')) return;
  var s = document.createElement('style');
  s.id = 'laryssa-style';
  s.textContent = [
    '@keyframes _lPiecefall{0%{transform:translateY(-20px) rotate(0deg) scale(1);opacity:1}100%{transform:translateY(110vh) rotate(var(--lrot)) scale(.5);opacity:0}}',
    '@keyframes _lBalloon{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-120vh) scale(.7);opacity:0}}',
    '@keyframes _lCardPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.5) rotate(-4deg)}70%{transform:translate(-50%,-50%) scale(1.04) rotate(1deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0deg)}}',
    '@keyframes _lShimmer{0%{background-position:-300% center}100%{background-position:300% center}}',
    '@keyframes _lPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}',
    '@keyframes _lBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}',
    '@keyframes _lBlink{0%,100%{opacity:1}50%{opacity:0}}',
    '@keyframes _lWave{0%,100%{transform:rotate(0deg)}25%{transform:rotate(20deg)}75%{transform:rotate(-10deg)}}',
    '@keyframes _lSparkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}',
    '@keyframes _lGlow{0%,100%{box-shadow:0 0 20px #ff6b6b44,0 0 40px #ffd93d22}50%{box-shadow:0 0 40px #ff6b6b88,0 0 80px #ffd93d44}}',
    '@keyframes _lSlideX{from{transform:translateX(0)}to{transform:translateX(120vw)}}',
    '._l-piece{position:fixed;pointer-events:none;z-index:9997;animation:_lPiecefall linear forwards;}',
    '._l-balloon{position:fixed;bottom:-60px;pointer-events:none;z-index:9997;animation:_lBalloon linear forwards;}',
    '._l-overlay{position:fixed;inset:0;z-index:9998;pointer-events:none;}',
    '._l-card{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;pointer-events:all;',
    '  background:#fff;border-radius:24px;overflow:hidden;',
    '  box-shadow:0 32px 80px rgba(0,0,0,.28);max-width:380px;width:90vw;',
    '  animation:_lCardPop .55s cubic-bezier(.34,1.56,.64,1) both;}',
    '._l-banner{background:linear-gradient(135deg,#ff6b6b,#ffd93d,#c77dff,#4d96ff);background-size:300% 300%;',
    '  animation:_lShimmer 3s linear infinite;padding:1.75rem 1.5rem 1.25rem;text-align:center;position:relative;}',
    '._l-emoji{font-size:3.5rem;display:block;margin-bottom:.4rem;animation:_lBounce 1.5s ease-in-out infinite;',
    '  filter:drop-shadow(0 4px 8px rgba(0,0,0,.2));}',
    '._l-name{font-size:1.6rem;font-weight:600;color:#fff;margin:0;text-shadow:0 2px 12px rgba(0,0,0,.25);',
    '  animation:_lPulse 2s ease-in-out infinite;}',
    '._l-sub{font-size:.75rem;color:rgba(255,255,255,.85);margin:.2rem 0 0;letter-spacing:.1em;text-transform:uppercase;}',
    '._l-star{position:absolute;color:#fff;font-size:.9rem;animation:_lSparkle 1.5s ease-in-out infinite;opacity:0;}',
    '._l-body{padding:1.25rem 1.25rem 1.5rem;background:#fff;}',
    '._l-msgbox{background:#f7f7f7;border-radius:12px;padding:.9rem 1rem;margin-bottom:1rem;',
    '  min-height:60px;font-size:.92rem;color:#333;line-height:1.6;position:relative;}',
    '._l-cursor{display:inline-block;width:2px;height:1em;background:#888;vertical-align:text-bottom;',
    '  animation:_lBlink .7s infinite;margin-left:1px;}',
    '._l-actions{display:flex;flex-direction:column;gap:8px;}',
    '._l-btn{border:.5px solid #ddd;background:#fff;color:#333;border-radius:99px;padding:.6rem 1.1rem;',
    '  font-size:.88rem;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;',
    '  transition:all .15s;font-family:inherit;width:100%;}',
    '._l-btn:hover{background:#f5f5f5;transform:translateX(4px);}',
    '._l-btn:active{transform:scale(.98);}',
    '._l-btn-main{border-color:transparent!important;background:linear-gradient(135deg,#ff6b6b,#ffd93d)!important;',
    '  color:#fff!important;font-weight:600;justify-content:center;',
    '  animation:_lGlow 2s ease-in-out infinite;box-shadow:0 4px 20px rgba(255,107,107,.35);}',
    '._l-btn-main:hover{transform:scale(1.03)!important;box-shadow:0 6px 28px rgba(255,107,107,.5);}',
    '._l-btn-main ._l-bwave{animation:_lWave .8s ease-in-out infinite;}',
    '._l-counter{text-align:center;font-size:.72rem;color:#888;margin-top:.9rem;',
    '  padding-top:.9rem;border-top:.5px solid #eee;}',
    '._l-ribbon{position:fixed;top:28%;left:-110%;z-index:9996;width:110%;height:44px;',
    '  background:linear-gradient(90deg,transparent,rgba(255,217,61,.4),rgba(199,125,255,.4),transparent);',
    '  pointer-events:none;animation:_lSlideX 1.4s ease-out .2s both;}'
  ].join('');
  document.head.appendChild(s);
}

function _criarCardLaryssa() {
  // ribbon
  var ribbon = document.createElement('div');
  ribbon.className = '_l-ribbon';
  document.body.appendChild(ribbon);
  setTimeout(function() { if (ribbon.parentNode) ribbon.parentNode.removeChild(ribbon); }, 3000);

  var card = document.createElement('div');
  card.className = '_l-card';
  card.id = '_laryssa-card';

  // banner com estrelinhas
  var bannerStars = '';
  var starPos = [
    {t:'12%',l:'7%',d:'0s'},{t:'18%',l:'88%',d:'.5s'},{t:'55%',l:'4%',d:'1s'},
    {t:'70%',l:'93%',d:'.3s'},{t:'38%',l:'50%',d:'.8s'},{t:'8%',l:'48%',d:'1.2s'}
  ];
  starPos.forEach(function(p) {
    bannerStars += '<div class="_l-star" style="top:'+p.t+';left:'+p.l+';animation-delay:'+p.d+';animation-duration:'+(1.3+Math.random()).toFixed(1)+'s">✦</div>';
  });

  card.innerHTML =
    '<div class="_l-banner">' +
      bannerStars +
      '<span class="_l-emoji">🎂</span>' +
      '<p class="_l-name">Laryssa! 🎉</p>' +
      '<p class="_l-sub">A pessoa mais amostrada da empresa</p>' +
    '</div>' +
    '<div class="_l-body">' +
      '<div class="_l-msgbox"><span id="_l-typed"></span><span class="_l-cursor"></span></div>' +
      '<div class="_l-actions">' +
        '<button class="_l-btn _l-btn-main" onclick="_laryssaNovaMsg()">' +
          '<span class="_l-bwave" style="font-size:1.1rem">👋</span>' +
          '<span style="flex:1">Outra mensagem de parabéns</span>' +
          '<span style="opacity:.7;font-size:.8rem">✨</span>' +
        '</button>' +
        '<button class="_l-btn" onclick="_lancarConfetesLaryssa(70)">' +
          '<span style="font-size:1.1rem;width:22px;text-align:center">🎊</span>' +
          '<span style="flex:1">Mais confetes, por favor!</span>' +
          '<span style="color:#aaa;font-size:.8rem">→</span>' +
        '</button>' +
        '<button class="_l-btn" onclick="_lancarBaloesLaryssa()">' +
          '<span style="font-size:1.1rem;width:22px;text-align:center">🎈</span>' +
          '<span style="flex:1">Soltar os balões</span>' +
          '<span style="color:#aaa;font-size:.8rem">→</span>' +
        '</button>' +
        '<button class="_l-btn" onclick="_fanfarraLaryssa()">' +
          '<span style="font-size:1.1rem;width:22px;text-align:center">🎺</span>' +
          '<span style="flex:1">Fanfarra! (com som)</span>' +
          '<span style="color:#aaa;font-size:.8rem">→</span>' +
        '</button>' +
        '<button class="_l-btn" onclick="_fecharCardLaryssa()" style="justify-content:center;color:#aaa;font-size:.82rem">' +
          '💖 Obrigada! Fechar' +
        '</button>' +
      '</div>' +
      '<div class="_l-counter">🎁 <span id="_l-count">0</span> mensagens entregues</div>' +
    '</div>';

  document.body.appendChild(card);

  // fecha ao clicar fora
  setTimeout(function() {
    document.addEventListener('click', function _fClick(e) {
      var c = document.getElementById('_laryssa-card');
      if (c && !c.contains(e.target)) {
        _fecharCardLaryssa();
        document.removeEventListener('click', _fClick);
      }
    });
  }, 700);

  _laryssaNovaMsg();
}

function _laryssaNovaMsg() {
  var el = document.getElementById('_l-typed');
  var cnt = document.getElementById('_l-count');
  if (!el) return;
  var msg = _laryssaMsgs[_laryssaMsgIdx % _laryssaMsgs.length];
  _laryssaMsgIdx++;
  _laryssaMsgCount++;
  if (cnt) cnt.textContent = _laryssaMsgCount;
  if (_laryssaTypeTimer) clearInterval(_laryssaTypeTimer);
  el.textContent = '';
  var i = 0;
  _laryssaTypeTimer = setInterval(function() {
    if (i < msg.length) { el.textContent += msg[i]; i++; }
    else {
      clearInterval(_laryssaTypeTimer);
      if (_laryssaMsgIdx % 3 === 0) _lancarConfetesLaryssa(20);
    }
  }, 26);
  _lancarConfetesLaryssa(15);
}

function _lancarConfetesLaryssa(n) {
  n = n || 50;
  var colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9a3c','#ff63b8','#fff'];
  var frag = document.createDocumentFragment();
  for (var i = 0; i < n; i++) {
    (function() {
      var el = document.createElement('div');
      el.className = '_l-piece';
      var rot = (Math.random() * 720 - 360) + 'deg';
      el.style.setProperty('--lrot', rot);
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.top = '-20px';
      el.style.width = (6 + Math.random() * 9) + 'px';
      el.style.height = (8 + Math.random() * 12) + 'px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.animationDelay = (Math.random() * 0.8) + 's';
      el.style.animationDuration = (2 + Math.random() * 2.5) + 's';
      frag.appendChild(el);
    })();
  }
  document.body.appendChild(frag);
  setTimeout(function() {
    document.querySelectorAll('._l-piece').forEach(function(el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }, 6000);
}

function _lancarBaloesLaryssa() {
  var emojis = ['🎈','🎀','🎊','💖','✨','🌟','🥳','🎉','💫','🌈'];
  for (var b = 0; b < 14; b++) {
    (function(b) {
      var el = document.createElement('div');
      el.className = '_l-balloon';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = (3 + Math.random() * 94) + 'vw';
      el.style.fontSize = (1.5 + Math.random() * 1.8) + 'rem';
      el.style.animationDelay = (b * 0.1) + 's';
      el.style.animationDuration = (3 + Math.random() * 3) + 's';
      document.body.appendChild(el);
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 8000);
    })(b);
  }
  _lancarConfetesLaryssa(15);
}

function _fanfarraLaryssa() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var notas  = [523, 659, 784, 1047, 784, 1047, 784, 1047];
    var tempos = [0, 0.15, 0.30, 0.45, 0.65, 0.80, 0.95, 1.10];
    notas.forEach(function(freq, i) {
      var osc  = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      var t = ctx.currentTime + tempos[i];
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.linearRampToValueAtTime(0, t + 0.13);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  } catch (e) {}
  _lancarConfetesLaryssa(50);
  _lancarBaloesLaryssa();
}

function _fecharCardLaryssa() {
  var card = document.getElementById('_laryssa-card');
  if (card && card.parentNode) card.parentNode.removeChild(card);
  var inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  esconderSugestoes();
  if (_laryssaTypeTimer) clearInterval(_laryssaTypeTimer);
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
