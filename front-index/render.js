// ─────────────────────────────────────────────────────────────
// RENDER.JS — Renderização do grid de produtos (versão DEBUG)
// ─────────────────────────────────────────────────────────────

var gruposRender     = [];
var maxPorRender     = 30;
var loadObserver     = null;
var _debouncedRender = debounce(renderizar, 200);

function estoqueNum(valor) {
  if (!valor) return 0;
  return parseFloat(
    String(valor).replace('un', '').replace(',', '.').trim()
  ) || 0;
}

function getListaFiltrada() {
  // ── DEBUG ────────────────────────────────────────────────────
  console.group('[getListaFiltrada]');
  console.log('produtoSelecionado:', estado.produtoSelecionado);
  console.log('busca:', estado.busca);
  console.log('precoFiltro:', estado.precoFiltro);
  console.log('cat:', estado.cat);
  console.log('sub:', estado.sub);
  console.trace('chamado de:');
  console.groupEnd();
  // ────────────────────────────────────────────────────────────

  // ── Produto único selecionado pela sugestão ──────────────────
  if (estado.produtoSelecionado) {
    return prods().filter(function(p) {
      return !p.oculto &&
             estoqueNum(p.estoque) > 0 &&
             String(p.id) === String(estado.produtoSelecionado);
    });
  }

  // ── Base: visíveis com estoque positivo ─────────────────────
  var lista = prods().filter(function(p) {
    return !p.oculto && estoqueNum(p.estoque) > 0;
  });

  // ── Filtro por preço exato ───────────────────────────────────
  if (estado.precoFiltro !== null && estado.precoFiltro !== undefined) {
    return lista.filter(function(p) {
      var v = parseFloat(p.preco);
      return !isNaN(v) && Math.abs(v - estado.precoFiltro) <= 0.05;
    });
  }

  // ── Busca por texto (fuzzy) ──────────────────────────────────
  if (estado.busca) {
    var results = buscaFuzzy(estado.busca);
    return results
      .filter(function(r) {
        return r.score >= 30 && estoqueNum(r.prod.estoque) > 0;
      })
      .map(function(r) { return r.prod; });
  }

  // ── Filtro por categoria / subcategoria ──────────────────────
  if (estado.cat !== 'todos') {
    lista = lista.filter(function(p) {
      if (p.categoria !== estado.cat) return false;
      if (estado.sub === 'todas') return true;
      return p.subcategoria === estado.sub;
    });
  }

  // ── Filtro por marca ─────────────────────────────────────────
  if (estado.marca && estado.marca !== 'todas') {
    lista = lista.filter(function(p) {
      return (p.marca || '').trim() === estado.marca;
    });
  }

  return lista;
}

function buildCardImg(p) {
  var badge    = '<span class="incart-badge">✓ No carrinho</span>';
  var esgBadge = '<span class="pcard-esg-badge">⚠ Esgotado</span>';

  if (p.imagem && p.imgmode === 'thumbnail') {
    var d = document.createElement('div');
    d.className = 'pimg-thumb';
    d.innerHTML = badge + esgBadge;
    var img = document.createElement('img');
    img.alt = p.nome; img.src = p.imagem;
    img.onerror = function() { this.style.display = 'none'; };
    d.appendChild(img);
    return d;

  } else if (p.imagem && p.imgmode === 'replace') {
    var d = document.createElement('div');
    d.className = 'pimg-replace';
    d.innerHTML = badge + esgBadge;
    var img = document.createElement('img');
    img.alt = p.nome; img.src = p.imagem;
    img.onerror = function() { this.style.display = 'none'; };
    d.appendChild(img);
    return d;

  } else {
    var d = document.createElement('div');
    d.className = 'pimg';
    d.innerHTML = badge + esgBadge + '<span class="pimg-emoji">📦</span>';
    return d;
  }
}

// ─────────────────────────────────────────────────────────────
// selecionarSugestao — definida AQUI e em nenhum outro lugar
// ─────────────────────────────────────────────────────────────
function selecionarSugestao(id) {
  var prod = prods().find(function(p) {
    return String(p.id) === String(id);
  });
  if (!prod) return;

  esconderSugestoes();

  estado.produtoSelecionado = prod.id;
  estado.busca              = '';
  estado.precoFiltro        = null;
  estado.cat                = 'todos';
  estado.sub                = 'todas';
  estado.marca              = 'todas';

  document.getElementById('searchInput').value = prod.nome;

  document.querySelectorAll('.ftab').forEach(function(b) { b.classList.remove('on'); });
  var all = document.querySelector('.ftab[data-cat="todos"]');
  if (all) all.classList.add('on');
  document.querySelectorAll('.subtabs').forEach(function(b) { b.classList.remove('on'); });
  document.getElementById('brandFilterWrap').classList.remove('on');

  renderizar();

  setTimeout(function() {
    var card = document.getElementById('card-' + prod.id);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.outline = '3px solid #2563eb';
      setTimeout(function() { card.style.outline = ''; }, 2000);
    }
  }, 150);
}

function renderizar() {
  var c = document.getElementById('containerProdutos');
  if (!c) return;
  if (loadObserver) { loadObserver.disconnect(); loadObserver = null; }

  var lista = getListaFiltrada();

  var listaBase = prods().filter(function(p) {
    return !p.oculto && estoqueNum(p.estoque) > 0;
  });

  if (!estado.busca && estado.precoFiltro === null && !estado.produtoSelecionado && estado.cat !== 'todos') {
    listaBase = listaBase.filter(function(p) {
      if (p.categoria !== estado.cat) return false;
      if (estado.sub === 'todas') return true;
      return p.subcategoria === estado.sub;
    });
  }

  renderBrandFilter(listaBase);
  c.innerHTML = '';

  if (!lista.length) {
    c.innerHTML =
      '<div class="no-results"><span>🔍</span>Nenhum produto encontrado para "<strong>' +
      (estado.precoFiltro !== null && estado.precoFiltro !== undefined
        ? 'R$ ' + estado.precoFiltro.toFixed(2).replace('.', ',')
        : estado.busca) +
      '</strong>".<br>Tente outro termo ou limpe os filtros.</div>';
    return;
  }

  var grupos = {};
  lista.forEach(function(p) {
    var k = p.subcategoria || p.categoria;
    if (!grupos[k]) grupos[k] = { id: k, label: subLabels[k] || k.replace(/-/g, ' '), itens: [] };
    grupos[k].itens.push(p);
  });

  gruposRender = Object.keys(grupos).map(function(k) {
    return { id: grupos[k].id, label: grupos[k].label, itens: grupos[k].itens, count: 0 };
  });

  renderMais();
}

function renderMais() {
  var c        = document.getElementById('containerProdutos');
  var addCount = 0;

  for (var i = 0; i < gruposRender.length; i++) {
    var g = gruposRender[i];
    if (g.count >= g.itens.length) continue;

    var safeId = g.id.replace(/[^a-zA-Z0-9]/g, '_');
    var secId  = 'sec-' + safeId;
    var sec    = document.getElementById(secId);
    var grid;

    if (!sec) {
      sec = document.createElement('div');
      sec.className = 'psec';
      sec.id        = secId;
      sec.setAttribute('data-sub', g.id);

      var emoji      = catEmojis[g.id] || '📦';
      var marcaBadge = (estado.marca && estado.marca !== 'todas')
        ? '<span class="psec-brand">' + estado.marca + '</span>'
        : '';

      sec.innerHTML =
        '<div class="psec-hdr">' +
          '<div class="psec-icon">' + emoji + '</div>' +
          '<div class="psec-title">' + g.label + marcaBadge + '</div>' +
          '<div class="psec-count">' + g.itens.length + ' item' + (g.itens.length !== 1 ? 's' : '') + '</div>' +
        '</div>';

      grid = document.createElement('div');
      grid.className = 'pgrid';
      grid.id        = 'grid-' + safeId;
      sec.appendChild(grid);
      c.appendChild(sec);
    } else {
      grid = document.getElementById('grid-' + safeId);
    }

    while (g.count < g.itens.length && addCount < maxPorRender) {
      var p      = g.itens[g.count];
      var esg    = isEsgotado(p);
      var inCart = !!carrinho[p.id];

      var preco = Number(p.preco);
      if (isNaN(preco)) preco = 0;

      var precoStr = preco > 0
        ? 'R$ ' + preco.toFixed(2).replace('.', ',')
        : 'Sob consulta';

      var marcaTag = p.marca
        ? '<span class="pmarca-tag">' + p.marca + '</span>'
        : '';

      var card = document.createElement('div');
      card.className = 'pcard' + (inCart ? ' incart' : '') + (esg ? ' esgotado' : '');
      card.id = 'card-' + p.id;
      card.appendChild(buildCardImg(p));

      var body = document.createElement('div');
      body.className = 'pbody';

      var actHtml;
      if (esg) {
        actHtml =
          '<div class="pactions">' +
            '<div class="qty-ctrl" style="pointer-events:none;opacity:.4">' +
              '<button class="bq">−</button>' +
              '<input class="iq" type="number" value="1" min="1">' +
              '<button class="bq">+</button>' +
            '</div>' +
            '<button class="badd-esg">⚠ Esgotado</button>' +
          '</div>';
      } else {
        actHtml =
          '<div class="pactions">' +
            '<div class="qty-ctrl">' +
              '<button class="bq" onclick="mudaQtd(\'' + p.id + '\',-1)">−</button>' +
              '<input class="iq" type="number" id="qtd-' + p.id + '" value="1" min="1">' +
              '<button class="bq" onclick="mudaQtd(\'' + p.id + '\',1)">+</button>' +
            '</div>' +
            '<button class="badd' + (inCart ? ' done' : '') + '" id="badd-' + p.id + '" onclick="toggleCart(\'' + p.id + '\')">' +
              (inCart ? '✓ Adicionado' : '+ Adicionar') +
            '</button>' +
          '</div>';
      }

      body.innerHTML =
        '<div class="pname">' + p.nome + '</div>' +
        marcaTag +
        '<div class="pprice-box">' +
          '<span class="pprice">' + precoStr + '</span>' +
          (p.unidade ? '<span class="punit">' + p.unidade + '</span>' : '') +
        '</div>' +
        '<div class="pspacer"></div>' +
        actHtml;

      card.appendChild(body);
      grid.appendChild(card);

      (function(el, delay) {
        setTimeout(function() { el.classList.add('in'); }, delay * 10);
      })(card, addCount);

      g.count++;
      addCount++;
    }

    if (addCount >= maxPorRender) break;
  }

  var pendentes = gruposRender.some(function(g) { return g.count < g.itens.length; });
  var anchor    = document.getElementById('scroll-anchor');

  if (pendentes) {
    if (!anchor) {
      anchor = document.createElement('div');
      anchor.id          = 'scroll-anchor';
      anchor.style.height    = '1px';
      anchor.style.marginTop = '2rem';
    }
    c.appendChild(anchor);
    loadObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) renderMais();
    }, { rootMargin: '400px' });
    loadObserver.observe(anchor);
  } else {
    if (anchor) anchor.remove();
  }
}
