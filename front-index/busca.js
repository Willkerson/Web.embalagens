// ─────────────────────────────────────────────────────────────
// BUSCA.JS — Sugestões de busca e handlers do campo de pesquisa
// ─────────────────────────────────────────────────────────────

var _sugTimeout = null;
var _tocandoSugestao = false;
var _debouncedSearch = debounce(function(q) { mostrarSugestoes(q); }, 120);

// ═════════════════════════════════════════════════════════════
// 🎂 EASTER EGG — Aniversário da Laryssa
//    Versão CINEMATOGRÁFICA — transforma o site inteiro
// ═════════════════════════════════════════════════════════════

var _L = {
  ativo: false,
  fase: 0,
  audioCtx: null,
  musicando: false,
  musicNodes: [],
  tituloOriginal: null,
  tituloTimer: null,
  particulas: [],
  animFrame: null,
  canvas: null,
  ctx2d: null,
  msgIdx: 0,
  msgCount: 0,
  typeTimer: null,
  comboClicks: 0,
  comboTimer: null,
  comboCount: 0,
  konamiIdx: 0,
  digiSeq: '',
  digiTimer: null,
  horoIdx: 0,
  fatoIdx: 0,
  confetesTotal: 0,
  rainbowOn: false,
  lendaria: false,
};

var _MSGS = [
  'Feliz aniversário, Laryssa! 🎉\n\nQue seu dia seja tão incrível quanto você — e olha que a régua tá alta demais pra maioria das pessoas chegar perto. ✨',
  'Parabéns! 🥳\n\nQue neste novo ano você receba só pedidos urgentes na véspera do feriado.\n\nAh, não — esse é o pesadelo. Que venha muita coisa boa mesmo! 🎁',
  'Hoje é o dia da Laryssa. Aquela que chegou, tomou conta do pedaço e não tem a menor intenção de devolver. 👑\n\nE honestamente? Que bom.',
  'Muitos anos de vida, saúde, alegria e — se o universo tiver generosidade — clientes que mandam briefing completo na primeira mensagem. 🙏✨',
  'Feliz aniversário! 🎂\n\nHoje o universo inteiro conspirou a seu favor. Aproveita, que amanhã o e-mail volta e a caixa de entrada não tem pena de ninguém. 😅💖',
  'Você merece: bolo incrível, zero reunião chata e 100% de pessoas maravilhosas ao redor.\n\nParabéns! 🥂',
  'A Laryssa entrou no chat ✨\n\nE o aniversário nunca mais foi o mesmo. Muitas felicidades, que cada projeto seu carregue um pouco da magia que você tem! 🎈',
  'Que este ano seja tão colorido quanto as embalagens que você cria — e muito mais gostoso. 🎨🎂\n\nParabéns!',
  'Hoje a Laryssa sopra as velinhas e o mundo fica um pouquinho mais feliz.\n\nIsso não é força de expressão. É literal. Muitas felicidades! 🕯️💖',
  'Aniversário da Laryssa — um evento que merecia ingresso, lista VIP e dress code.\n\nParabéns, aniversariante! 🎟️👑',
];

var _HOROSCOPOS = [
  '🔮 Os astros dizem: hoje tudo que você pedir vai sair perfeito. Aproveita enquanto Mercúrio coopera.',
  '⭐ Mercúrio retrógrado? Não pra você. Hoje o universo é seu assistente pessoal e está de bom humor.',
  '🌙 Previsão cósmica: elogios chegando em quantidade industrial. Você merece cada um deles.',
  '✨ Os planetas se alinharam só pra dizer: você arrasou mais uma vez, Laryssa. De novo. Como sempre.',
  '🪐 Saturno, Júpiter e até o Plutão (que nem é planeta mais) se reuniram e mandaram parabéns.',
];

var _FATOS = [
  '📚 Fato científico comprovado: pessoas chamadas Laryssa têm 340% mais estilo que a média global.',
  '🔬 Estudos de Harvard confirmam: a presença da Laryssa aumenta a produtividade do escritório em 78%.',
  '📊 Dado histórico registrado: toda empresa que tem uma Laryssa no time cresce mais rápido. Correlação e causalidade.',
  '🏆 Recorde oficial: "Laryssa" é o nome com maior concentração de talento por letra do alfabeto.',
  '💡 Descoberta recente: o sorriso da Laryssa foi classificado como "perigosamente contagiante" pela comunidade científica.',
];

var _KONAMI = [38,38,40,40,37,39,37,39,66,65];

// ── Listeners globais ──────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  if (_KONAMI[_L.konamiIdx] === e.keyCode) {
    _L.konamiIdx++;
    if (_L.konamiIdx === _KONAMI.length) { _L.konamiIdx = 0; _lModoCinematico(); }
  } else { _L.konamiIdx = 0; }
});

document.addEventListener('keypress', function(e) {
  _L.digiSeq += e.key;
  clearTimeout(_L.digiTimer);
  _L.digiTimer = setTimeout(function() { _L.digiSeq = ''; }, 1200);
  if (_L.digiSeq.slice(-2) === '19') {
    _L.digiSeq = '';
    _lToast(_HOROSCOPOS[Math.floor(Math.random() * _HOROSCOPOS.length)]);
  }
});

// ── Detecção do nome ───────────────────────────────────────────
function _lNormalizar(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
}

function _verificarLaryssa(query) {
  var q = _lNormalizar(query);
  if (['laryssa','larissa','larysa','larisssa','larissa'].indexOf(q) >= 0) {
    if (!_L.ativo) { _L.ativo = true; _lDisparar(); }
    return true;
  }
  return false;
}

// ══════════════════════════════════════════════════════════════
// ORQUESTRADOR PRINCIPAL
// ══════════════════════════════════════════════════════════════
function _lDisparar() {
  _lInjetarEstilos();

  // 1. Fade-out cinematográfico do site
  _lFadeSite(true, function() {
    // 2. Canvas de partículas vivo
    _lIniciarCanvas();

    // 3. Overlay de revelação
    _lCriarOverlayRevela();

    // 4. Troca o título
    _lAnimarTitulo();

    // 5. Libera o site depois de alguns segundos
    setTimeout(function() { _lFadeSite(false); }, 9000);

    // 6. Reseta estado
    setTimeout(function() { _L.ativo = false; }, 12000);
  });
}

// ══════════════════════════════════════════════════════════════
// ESTILOS
// ══════════════════════════════════════════════════════════════
function _lInjetarEstilos() {
  if (document.getElementById('_l-styles')) return;
  var s = document.createElement('style');
  s.id = '_l-styles';
  s.textContent = `
    @keyframes _lFadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes _lFadeOut { from{opacity:1} to{opacity:0} }
    @keyframes _lSlideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
    @keyframes _lPop     { 0%{transform:scale(.5) rotate(-6deg);opacity:0} 70%{transform:scale(1.06) rotate(1deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
    @keyframes _lBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes _lPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes _lShimmer { 0%{background-position:-400% center} 100%{background-position:400% center} }
    @keyframes _lBlink   { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes _lGlow    { 0%,100%{text-shadow:0 0 30px rgba(255,200,100,.4)} 50%{text-shadow:0 0 60px rgba(255,200,100,.9),0 0 120px rgba(255,140,80,.4)} }
    @keyframes _lHalo    { 0%,100%{box-shadow:0 0 0 0 rgba(255,200,100,0)} 50%{box-shadow:0 0 60px 20px rgba(255,200,100,.12)} }
    @keyframes _lFloat   { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-15px) rotate(2deg)} 66%{transform:translateY(-8px) rotate(-1deg)} }
    @keyframes _lWave    { 0%,100%{transform:rotate(0)} 25%{transform:rotate(22deg)} 75%{transform:rotate(-12deg)} }
    @keyframes _lRibbon  { 0%{opacity:0;transform:scaleX(0)} 100%{opacity:1;transform:scaleX(1)} }
    @keyframes _lExpand  { 0%{max-height:0;opacity:0} 100%{max-height:400px;opacity:1} }
    @keyframes _lComboIn { 0%{opacity:0;transform:translate(-50%,-50%) scale(4)} 100%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
    @keyframes _lComboOut{ 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) scale(.5) translateY(-80px)} }
    @keyframes _lToastIn { 0%{opacity:0;transform:translateX(-50%) translateY(16px)} 100%{opacity:1;transform:translateX(-50%) translateY(0)} }
    @keyframes _lToastOut{ from{opacity:1;transform:translateX(-50%)} to{opacity:0;transform:translateX(-50%) translateY(-12px)} }
    @keyframes _lBalloon { 0%{transform:translateY(0) scale(1) rotate(0deg);opacity:1} 100%{transform:translateY(-130vh) scale(.7) rotate(10deg);opacity:0} }
    @keyframes _lProgress{ from{width:0} to{width:100%} }
    @keyframes _lOrbit   { from{transform:rotate(0deg) translateX(44px) rotate(0deg)} to{transform:rotate(360deg) translateX(44px) rotate(-360deg)} }
    @keyframes _lHeartbeat{ 0%,100%{transform:scale(1)} 14%{transform:scale(1.35)} 28%{transform:scale(1)} 42%{transform:scale(1.18)} 70%{transform:scale(1)} }
    @keyframes _lRainbow { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
    @keyframes _lShake   { 0%,100%{transform:translate(-50%,-50%)} 20%{transform:translate(-48%,-52%)} 40%{transform:translate(-52%,-48%)} 60%{transform:translate(-49%,-51%)} 80%{transform:translate(-51%,-49%)} }
    @keyframes _lSiteFade{ from{opacity:1} to{opacity:.06} }
    @keyframes _lSiteBack{ from{opacity:.06} to{opacity:1} }
    @keyframes _lStarPop { 0%{opacity:0;transform:scale(0)} 60%{opacity:1;transform:scale(1.3)} 100%{opacity:1;transform:scale(1)} }
    @keyframes _lPetal   { 0%{transform:translateY(-10px) rotate(0deg) scale(1);opacity:1} 100%{transform:translateY(105vh) rotate(var(--lr)) scale(.4);opacity:0} }
    @keyframes _lCinema  { 0%{opacity:0;transform:scaleY(0)} 100%{opacity:1;transform:scaleY(1)} }
    @keyframes _lCinemaOut{from{opacity:1} to{opacity:0}}

    /* ── Canvas de fundo ── */
    #_l-canvas { position:fixed;inset:0;z-index:9990;pointer-events:none; }

    /* ── Escurecimento cinematográfico ── */
    #_l-cinema-top, #_l-cinema-bot {
      position:fixed;left:0;right:0;z-index:9991;background:#0a0005;
      pointer-events:none;height:0;transition:height .9s cubic-bezier(.4,0,.2,1);
    }
    #_l-cinema-top{top:0;transform-origin:top;}
    #_l-cinema-bot{bottom:0;transform-origin:bottom;}
    #_l-cinema-top.on, #_l-cinema-bot.on { height:10vh; }

    /* ── Overlay de revelação ── */
    #_l-overlay {
      position:fixed;inset:0;z-index:9992;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      pointer-events:none;padding:2rem;box-sizing:border-box;
    }

    /* ── Card principal ── */
    #_l-card {
      position:fixed;inset:0;z-index:9993;
      display:flex;align-items:center;justify-content:center;
      padding:1rem;box-sizing:border-box;
      pointer-events:none;
    }
    #_l-card-inner {
      background:rgba(14,8,22,.95);
      backdrop-filter:blur(24px) saturate(1.8);
      border:1px solid rgba(255,200,120,.2);
      border-radius:28px;
      width:100%;max-width:440px;
      overflow:hidden;
      box-shadow:0 40px 120px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04) inset;
      animation:_lPop .6s cubic-bezier(.34,1.56,.64,1) both;
      pointer-events:all;
    }
    #_l-card-inner.lendaria { animation:_lRainbow 2s linear infinite, _lHalo 2s ease-in-out infinite; }

    /* ── Banner do card ── */
    ._l-banner {
      background:linear-gradient(135deg,#1a0030 0%,#2d0050 40%,#1a001a 100%);
      padding:2.5rem 1.5rem 2rem;
      text-align:center;
      position:relative;
      overflow:hidden;
      cursor:pointer;
    }
    ._l-banner::before {
      content:'';position:absolute;inset:0;
      background:linear-gradient(135deg,rgba(255,160,50,.08),rgba(200,80,255,.06),rgba(80,120,255,.08));
      animation:_lShimmer 4s linear infinite;
      background-size:300% 300%;
    }
    ._l-banner-emoji {
      font-size:4rem;display:block;margin-bottom:.6rem;
      animation:_lFloat 4s ease-in-out infinite;
      position:relative;z-index:1;
      filter:drop-shadow(0 8px 24px rgba(255,200,100,.3));
    }
    ._l-banner-emoji.hit { animation:_lBounce .3s ease both!important; }
    ._l-banner-nome {
      font-size:1.9rem;font-weight:700;color:#fff;margin:0;
      background:linear-gradient(135deg,#ffd700,#ffb347,#ff8c69,#ff69b4);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;
      animation:_lShimmer 3s linear infinite, _lGlow 3s ease-in-out infinite;
      background-size:300% 300%;
      position:relative;z-index:1;
    }
    ._l-banner-sub {
      font-size:.78rem;color:rgba(255,200,100,.6);
      margin:.3rem 0 0;letter-spacing:.15em;text-transform:uppercase;
      position:relative;z-index:1;
    }
    ._l-star-deco {
      position:absolute;color:rgba(255,220,100,.5);
      animation:_lStarPop .5s ease both;
    }

    /* ── Body do card ── */
    ._l-body { padding:1.5rem 1.5rem 1.75rem;color:#e8e0f0; }

    /* ── Tabs ── */
    ._l-tabs { display:flex;gap:6px;margin-bottom:1.25rem; }
    ._l-tab {
      flex:1;padding:.45rem .4rem;
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.08);
      border-radius:99px;font-size:.75rem;cursor:pointer;
      color:rgba(255,255,255,.5);transition:all .2s;
      font-family:inherit;text-align:center;
    }
    ._l-tab.on {
      background:linear-gradient(135deg,rgba(255,180,50,.25),rgba(200,80,255,.2));
      border-color:rgba(255,200,100,.4);
      color:#ffd700;font-weight:600;
    }
    ._l-tab:hover:not(.on) { background:rgba(255,255,255,.07);color:rgba(255,255,255,.75); }

    ._l-panel { display:none; }
    ._l-panel.on { display:block; }

    /* ── Caixa de mensagem ── */
    ._l-msgbox {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,200,100,.12);
      border-radius:14px;padding:1.1rem 1.2rem;
      min-height:80px;font-size:.95rem;color:#f0e8ff;
      line-height:1.7;margin-bottom:1.1rem;
      white-space:pre-line;
    }
    ._l-cursor {
      display:inline-block;width:2px;height:1em;
      background:#ffd700;vertical-align:text-bottom;
      animation:_lBlink .7s infinite;margin-left:2px;
    }

    /* ── Botões ── */
    ._l-actions { display:flex;flex-direction:column;gap:8px; }
    ._l-btn {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.1);
      border-radius:99px;padding:.65rem 1.2rem;
      font-size:.88rem;cursor:pointer;
      color:rgba(255,255,255,.75);
      display:flex;align-items:center;gap:10px;
      transition:all .18s;font-family:inherit;width:100%;
      text-align:left;
    }
    ._l-btn:hover { background:rgba(255,255,255,.09);color:#fff;transform:translateX(4px); }
    ._l-btn:active { transform:scale(.98); }
    ._l-btn-main {
      background:linear-gradient(135deg,rgba(255,160,50,.3),rgba(200,80,255,.25)) !important;
      border-color:rgba(255,200,100,.4) !important;
      color:#ffd700 !important;font-weight:600;
      justify-content:center;
      box-shadow:0 4px 24px rgba(255,160,50,.15);
      animation:_lPulse 2.5s ease-in-out infinite;
    }
    ._l-btn-main:hover { box-shadow:0 8px 36px rgba(255,160,50,.3);transform:scale(1.02) !important; }
    ._l-btn-wave { animation:_lWave .9s ease-in-out infinite; }

    /* ── Seção "sobre você" ── */
    ._l-horo {
      background:rgba(140,60,255,.12);border:1px solid rgba(140,60,255,.25);
      border-radius:12px;padding:.9rem 1rem;margin-bottom:.75rem;
      font-size:.88rem;color:#d4b8ff;line-height:1.6;
    }
    ._l-fato {
      background:rgba(50,180,255,.1);border:1px solid rgba(50,180,255,.2);
      border-radius:12px;padding:.9rem 1rem;margin-bottom:.75rem;
      font-size:.88rem;color:#a8d8ff;line-height:1.6;
    }
    ._l-prog-wrap {
      background:rgba(255,255,255,.08);border-radius:99px;height:6px;
      overflow:hidden;margin:.5rem 0;
    }
    ._l-prog-bar {
      height:100%;
      background:linear-gradient(90deg,#ff8c00,#ffd700,#ff69b4,#c77dff);
      background-size:200% 100%;
      border-radius:99px;
      animation:_lShimmer 2s linear infinite;
    }
    ._l-orbit-wrap {
      position:relative;width:90px;height:90px;
      margin:0 auto .75rem;
      display:flex;align-items:center;justify-content:center;
    }
    ._l-orbit-center { font-size:3rem;animation:_lHeartbeat 1.4s ease-in-out infinite; }
    ._l-orbit-star {
      position:absolute;top:50%;left:50%;
      font-size:.85rem;animation:_lOrbit linear infinite;
    }

    /* ── Seção festa ── */
    ._l-festa-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:.75rem; }
    ._l-festa-btn {
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.08);
      border-radius:14px;padding:1rem .75rem;
      text-align:center;cursor:pointer;
      transition:all .18s;font-family:inherit;color:rgba(255,255,255,.75);
      font-size:.8rem;
    }
    ._l-festa-btn:hover { background:rgba(255,255,255,.1);transform:scale(1.04);color:#fff; }
    ._l-festa-btn .ico { font-size:1.6rem;display:block;margin-bottom:.35rem; }
    ._l-confetes-count {
      text-align:center;font-size:.72rem;
      color:rgba(255,200,100,.5);margin-top:.75rem;
    }

    /* ── Rodapé ── */
    ._l-footer {
      margin-top:1.1rem;padding-top:1.1rem;
      border-top:1px solid rgba(255,255,255,.06);
      display:flex;align-items:center;justify-content:space-between;
    }
    ._l-counter { font-size:.72rem;color:rgba(255,255,255,.3); }
    ._l-fechar {
      background:transparent;border:none;cursor:pointer;
      font-size:.8rem;color:rgba(255,255,255,.3);
      font-family:inherit;padding:.3rem .6rem;border-radius:99px;
      transition:all .15s;
    }
    ._l-fechar:hover { color:rgba(255,255,255,.7);background:rgba(255,255,255,.06); }

    /* ── Toast ── */
    ._l-toast {
      position:fixed;bottom:2.5rem;left:50%;transform:translateX(-50%);
      z-index:10002;background:rgba(20,10,35,.95);
      backdrop-filter:blur(12px);
      border:1px solid rgba(255,200,100,.2);
      color:#f0e8ff;border-radius:14px;
      padding:.75rem 1.5rem;font-size:.85rem;
      pointer-events:none;animation:_lToastIn .3s ease both;
      max-width:90vw;text-align:center;white-space:pre-line;
      box-shadow:0 8px 40px rgba(0,0,0,.5);
    }

    /* ── Combo ── */
    ._l-combo {
      position:fixed;top:50%;left:50%;z-index:10003;
      pointer-events:none;font-size:3.5rem;font-weight:800;
      color:#ffd700;
      text-shadow:0 0 30px rgba(255,215,0,.6),-2px -2px 0 rgba(0,0,0,.4),2px 2px 0 rgba(0,0,0,.4);
      white-space:nowrap;transform:translate(-50%,-50%);
    }

    /* ── Balão ── */
    ._l-balao {
      position:fixed;pointer-events:none;z-index:9989;
      animation:_lBalloon linear forwards;bottom:-80px;
    }

    /* ── Pétala/confete ── */
    ._l-petala {
      position:fixed;top:-20px;pointer-events:none;z-index:9989;
      animation:_lPetal linear forwards;
    }

    /* ── Estrelas do banner ── */
    ._l-banner-star {
      position:absolute;pointer-events:none;
      animation:_lStarPop ease both, _lPulse 2s ease-in-out infinite;
    }

    /* ── Barras de cinema (cima e baixo) ── */
    ._l-bar-cima, ._l-bar-baixo {
      position:fixed;left:0;right:0;background:#000;z-index:9991;
      pointer-events:none;transition:height .8s cubic-bezier(.4,0,.2,1);
      height:0;
    }
    ._l-bar-cima { top:0; }
    ._l-bar-baixo { bottom:0; }
  `;
  document.head.appendChild(s);
}

// ══════════════════════════════════════════════════════════════
// FADE DO SITE + BARRAS DE CINEMA
// ══════════════════════════════════════════════════════════════
function _lFadeSite(entrar, cb) {
  // Barras de cinema
  var cima  = document.getElementById('_l-bar-cima')  || _lCriarEl('div','_l-bar-cima _l-bar-cima');
  var baixo = document.getElementById('_l-bar-baixo') || _lCriarEl('div','_l-bar-baixo _l-bar-baixo');
  if (!cima.parentNode)  { cima.id  = '_l-bar-cima';  document.body.appendChild(cima);  }
  if (!baixo.parentNode) { baixo.id = '_l-bar-baixo'; document.body.appendChild(baixo); }

  if (entrar) {
    // Escurece o site
    document.body.style.transition = 'filter 1.2s ease';
    document.body.style.filter = 'brightness(.08) saturate(.3) blur(2px)';
    cima.style.height  = '12vh';
    baixo.style.height = '12vh';
    setTimeout(function() { if (cb) cb(); }, 900);
  } else {
    // Restaura
    document.body.style.filter = '';
    cima.style.height  = '0';
    baixo.style.height = '0';
    setTimeout(function() {
      if (cima.parentNode)  cima.parentNode.removeChild(cima);
      if (baixo.parentNode) baixo.parentNode.removeChild(baixo);
      document.body.style.transition = '';
    }, 1000);
  }
}

function _lCriarEl(tag, cls) {
  var el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
}

// ══════════════════════════════════════════════════════════════
// CANVAS DE PARTÍCULAS
// ══════════════════════════════════════════════════════════════
function _lIniciarCanvas() {
  var c = document.createElement('canvas');
  c.id = '_l-canvas';
  c.width  = window.innerWidth;
  c.height = window.innerHeight;
  document.body.appendChild(c);
  _L.canvas = c;
  _L.ctx2d  = c.getContext('2d');

  // Cria partículas iniciais
  _L.particulas = [];
  for (var i = 0; i < 80; i++) _lAddParticula();

  _lAnimarCanvas();

  window.addEventListener('resize', _lResizeCanvas);
}

function _lResizeCanvas() {
  if (_L.canvas) { _L.canvas.width = window.innerWidth; _L.canvas.height = window.innerHeight; }
}

function _lAddParticula() {
  var cores = ['#ffd700','#ff8c00','#ff69b4','#c77dff','#7b9fff','#ff6eb4','#fff3b0','#fffacd'];
  _L.particulas.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 1 + Math.random() * 2.5,
    cor: cores[Math.floor(Math.random() * cores.length)],
    vx: (Math.random() - .5) * .6,
    vy: -.3 - Math.random() * .8,
    alfa: .2 + Math.random() * .7,
    pulso: Math.random() * Math.PI * 2,
    pulsov: .02 + Math.random() * .04,
    vida: 1,
  });
}

function _lAnimarCanvas() {
  if (!_L.canvas) return;
  var ctx = _L.ctx2d;
  ctx.clearRect(0, 0, _L.canvas.width, _L.canvas.height);

  for (var i = _L.particulas.length - 1; i >= 0; i--) {
    var p = _L.particulas[i];
    p.x += p.vx + (_L.lendaria ? (Math.random()-.5)*.5 : 0);
    p.y += p.vy;
    p.pulso += p.pulsov;
    p.vida  -= .003;
    if (p.y < -20 || p.vida <= 0) { _L.particulas.splice(i, 1); _lAddParticula(); continue; }
    var a = p.alfa * (.5 + .5 * Math.sin(p.pulso)) * p.vida;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (1 + .3 * Math.sin(p.pulso)), 0, Math.PI * 2);
    ctx.fillStyle = p.cor;
    ctx.globalAlpha = a;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  _L.animFrame = requestAnimationFrame(_lAnimarCanvas);
}

function _lPararCanvas() {
  if (_L.animFrame) cancelAnimationFrame(_L.animFrame);
  var c = document.getElementById('_l-canvas');
  if (c) c.parentNode.removeChild(c);
  window.removeEventListener('resize', _lResizeCanvas);
  _L.canvas = null; _L.ctx2d = null; _L.animFrame = null;
}

// ══════════════════════════════════════════════════════════════
// OVERLAY DE REVELAÇÃO (aparece antes do card)
// ══════════════════════════════════════════════════════════════
function _lCriarOverlayRevela() {
  // Texto central flutuante — revelação cinematográfica
  var ov = document.createElement('div');
  ov.id = '_l-overlay-revela';
  ov.style.cssText = 'position:fixed;inset:0;z-index:9992;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;';

  var linhas = [
    { txt: '✦', sz: '3rem', delay: 100,  cor: 'rgba(255,215,0,.4)',  dur: 600 },
    { txt: 'Hoje é um dia especial.', sz: '1.5rem', delay: 700,  cor: 'rgba(255,255,255,.15)', dur: 800 },
    { txt: 'É o dia da', sz: '1.1rem', delay: 1400, cor: 'rgba(255,200,100,.5)',  dur: 600 },
    { txt: 'Laryssa', sz: '4.5rem', delay: 1900, cor: '#ffd700', dur: 800, glow: true },
  ];

  linhas.forEach(function(l) {
    var el = document.createElement('div');
    el.style.cssText = [
      'font-size:' + l.sz,
      'color:' + l.cor,
      'font-weight:' + (l.glow ? '800' : '400'),
      'letter-spacing:' + (l.glow ? '.05em' : '.2em'),
      'text-align:center',
      'opacity:0',
      'animation:_lSlideUp ' + l.dur + 'ms cubic-bezier(.34,1.2,.64,1) ' + l.delay + 'ms both',
      l.glow ? 'animation:_lSlideUp ' + l.dur + 'ms cubic-bezier(.34,1.2,.64,1) ' + l.delay + 'ms both,_lGlow 2s ease-in-out infinite ' + (l.delay + l.dur) + 'ms' : '',
      l.glow ? 'background:linear-gradient(135deg,#ffd700,#ffb347,#ff8c69,#ff69b4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text' : '',
    ].filter(Boolean).join(';');
    ov.appendChild(el);
    setTimeout(function() { el.style.opacity = '1'; }, l.delay);

    // Digita "Laryssa" com efeito de máquina de escrever
    if (l.glow) {
      el.textContent = '';
      var nome = l.txt;
      var ii = 0;
      setTimeout(function() {
        var t = setInterval(function() {
          if (ii < nome.length) { el.textContent += nome[ii]; ii++; }
          else clearInterval(t);
        }, 70);
      }, l.delay + 100);
    } else {
      el.textContent = l.txt;
    }
  });

  document.body.appendChild(ov);

  // Balões e confetes na revelação
  setTimeout(function() { _lLancarBaloes(12); }, 1800);
  setTimeout(function() { _lLancarPetalas(40); }, 2000);

  // Abre o card depois da revelação
  setTimeout(function() {
    // Remove overlay
    ov.style.transition = 'opacity .8s';
    ov.style.opacity = '0';
    setTimeout(function() { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 900);
    _lCriarCard();
    _lSomRevela();
  }, 3200);
}

// ══════════════════════════════════════════════════════════════
// CARD PRINCIPAL
// ══════════════════════════════════════════════════════════════
function _lCriarCard() {
  var wrap = document.createElement('div');
  wrap.id = '_l-card';

  var orbitStars = '';
  for (var os = 0; os < 6; os++) {
    orbitStars += '<div class="_l-orbit-star" style="animation-duration:' + (2.2 + os * .35) + 's;animation-delay:' + (os * .18) + 's">✦</div>';
  }

  var bannerStars = '';
  [[8,12,'0s'],[12,85,'.4s'],[60,6,'.8s'],[65,88,'.6s'],[35,48,'1s'],[20,55,'.2s']].forEach(function(p) {
    bannerStars += '<span class="_l-banner-star" style="top:' + p[0] + '%;left:' + p[1] + '%;animation-delay:' + p[2] + ';animation-duration:' + (1.5 + Math.random()) + 's">✦</span>';
  });

  wrap.innerHTML = '<div id="_l-card-inner">' +

    '<div class="_l-banner" onclick="_lBannerClick()">' +
      bannerStars +
      '<span class="_l-banner-emoji" id="_l-emoji">🎂</span>' +
      '<h2 class="_l-banner-nome" id="_l-nome">Feliz Aniversário!</h2>' +
      '<p class="_l-banner-sub">Laryssa · A pessoa mais especial do escritório</p>' +
    '</div>' +

    '<div class="_l-body">' +
      '<div class="_l-tabs">' +
        '<button class="_l-tab on" onclick="_lTab(\'msg\',this)">💌 Mensagem</button>' +
        '<button class="_l-tab" onclick="_lTab(\'festa\',this)">🎊 Festa</button>' +
        '<button class="_l-tab" onclick="_lTab(\'voce\',this)">👑 Você</button>' +
      '</div>' +

      '<div class="_l-panel on" id="_l-panel-msg">' +
        '<div class="_l-msgbox"><span id="_l-typed"></span><span class="_l-cursor"></span></div>' +
        '<div class="_l-actions">' +
          '<button class="_l-btn _l-btn-main" onclick="_lNovaMsg()">' +
            '<span class="_l-btn-wave" style="font-size:1.1rem">👋</span>' +
            '<span style="flex:1">Mais uma mensagem de parabéns</span>' +
            '<span style="font-size:.75rem;opacity:.6">✨</span>' +
          '</button>' +
          '<button class="_l-btn" onclick="_lCopiar()">' +
            '<span style="font-size:1rem;width:20px;text-align:center">📋</span>' +
            '<span style="flex:1">Copiar mensagem</span>' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="_l-panel" id="_l-panel-festa">' +
        '<div class="_l-festa-grid">' +
          '<button class="_l-festa-btn" onclick="_lLancarPetalas(120)">' +
            '<span class="ico">🎊</span>Confetes' +
          '</button>' +
          '<button class="_l-festa-btn" onclick="_lLancarBaloes(20)">' +
            '<span class="ico">🎈</span>Balões' +
          '</button>' +
          '<button class="_l-festa-btn" onclick="_lFanfarra()">' +
            '<span class="ico">🎺</span>Fanfarra' +
          '</button>' +
          '<button class="_l-festa-btn" onclick="_lParabensMusica()">' +
            '<span class="ico" id="_l-mus-ico">🎵</span>' +
            '<span id="_l-mus-txt">Parabéns</span>' +
          '</button>' +
          '<button class="_l-festa-btn" onclick="_lModoRainbow()">' +
            '<span class="ico">🌈</span>Arco-íris' +
          '</button>' +
          '<button class="_l-festa-btn" onclick="_lModoCinematico()">' +
            '<span class="ico">🚀</span>Modo Lendária' +
          '</button>' +
        '</div>' +
        '<div class="_l-confetes-count">🎊 <span id="_l-ct">0</span> confetes lançados</div>' +
      '</div>' +

      '<div class="_l-panel" id="_l-panel-voce">' +
        '<div class="_l-orbit-wrap"><div class="_l-orbit-center">🌟</div>' + orbitStars + '</div>' +
        '<div id="_l-horo" class="_l-horo">Consultando os astros...</div>' +
        '<div id="_l-fato" class="_l-fato">Calculando sua genialidade...</div>' +
        '<div style="margin-top:.9rem">' +
          '<div style="font-size:.72rem;color:rgba(255,200,100,.5);margin-bottom:6px">Nível de amostradice</div>' +
          '<div class="_l-prog-wrap"><div class="_l-prog-bar" id="_l-prog" style="width:0;transition:width 1.6s ease .3s"></div></div>' +
          '<div style="font-size:.7rem;color:#ffd700;text-align:right;margin-top:4px;font-weight:600">OFF THE CHARTS 📈</div>' +
        '</div>' +
        '<button class="_l-btn" onclick="_lNovoFato()" style="margin-top:.9rem">' +
          '<span style="font-size:1rem;width:20px;text-align:center">🔄</span>' +
          '<span style="flex:1">Novo fato científico</span>' +
        '</button>' +
      '</div>' +

      '<div class="_l-footer">' +
        '<span class="_l-counter">🎁 <span id="_l-count">0</span> mensagens · <span id="_l-streak"></span></span>' +
        '<button class="_l-fechar" onclick="_lFechar()">💖 Fechar</button>' +
      '</div>' +
    '</div>' +

  '</div>';

  document.body.appendChild(wrap);

  // Anima barra de progresso
  setTimeout(function() { var b = document.getElementById('_l-prog'); if (b) b.style.width = '100%'; }, 200);
  _lAtualizarVoce();
  _lNovaMsg();

  // Clique fora fecha
  setTimeout(function() {
    document.addEventListener('click', function _fc(e) {
      var c = document.getElementById('_l-card-inner');
      if (c && !c.contains(e.target)) { _lFechar(); document.removeEventListener('click', _fc); }
    });
  }, 800);
}

// ══════════════════════════════════════════════════════════════
// INTERAÇÕES DO CARD
// ══════════════════════════════════════════════════════════════
function _lTab(nome, btn) {
  document.querySelectorAll('._l-tab').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  document.querySelectorAll('._l-panel').forEach(function(p) { p.classList.remove('on'); });
  var p = document.getElementById('_l-panel-' + nome);
  if (p) p.classList.add('on');
  if (nome === 'voce') {
    _lAtualizarVoce();
    setTimeout(function() {
      var bar = document.getElementById('_l-prog');
      if (bar) { bar.style.transition = 'none'; bar.style.width = '0'; setTimeout(function() { bar.style.transition = 'width 1.5s ease'; bar.style.width = '100%'; }, 50); }
    }, 0);
  }
}

function _lBannerClick() {
  _L.comboClicks++;
  var e = document.getElementById('_l-emoji');
  if (e) { e.classList.remove('hit'); void e.offsetWidth; e.classList.add('hit'); setTimeout(function() { e.classList.remove('hit'); }, 350); }
  _L.comboCount++;
  clearTimeout(_L.comboTimer);
  _L.comboTimer = setTimeout(function() { _L.comboCount = 0; }, 1600);
  if (_L.comboCount >= 3) _lMostrarCombo(_L.comboCount);
  _lLancarPetalas(10);
  if (_L.comboClicks === 7)  _lToast('🎂 Sete cliques. Você claramente ama bolo.');
  if (_L.comboClicks === 15) _lToast('👑 15 cliques. Status: fã número 1 de si mesma. Merecido.');
  if (_L.comboClicks === 25) { _lToast('🚀 25 cliques! Modo lendária: ativado.'); _lModoCinematico(); }
}

function _lMostrarCombo(n) {
  var labels = {3:'COMBO x3! 🔥', 5:'FANTÁSTICA x5! 💥', 7:'LENDÁRIA x7! 👑', 10:'MITOLÓGICA! ✨', 15:'IMPOSSÍVEL! 🌌'};
  var txt = labels[n] || (n >= 10 ? '× ' + n + ' 🚀' : null);
  if (!txt) return;
  var el = document.createElement('div');
  el.className = '_l-combo';
  el.textContent = txt;
  el.style.animation = '_lComboIn .35s ease both';
  document.body.appendChild(el);
  setTimeout(function() {
    el.style.animation = '_lComboOut .4s ease both';
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
  }, 1400);
}

function _lNovaMsg() {
  var el = document.getElementById('_l-typed');
  var cnt = document.getElementById('_l-count');
  if (!el) return;
  var msg = _MSGS[_L.msgIdx % _MSGS.length];
  _L.msgIdx++; _L.msgCount++;
  if (cnt) cnt.textContent = _L.msgCount;
  var streak = document.getElementById('_l-streak');
  if (streak) {
    var fogo = _L.msgCount >= 5 ? '🔥'.repeat(Math.min(Math.floor(_L.msgCount / 5), 5)) : '';
    streak.textContent = fogo ? _L.msgCount + ' seguidas ' + fogo : '';
  }
  if (_L.typeTimer) clearInterval(_L.typeTimer);
  el.textContent = ''; var i = 0;
  _L.typeTimer = setInterval(function() {
    if (i < msg.length) { el.textContent += msg[i]; i++; }
    else {
      clearInterval(_L.typeTimer);
      if (_L.msgIdx % 3 === 0) _lLancarPetalas(25);
      if (_L.msgIdx % 7 === 0) _lToast('🎉 Você realmente merece cada uma dessas mensagens!');
    }
  }, 22);
  _lLancarPetalas(18);
  if (_L.msgCount === 5)  { _lToast('⭐ Nível 2 desbloqueado! Você é imparável.'); }
  if (_L.msgCount === 10) { _lModoCinematico(); }
}

function _lCopiar() {
  var el = document.getElementById('_l-typed');
  var txt = el ? el.textContent : '';
  if (!txt) { _lToast('Aguarda a mensagem terminar! ✨'); return; }
  try {
    navigator.clipboard.writeText(txt).then(function() {
      _lToast('✅ Copiado! Manda no grupo da família 😄');
    });
  } catch(e) { _lToast('Seleciona e copia manualmente 🙏'); }
}

function _lAtualizarVoce() {
  var h = document.getElementById('_l-horo');
  var f = document.getElementById('_l-fato');
  if (h) h.textContent = _HOROSCOPOS[_L.horoIdx % _HOROSCOPOS.length];
  if (f) f.textContent = _FATOS[_L.fatoIdx % _FATOS.length];
}

function _lNovoFato() {
  _L.fatoIdx++; _L.horoIdx++;
  _lAtualizarVoce();
  _lLancarPetalas(15);
}

// ══════════════════════════════════════════════════════════════
// EFEITOS VISUAIS
// ══════════════════════════════════════════════════════════════
function _lLancarPetalas(n) {
  n = n || 40;
  _L.confetesTotal += n;
  var ct = document.getElementById('_l-ct');
  if (ct) ct.textContent = _L.confetesTotal;
  var cores = ['#ffd700','#ffb347','#ff69b4','#c77dff','#7baaff','#ff6eb4','#adff2f','#fff'];
  var frag = document.createDocumentFragment();
  for (var i = 0; i < n; i++) {
    (function() {
      var el = document.createElement('div');
      el.className = '_l-petala';
      var rot = (Math.random() * 720 - 360) + 'deg';
      el.style.setProperty('--lr', rot);
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.width  = (5 + Math.random() * 8) + 'px';
      el.style.height = (7 + Math.random() * 11) + 'px';
      el.style.background = cores[Math.floor(Math.random() * cores.length)];
      el.style.borderRadius = Math.random() > .5 ? '50%' : (Math.random() > .5 ? '2px' : '0 50% 50% 50%');
      el.style.animationDelay    = (Math.random() * .9) + 's';
      el.style.animationDuration = (2.2 + Math.random() * 2.5) + 's';
      el.style.opacity = '.9';
      frag.appendChild(el);
    })();
  }
  document.body.appendChild(frag);
  setTimeout(function() {
    document.querySelectorAll('._l-petala').forEach(function(el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }, 6500);
}

function _lLancarBaloes(n) {
  n = n || 12;
  var emojis = ['🎈','🎀','🎊','💖','✨','🌟','🥳','🎉','💫','🌈','💝','🎁'];
  for (var b = 0; b < n; b++) {
    (function(b) {
      var el = document.createElement('div');
      el.className = '_l-balao';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left     = (2 + Math.random() * 96) + 'vw';
      el.style.fontSize = (1.4 + Math.random() * 2) + 'rem';
      el.style.animationDelay    = (b * .12) + 's';
      el.style.animationDuration = (3.5 + Math.random() * 3.5) + 's';
      document.body.appendChild(el);
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 9000);
    })(b);
  }
  _lLancarPetalas(12);
}

function _lToast(msg) {
  var old = document.querySelector('._l-toast');
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var el = document.createElement('div');
  el.className = '_l-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function() {
    el.style.animation = '_lToastOut .35s ease both';
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }, 3500);
}

// ══════════════════════════════════════════════════════════════
// MODOS ESPECIAIS
// ══════════════════════════════════════════════════════════════
function _lModoRainbow() {
  _L.rainbowOn = !_L.rainbowOn;
  var c = document.getElementById('_l-card-inner');
  if (c) c.classList.toggle('lendaria', _L.rainbowOn);
  _lToast(_L.rainbowOn ? '🌈 Modo arco-íris ativado! Olha que lindo.' : '🌈 Modo arco-íris desligado. Por ora.');
  _lLancarPetalas(35);
}

function _lModoCinematico() {
  _L.lendaria = true;
  _lLancarPetalas(180);
  _lLancarBaloes(25);
  _lFanfarra();
  var c = document.getElementById('_l-card-inner');
  if (c) {
    var orig = c.style.animation;
    c.style.animation = '_lShake .45s ease both';
    setTimeout(function() { c.style.animation = orig; }, 500);
  }
  _lToast('🚀 MODO LENDÁRIA ATIVADO!\nA festa agora é imortal.');
  setTimeout(function() { _lLancarPetalas(120); _lLancarBaloes(18); }, 1800);
  setTimeout(function() { _lLancarPetalas(80);  }, 3500);
  setTimeout(function() { _lLancarPetalas(60);  }, 5000);
}

// ══════════════════════════════════════════════════════════════
// ÁUDIO
// ══════════════════════════════════════════════════════════════
function _lCtx() {
  if (!_L.audioCtx) _L.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _L.audioCtx;
}

function _lNota(ctx, freq, t, dur, tipo, vol) {
  var osc  = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = tipo || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol || .15, t + .03);
  gain.gain.setValueAtTime(vol || .15, t + dur - .05);
  gain.gain.linearRampToValueAtTime(0, t + dur);
  osc.start(t); osc.stop(t + dur + .05);
  return osc;
}

function _lSomRevela() {
  try {
    var ctx = _lCtx();
    var t = ctx.currentTime;
    // Acorde de revelação — Dó maior / Mi maior subindo
    [[261,.2,'sine',.08],[329,.3,'sine',.06],[392,.4,'triangle',.05],[523,.5,'sine',.1]].forEach(function(n) {
      _lNota(ctx, n[0], t + n[1], .8, n[2], n[3]);
    });
    // Brilho agudo
    _lNota(ctx, 1046, t + .6, .5, 'triangle', .04);
  } catch(e) {}
}

function _lFanfarra() {
  try {
    var ctx = _lCtx();
    var notas  = [523,659,784,1047,784,1047,784,1047];
    var tempos = [0,.15,.30,.45,.65,.80,.95,1.10];
    notas.forEach(function(freq, i) {
      _lNota(ctx, freq, ctx.currentTime + tempos[i], .13, 'triangle', .18);
    });
  } catch(e) {}
  _lLancarPetalas(55);
  _lLancarBaloes(14);
}

function _lParabensMusica() {
  var icoEl = document.getElementById('_l-mus-ico');
  var txtEl = document.getElementById('_l-mus-txt');
  if (_L.musicando) {
    _L.musicNodes.forEach(function(n) { try { n.stop(); } catch(e){} });
    _L.musicNodes = []; _L.musicando = false;
    if (icoEl) icoEl.textContent = '🎵';
    if (txtEl) txtEl.textContent = 'Parabéns';
    return;
  }
  try {
    var ctx = _lCtx();
    var parens = [
      [392,.75],[392,.25],[440,1],[392,1],[523,1],[494,2],
      [392,.75],[392,.25],[440,1],[392,1],[587,1],[523,2],
      [392,.75],[392,.25],[784,1],[659,1],[523,1],[494,1],[440,2],
      [698,.75],[698,.25],[659,1],[523,1],[587,1],[523,2]
    ];
    var bpm = 112, beat = 60 / bpm, t = ctx.currentTime + .1, totalDur = 0;
    parens.forEach(function(n) { totalDur += n[1] * beat; });
    _L.musicando = true;
    if (icoEl) icoEl.textContent = '⏹';
    if (txtEl) txtEl.textContent = 'Parar';
    parens.forEach(function(nota) {
      var osc = _lNota(ctx, nota[0], t, nota[1] * beat, 'sine', .14);
      _L.musicNodes.push(osc);
      t += nota[1] * beat;
    });
    setTimeout(function() {
      _L.musicando = false; _L.musicNodes = [];
      if (icoEl) icoEl.textContent = '🎵';
      if (txtEl) txtEl.textContent = 'Parabéns';
    }, (totalDur + .5) * 1000);
    _lLancarPetalas(35);
    _lLancarBaloes(10);
  } catch(e) { _lToast('Não foi possível tocar o áudio 😅'); }
}

// ══════════════════════════════════════════════════════════════
// TÍTULO ANIMADO
// ══════════════════════════════════════════════════════════════
function _lAnimarTitulo() {
  if (_L.tituloOriginal === null) _L.tituloOriginal = document.title;
  clearInterval(_L.tituloTimer);
  var frames = ['🎂 Feliz Aniversário!','🎉 Parabéns Laryssa!','🎈 É hoje!','👑 Rainha do dia!','✨ Que dia incrível!'];
  var idx = 0;
  _L.tituloTimer = setInterval(function() {
    document.title = frames[idx % frames.length]; idx++;
  }, 950);
  setTimeout(function() {
    clearInterval(_L.tituloTimer);
    if (_L.tituloOriginal !== null) document.title = _L.tituloOriginal;
  }, 18000);
}

// ══════════════════════════════════════════════════════════════
// FECHAR
// ══════════════════════════════════════════════════════════════
function _lFechar() {
  // Restaura o site
  document.body.style.filter = '';
  document.body.style.transition = '';

  // Remove elementos
  ['_l-card','_l-overlay-revela','_l-bar-cima','_l-bar-baixo'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });

  // Para canvas
  _lPararCanvas();

  // Limpa áudio
  _L.musicNodes.forEach(function(n) { try { n.stop(); } catch(e){} });
  _L.musicNodes = []; _L.musicando = false;

  // Limpa título
  if (_L.tituloTimer) { clearInterval(_L.tituloTimer); document.title = _L.tituloOriginal || document.title; }

  // Limpa tipo
  if (_L.typeTimer) clearInterval(_L.typeTimer);

  // Reset estado
  _L.lendaria = false; _L.rainbowOn = false;

  // Limpa input
  var inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  esconderSugestoes();
}

// ═════════════════════════════════════════════════════════════
// FIM DO EASTER EGG
// ═════════════════════════════════════════════════════════════

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
  box.addEventListener('touchstart', function() { _tocandoSugestao = true; }, { passive: true });
  box.addEventListener('touchend',   function() { setTimeout(function() { _tocandoSugestao = false; }, 500); }, { passive: true });
});

function mostrarSugestoes(query) {
  var box = document.getElementById('searchSuggestions');
  if (!box) return;
  if (!query || query.length < 2) { esconderSugestoes(); return; }

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
  estado.busca = prod.nome.toLowerCase();
  estado.cat   = 'todos';
  estado.sub   = 'todas';
  estado.marca = 'todas';
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
