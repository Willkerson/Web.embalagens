// ─────────────────────────────────────────────────────────────
// BUSCA.JS — Sugestões de busca e handlers do campo de pesquisa
// ─────────────────────────────────────────────────────────────

var _sugTimeout = null;
var _tocandoSugestao = false;
var _debouncedSearch = debounce(function(q) { mostrarSugestoes(q); }, 120);

// ─────────────────────────────────────────────────────────────
// 🎂 EASTER EGG — Aniversário da Laryssa (versão amostrada++)
// ─────────────────────────────────────────────────────────────
var _laryssaAtivado   = false;
var _laryssaMsgIdx    = 0;
var _laryssaTypeTimer = null;
var _laryssaMsgCount  = 0;
var _laryssaCombo     = 0;
var _laryssaComboTimer= null;
var _laryssaKonamiIdx = 0;
var _laryssaKonamiSeq = [38,38,40,40,37,39,37,39,66,65]; // ↑↑↓↓←→←→BA
var _laryssaDigitoSeq = '';
var _laryssaDigitoTimer = null;
var _laryssaFase      = 1;
var _laryssaConfetesTotal = 0;
var _laryssaAudioCtx  = null;
var _laryssaMusicPlaying = false;
var _laryssaMusicNodes = [];

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
  'Parabéns! Que cada embalagem que você criar neste ano carregue um pouco da magia que você tem. 📦✨💖',
  'Laryssa, você é o tipo de pessoa que deixa qualquer ambiente mais bonito só de aparecer. Feliz aniversário! 🌟',
  'Que este ano seja tão colorido quanto as embalagens que você faz — e muito mais gostoso! 🎨🎂',
  'Parabéns! Que as suas ideias continuem chegando rápido, o Wi-Fi nunca caia e o café esteja sempre fresquinho. ☕✨',
  'Hoje a Laryssa sopra as velinhas e o mundo fica um pouquinho mais feliz. Muitas felicidades! 🕯️💖',
  'Aniversário da Laryssa! Um evento que merecia ingresso e lista VIP. Parabéns! 🎟️👑'
];

var _laryssaHoroscopos = [
  '🔮 Os astros dizem: hoje tudo que você pedir vai sair perfeito. Aproveita.',
  '⭐ Mercúrio retrógrado? Não pra você. Hoje o universo é seu assistente pessoal.',
  '🌙 Previsão cósmica: elogios chegando em quantidade industrial. Você merece.',
  '✨ Os planetas se alinharam só pra dizer: você arrasou mais uma vez, Laryssa.',
  '🪐 Saturno, Júpiter e até o Plutão (que nem é planeta mais) mandam parabéns.',
];

var _laryssaFatos = [
  '📚 Fato científico: pessoas chamadas Laryssa têm 340% mais estilo que a média.',
  '🔬 Estudos confirmam: a presença da Laryssa aumenta a produtividade do escritório em 78%.',
  '📊 Dado histórico: toda empresa que tem uma Laryssa no time cresce mais rápido.',
  '🏆 Recorde registrado: Laryssa é o nome com maior concentração de talento por letra.',
  '💡 Curiosidade: o sorriso da Laryssa foi classificado como "perigosamente contagiante" pela ciência.',
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

// ── Konami code ──
document.addEventListener('keydown', function(e) {
  if (_laryssaKonamiSeq[_laryssaKonamiIdx] === e.keyCode) {
    _laryssaKonamiIdx++;
    if (_laryssaKonamiIdx === _laryssaKonamiSeq.length) {
      _laryssaKonamiIdx = 0;
      _laryssaModoPandemia();
    }
  } else {
    _laryssaKonamiIdx = 0;
  }
});

// ── Digitar "19" abre horóscopo ──
document.addEventListener('keypress', function(e) {
  _laryssaDigitoSeq += e.key;
  clearTimeout(_laryssaDigitoTimer);
  _laryssaDigitoTimer = setTimeout(function() { _laryssaDigitoSeq = ''; }, 1200);
  if (_laryssaDigitoSeq.slice(-2) === '19') {
    _laryssaDigitoSeq = '';
    _laryssaMostrarToast(_laryssaHoroscopos[Math.floor(Math.random() * _laryssaHoroscopos.length)]);
  }
});

function _dispararAniversario() {
  _injetarEstilosLaryssa();
  _lancarConfetesLaryssa(35);
  setTimeout(function() { _lancarBaloesLaryssa(); }, 200);
  _criarCardLaryssa();
  _laryssaTrocarTitulo();
  setTimeout(function() { _laryssaAtivado = false; }, 10000);
}

// ── Título da aba animado ──
var _laryssaTituloOriginal = null;
var _laryssaTituloTimer = null;
var _laryssaTituloFrames = ['🎂 Feliz Aniversário!','🎉 Parabéns Laryssa!','🎈 É hoje!','👑 Rainha do dia!','✨ Feliz Aniversário!'];
var _laryssaTituloIdx = 0;
function _laryssaTrocarTitulo() {
  if (_laryssaTituloOriginal === null) _laryssaTituloOriginal = document.title;
  clearInterval(_laryssaTituloTimer);
  _laryssaTituloTimer = setInterval(function() {
    document.title = _laryssaTituloFrames[_laryssaTituloIdx % _laryssaTituloFrames.length];
    _laryssaTituloIdx++;
  }, 900);
  setTimeout(function() {
    clearInterval(_laryssaTituloTimer);
    document.title = _laryssaTituloOriginal;
  }, 18000);
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
    '@keyframes _lRainbow{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}',
    '@keyframes _lShake{0%,100%{transform:translate(-50%,-50%) rotate(0deg)}20%{transform:translate(-48%,-50%) rotate(-2deg)}40%{transform:translate(-52%,-50%) rotate(2deg)}60%{transform:translate(-48%,-50%) rotate(-1deg)}80%{transform:translate(-52%,-50%) rotate(1deg)}}',
    '@keyframes _lComboIn{0%{opacity:0;transform:translate(-50%,-50%) scale(3)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
    '@keyframes _lComboOut{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.5) translateY(-60px)}}',
    '@keyframes _lToastIn{0%{opacity:0;transform:translateX(-50%) translateY(20px)}100%{opacity:1;transform:translateX(-50%) translateY(0)}}',
    '@keyframes _lToastOut{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-20px)}}',
    '@keyframes _lHeartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.3)}28%{transform:scale(1)}42%{transform:scale(1.15)}70%{transform:scale(1)}}',
    '@keyframes _lStarOrbit{from{transform:rotate(0deg) translateX(38px) rotate(0deg)}to{transform:rotate(360deg) translateX(38px) rotate(-360deg)}}',
    '@keyframes _lCakeBounce{0%,100%{transform:scale(1) rotate(0deg)}30%{transform:scale(1.2) rotate(-5deg)}60%{transform:scale(1.1) rotate(3deg)}}',
    '@keyframes _lProgressFill{from{width:0}to{width:100%}}',
    '._l-piece{position:fixed;pointer-events:none;z-index:9997;animation:_lPiecefall linear forwards;}',
    '._l-balloon{position:fixed;bottom:-60px;pointer-events:none;z-index:9997;animation:_lBalloon linear forwards;}',
    '._l-card{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;pointer-events:all;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,.28);max-width:400px;width:92vw;animation:_lCardPop .55s cubic-bezier(.34,1.56,.64,1) both;}',
    '._l-banner{background:linear-gradient(135deg,#ff6b6b,#ffd93d,#c77dff,#4d96ff);background-size:300% 300%;animation:_lShimmer 3s linear infinite;padding:1.75rem 1.5rem 1.25rem;text-align:center;position:relative;cursor:pointer;}',
    '._l-emoji{font-size:3.5rem;display:block;margin-bottom:.4rem;animation:_lBounce 1.5s ease-in-out infinite;filter:drop-shadow(0 4px 8px rgba(0,0,0,.2));}',
    '._l-emoji.clicked{animation:_lCakeBounce .4s ease both!important;}',
    '._l-name{font-size:1.6rem;font-weight:600;color:#fff;margin:0;text-shadow:0 2px 12px rgba(0,0,0,.25);animation:_lPulse 2s ease-in-out infinite;}',
    '._l-sub{font-size:.75rem;color:rgba(255,255,255,.85);margin:.2rem 0 0;letter-spacing:.1em;text-transform:uppercase;}',
    '._l-star{position:absolute;color:#fff;font-size:.9rem;animation:_lSparkle 1.5s ease-in-out infinite;opacity:0;}',
    '._l-body{padding:1.25rem 1.25rem 1.5rem;background:#fff;}',
    '._l-tabs{display:flex;gap:6px;margin-bottom:1rem;}',
    '._l-tab{flex:1;padding:.45rem .5rem;border:.5px solid #ddd;background:#fff;border-radius:99px;font-size:.75rem;cursor:pointer;color:#666;transition:all .15s;font-family:inherit;text-align:center;}',
    '._l-tab.on{background:linear-gradient(135deg,#ff6b6b,#ffd93d);color:#fff;border-color:transparent;font-weight:600;}',
    '._l-tab:hover:not(.on){background:#f5f5f5;}',
    '._l-panel{display:none;}._l-panel.on{display:block;}',
    '._l-msgbox{background:#f7f7f7;border-radius:12px;padding:.9rem 1rem;margin-bottom:1rem;min-height:60px;font-size:.92rem;color:#333;line-height:1.6;}',
    '._l-cursor{display:inline-block;width:2px;height:1em;background:#888;vertical-align:text-bottom;animation:_lBlink .7s infinite;margin-left:1px;}',
    '._l-actions{display:flex;flex-direction:column;gap:8px;}',
    '._l-btn{border:.5px solid #ddd;background:#fff;color:#333;border-radius:99px;padding:.6rem 1.1rem;font-size:.88rem;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;transition:all .15s;font-family:inherit;width:100%;}',
    '._l-btn:hover{background:#f5f5f5;transform:translateX(4px);}',
    '._l-btn:active{transform:scale(.98);}',
    '._l-btn-main{border-color:transparent!important;background:linear-gradient(135deg,#ff6b6b,#ffd93d)!important;color:#fff!important;font-weight:600;justify-content:center;animation:_lGlow 2s ease-in-out infinite;box-shadow:0 4px 20px rgba(255,107,107,.35);}',
    '._l-btn-main:hover{transform:scale(1.03)!important;box-shadow:0 6px 28px rgba(255,107,107,.5);}',
    '._l-btn-main ._l-bwave{animation:_lWave .8s ease-in-out infinite;}',
    '._l-counter{text-align:center;font-size:.72rem;color:#888;margin-top:.9rem;padding-top:.9rem;border-top:.5px solid #eee;}',
    '._l-ribbon{position:fixed;top:28%;left:-110%;z-index:9996;width:110%;height:44px;background:linear-gradient(90deg,transparent,rgba(255,217,61,.4),rgba(199,125,255,.4),transparent);pointer-events:none;animation:_lSlideX 1.4s ease-out .2s both;}',
    '._l-combo{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10001;pointer-events:none;font-size:3rem;font-weight:800;color:#ff6b6b;text-shadow:0 2px 20px rgba(255,107,107,.6),-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff;white-space:nowrap;}',
    '._l-toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);z-index:10002;background:#222;color:#fff;border-radius:12px;padding:.7rem 1.4rem;font-size:.85rem;pointer-events:none;animation:_lToastIn .3s ease both;max-width:88vw;text-align:center;white-space:pre-line;}',
    '._l-horo{background:linear-gradient(135deg,#f9f0ff,#fff0f6);border:.5px solid #e0c0ff;border-radius:12px;padding:.9rem 1rem;margin-bottom:.75rem;font-size:.88rem;color:#6b21a8;line-height:1.5;}',
    '._l-fato{background:linear-gradient(135deg,#f0f9ff,#f0fff4);border:.5px solid #a0d8ef;border-radius:12px;padding:.9rem 1rem;margin-bottom:.75rem;font-size:.88rem;color:#0c4a6e;line-height:1.5;}',
    '._l-prog-wrap{background:#f0f0f0;border-radius:99px;height:8px;overflow:hidden;margin:.5rem 0;}',
    '._l-prog-bar{height:100%;background:linear-gradient(90deg,#ff6b6b,#ffd93d);border-radius:99px;}',
    '._l-orbit-wrap{position:relative;width:90px;height:90px;margin:0 auto .5rem;display:flex;align-items:center;justify-content:center;}',
    '._l-orbit-center{font-size:2.8rem;animation:_lHeartbeat 1.2s ease-in-out infinite;}',
    '._l-orbit-star{position:absolute;top:50%;left:50%;font-size:.9rem;animation:_lStarOrbit linear infinite;}',
    '._l-rainbow-mode ._l-banner{animation:_lShimmer 1s linear infinite,_lRainbow 2s linear infinite!important;}',
  ].join('');
  document.head.appendChild(s);
}

function _criarCardLaryssa() {
  var ribbon = document.createElement('div');
  ribbon.className = '_l-ribbon';
  document.body.appendChild(ribbon);
  setTimeout(function() { if (ribbon.parentNode) ribbon.parentNode.removeChild(ribbon); }, 3000);

  var card = document.createElement('div');
  card.className = '_l-card';
  card.id = '_laryssa-card';

  var bannerStars = '';
  var starPos = [
    {t:'12%',l:'7%',d:'0s'},{t:'18%',l:'88%',d:'.5s'},{t:'55%',l:'4%',d:'1s'},
    {t:'70%',l:'93%',d:'.3s'},{t:'38%',l:'50%',d:'.8s'},{t:'8%',l:'48%',d:'1.2s'}
  ];
  starPos.forEach(function(p) {
    bannerStars += '<div class="_l-star" style="top:'+p.t+';left:'+p.l+';animation-delay:'+p.d+';animation-duration:'+(1.3+Math.random()).toFixed(1)+'s">✦</div>';
  });

  var orbitStars = '';
  for (var os = 0; os < 5; os++) {
    orbitStars += '<div class="_l-orbit-star" style="animation-duration:'+(2.5+os*0.3)+'s;animation-delay:'+(os*0.2)+'s">✦</div>';
  }

  card.innerHTML =
    '<div class="_l-banner" id="_l-banner" onclick="_laryssaBannerClick()">' +
      bannerStars +
      '<span class="_l-emoji" id="_l-emoji">🎂</span>' +
      '<p class="_l-name">Laryssa! 🎉</p>' +
      '<p class="_l-sub">A pessoa mais amostrada da empresa</p>' +
    '</div>' +
    '<div class="_l-body">' +
      '<div class="_l-tabs">' +
        '<button class="_l-tab on" onclick="_laryssaTab(\'msg\',this)">💌 Mensagens</button>' +
        '<button class="_l-tab" onclick="_laryssaTab(\'festa\',this)">🎊 Festa</button>' +
        '<button class="_l-tab" onclick="_laryssaTab(\'voce\',this)">👑 Sobre você</button>' +
      '</div>' +

      '<div class="_l-panel on" id="_l-panel-msg">' +
        '<div class="_l-msgbox"><span id="_l-typed"></span><span class="_l-cursor"></span></div>' +
        '<div class="_l-actions">' +
          '<button class="_l-btn _l-btn-main" onclick="_laryssaNovaMsg()">' +
            '<span class="_l-bwave" style="font-size:1.1rem">👋</span>' +
            '<span style="flex:1">Outra mensagem de parabéns</span>' +
            '<span style="opacity:.7;font-size:.8rem">✨</span>' +
          '</button>' +
          '<button class="_l-btn" onclick="_laryssaCompartilhar()">' +
            '<span style="font-size:1.1rem;width:22px;text-align:center">📋</span>' +
            '<span style="flex:1">Copiar mensagem</span>' +
            '<span style="color:#aaa;font-size:.8rem">→</span>' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="_l-panel" id="_l-panel-festa">' +
        '<div class="_l-actions">' +
          '<button class="_l-btn" onclick="_lancarConfetesLaryssa(80)">' +
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
          '<button class="_l-btn" onclick="_laryssaParabensMusica()">' +
            '<span style="font-size:1.1rem;width:22px;text-align:center" id="_l-music-ico">🎵</span>' +
            '<span style="flex:1" id="_l-music-txt">Tocar Parabéns a Você</span>' +
            '<span style="color:#aaa;font-size:.8rem">→</span>' +
          '</button>' +
          '<button class="_l-btn" onclick="_laryssaModoRainbow()">' +
            '<span style="font-size:1.1rem;width:22px;text-align:center">🌈</span>' +
            '<span style="flex:1">Modo arco-íris</span>' +
            '<span style="color:#aaa;font-size:.8rem">→</span>' +
          '</button>' +
        '</div>' +
        '<div style="text-align:center;font-size:.72rem;color:#aaa;margin-top:.75rem">🎊 <span id="_l-confetes-count">0</span> confetes lançados</div>' +
      '</div>' +

      '<div class="_l-panel" id="_l-panel-voce">' +
        '<div class="_l-orbit-wrap"><div class="_l-orbit-center">🌟</div>' + orbitStars + '</div>' +
        '<div id="_l-horo-box" class="_l-horo">Carregando os astros...</div>' +
        '<div id="_l-fato-box" class="_l-fato">Calculando sua genialidade...</div>' +
        '<div style="font-size:.72rem;color:#bbb;text-align:center;margin-top:.25rem">100% científico e verdadeiro 🔬</div>' +
        '<div style="margin-top:.75rem">' +
          '<div style="font-size:.75rem;color:#aaa;margin-bottom:4px">Nível de amostradice</div>' +
          '<div class="_l-prog-wrap"><div class="_l-prog-bar" id="_l-prog" style="width:0;transition:width 1.5s ease .5s"></div></div>' +
          '<div style="font-size:.72rem;color:#ff6b6b;text-align:right;margin-top:2px;font-weight:600">OFF THE CHARTS 📈</div>' +
        '</div>' +
        '<button class="_l-btn" onclick="_laryssaNovoFato()" style="margin-top:.75rem">' +
          '<span style="font-size:1rem;width:22px;text-align:center">🔄</span>' +
          '<span style="flex:1">Novo fato científico</span>' +
        '</button>' +
      '</div>' +

      '<div class="_l-counter">🎁 <span id="_l-count">0</span> mensagens · <span id="_l-combo-streak"></span></div>' +
      '<div style="text-align:center;margin-top:.5rem">' +
        '<button class="_l-btn" onclick="_fecharCardLaryssa()" style="justify-content:center;color:#aaa;font-size:.82rem;border-color:transparent;background:transparent">💖 Obrigada! Fechar</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(card);

  // anima barra de progresso após render
  setTimeout(function() {
    var bar = document.getElementById('_l-prog');
    if (bar) bar.style.width = '100%';
  }, 100);

  _laryssaAtualizarVoce();

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

function _laryssaTab(nome, btn) {
  document.querySelectorAll('._l-tab').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  document.querySelectorAll('._l-panel').forEach(function(p) { p.classList.remove('on'); });
  var panel = document.getElementById('_l-panel-' + nome);
  if (panel) panel.classList.add('on');
  if (nome === 'voce') {
    _laryssaAtualizarVoce();
    setTimeout(function() {
      var bar = document.getElementById('_l-prog');
      if (bar) { bar.style.width = '0'; setTimeout(function() { bar.style.width = '100%'; }, 50); }
    }, 0);
  }
}

// ── Clique no bolo — combo ──
var _laryssaBannerClicks = 0;
function _laryssaBannerClick() {
  _laryssaBannerClicks++;
  var emoji = document.getElementById('_l-emoji');
  if (emoji) {
    emoji.classList.remove('clicked');
    void emoji.offsetWidth;
    emoji.classList.add('clicked');
    setTimeout(function() { emoji.classList.remove('clicked'); }, 400);
  }
  _laryssaCombo++;
  clearTimeout(_laryssaComboTimer);
  _laryssaComboTimer = setTimeout(function() { _laryssaCombo = 0; }, 1500);
  if (_laryssaCombo >= 3) _laryssaMostrarCombo(_laryssaCombo);
  _lancarConfetesLaryssa(8);
  if (_laryssaBannerClicks === 5)  _laryssaMostrarToast('🎂 Você tá com fome ou só animada? 😄');
  if (_laryssaBannerClicks === 10) _laryssaMostrarToast('👑 10 cliques no bolo. Você é oficialmente a maior fã de si mesma. Respeito.');
  if (_laryssaBannerClicks === 20) { _laryssaMostrarToast('🚀 20 cliques. Modo lendária ativado!'); _laryssaModoPandemia(); }
}

function _laryssaMostrarCombo(n) {
  var labels = {3:'COMBO x3! 🔥',5:'INCRÍVEL x5! 💥',7:'LENDÁRIA x7! 👑',10:'MITOLÓGICA! ✨'};
  var texto = labels[n] || (n >= 10 ? 'x' + n + ' 🚀' : null);
  if (!texto) return;
  var el = document.createElement('div');
  el.className = '_l-combo';
  el.textContent = texto;
  el.style.animation = '_lComboIn .3s ease both';
  document.body.appendChild(el);
  setTimeout(function() {
    el.style.animation = '_lComboOut .4s ease both';
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }, 1200);
}

function _laryssaMostrarToast(msg) {
  var old = document.querySelector('._l-toast');
  if (old && old.parentNode) old.parentNode.removeChild(old);
  var el = document.createElement('div');
  el.className = '_l-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function() {
    el.style.animation = '_lToastOut .3s ease both';
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
  }, 3200);
}

var _laryssaHoroIdx = 0;
var _laryssaFatoIdx = 0;
function _laryssaAtualizarVoce() {
  var hb = document.getElementById('_l-horo-box');
  var fb = document.getElementById('_l-fato-box');
  if (hb) hb.textContent = _laryssaHoroscopos[_laryssaHoroIdx % _laryssaHoroscopos.length];
  if (fb) fb.textContent = _laryssaFatos[_laryssaFatoIdx % _laryssaFatos.length];
}

function _laryssaNovoFato() {
  _laryssaFatoIdx++;
  _laryssaHoroIdx++;
  _laryssaAtualizarVoce();
  _lancarConfetesLaryssa(10);
}

function _laryssaCompartilhar() {
  var el = document.getElementById('_l-typed');
  var text = el ? el.textContent : '';
  if (!text) { _laryssaMostrarToast('Aguarda a mensagem carregar! ✨'); return; }
  try {
    navigator.clipboard.writeText(text).then(function() {
      _laryssaMostrarToast('✅ Copiado! Vai lá mandar no grupo da família 😄');
    });
  } catch(e) {
    _laryssaMostrarToast('Seleciona o texto e copia manualmente 🙏');
  }
}

function _laryssaNovaMsg() {
  var el = document.getElementById('_l-typed');
  var cnt = document.getElementById('_l-count');
  if (!el) return;
  var msg = _laryssaMsgs[_laryssaMsgIdx % _laryssaMsgs.length];
  _laryssaMsgIdx++;
  _laryssaMsgCount++;
  if (cnt) cnt.textContent = _laryssaMsgCount;
  var streak = document.getElementById('_l-combo-streak');
  if (streak) {
    var fogo = _laryssaMsgCount >= 5 ? '🔥'.repeat(Math.min(Math.floor(_laryssaMsgCount / 5), 5)) : '';
    streak.textContent = fogo ? _laryssaMsgCount + ' seguidas ' + fogo : '';
  }
  if (_laryssaTypeTimer) clearInterval(_laryssaTypeTimer);
  el.textContent = '';
  var i = 0;
  _laryssaTypeTimer = setInterval(function() {
    if (i < msg.length) { el.textContent += msg[i]; i++; }
    else {
      clearInterval(_laryssaTypeTimer);
      if (_laryssaMsgIdx % 4 === 0) _lancarConfetesLaryssa(20);
      if (_laryssaMsgIdx % 7 === 0) _laryssaMostrarToast('🎉 Você realmente merece todas essas mensagens!');
    }
  }, 26);
  _lancarConfetesLaryssa(15);
  if (_laryssaMsgCount === 5)  { _laryssaFase = 2; _laryssaMostrarToast('⭐ Nível 2 desbloqueado! Você é imparável.'); }
  if (_laryssaMsgCount === 10) { _laryssaFase = 3; _laryssaModoPandemia(); }
}

function _lancarConfetesLaryssa(n) {
  n = n || 50;
  _laryssaConfetesTotal += n;
  var cc = document.getElementById('_l-confetes-count');
  if (cc) cc.textContent = _laryssaConfetesTotal;
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
  for (var b = 0; b < 16; b++) {
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
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      var t = ctx.currentTime + tempos[i];
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.linearRampToValueAtTime(0, t + 0.13);
      osc.start(t); osc.stop(t + 0.15);
    });
  } catch(e) {}
  _lancarConfetesLaryssa(50);
  _lancarBaloesLaryssa();
}

function _laryssaParabensMusica() {
  var icoEl = document.getElementById('_l-music-ico');
  var txtEl = document.getElementById('_l-music-txt');
  if (_laryssaMusicPlaying) {
    _laryssaMusicNodes.forEach(function(n) { try { n.stop(); } catch(e){} });
    _laryssaMusicNodes = [];
    _laryssaMusicPlaying = false;
    if (icoEl) icoEl.textContent = '🎵';
    if (txtEl) txtEl.textContent = 'Tocar Parabéns a Você';
    return;
  }
  try {
    if (!_laryssaAudioCtx) _laryssaAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var ctx = _laryssaAudioCtx;
    var parens = [
      [392,0.75],[392,0.25],[440,1],[392,1],[523,1],[494,2],
      [392,0.75],[392,0.25],[440,1],[392,1],[587,1],[523,2],
      [392,0.75],[392,0.25],[784,1],[659,1],[523,1],[494,1],[440,2],
      [698,0.75],[698,0.25],[659,1],[523,1],[587,1],[523,2]
    ];
    var bpm = 110, beat = 60 / bpm;
    var t = ctx.currentTime + 0.1;
    var totalDur = 0;
    parens.forEach(function(nota) { totalDur += nota[1] * beat; });
    _laryssaMusicPlaying = true;
    if (icoEl) icoEl.textContent = '⏹';
    if (txtEl) txtEl.textContent = 'Parar música';
    parens.forEach(function(nota) {
      var freq = nota[0], dur = nota[1] * beat;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.04);
      gain.gain.setValueAtTime(0.15, t + dur - 0.06);
      gain.gain.linearRampToValueAtTime(0, t + dur);
      osc.start(t); osc.stop(t + dur);
      _laryssaMusicNodes.push(osc);
      t += dur;
    });
    setTimeout(function() {
      _laryssaMusicPlaying = false;
      _laryssaMusicNodes = [];
      if (icoEl) icoEl.textContent = '🎵';
      if (txtEl) txtEl.textContent = 'Tocar Parabéns a Você';
    }, (totalDur + 0.5) * 1000);
    _lancarConfetesLaryssa(30);
    _lancarBaloesLaryssa();
  } catch(e) {
    _laryssaMostrarToast('Não foi possível tocar o áudio 😅');
  }
}

var _laryssaRainbowOn = false;
function _laryssaModoRainbow() {
  var card = document.getElementById('_laryssa-card');
  if (!card) return;
  _laryssaRainbowOn = !_laryssaRainbowOn;
  card.classList.toggle('_l-rainbow-mode', _laryssaRainbowOn);
  _laryssaMostrarToast(_laryssaRainbowOn ? '🌈 Modo arco-íris ativado!' : '🌈 Modo arco-íris desativado. Por enquanto.');
  _lancarConfetesLaryssa(30);
}

function _laryssaModoPandemia() {
  _lancarConfetesLaryssa(150);
  _lancarBaloesLaryssa();
  _fanfarraLaryssa();
  var card = document.getElementById('_laryssa-card');
  if (card) {
    var orig = card.style.animation;
    card.style.animation = '_lShake .4s ease both';
    setTimeout(function() { card.style.animation = orig; }, 500);
  }
  _laryssaMostrarToast('🚀 MODO LENDÁRIA ATIVADO!\nA festa não tem mais fim.');
  setTimeout(function() { _lancarConfetesLaryssa(100); _lancarBaloesLaryssa(); }, 1600);
  setTimeout(function() { _lancarConfetesLaryssa(80); }, 3200);
}

function _fecharCardLaryssa() {
  var card = document.getElementById('_laryssa-card');
  if (card && card.parentNode) card.parentNode.removeChild(card);
  var inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  esconderSugestoes();
  if (_laryssaTypeTimer) clearInterval(_laryssaTypeTimer);
  _laryssaMusicNodes.forEach(function(n) { try { n.stop(); } catch(e){} });
  _laryssaMusicNodes = [];
  _laryssaMusicPlaying = false;
  if (_laryssaTituloTimer) {
    clearInterval(_laryssaTituloTimer);
    if (_laryssaTituloOriginal !== null) document.title = _laryssaTituloOriginal;
  }
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
