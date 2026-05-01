// ─────────────────────────────────────────────────────────────
// CARRINHO.JS — Gestão completa do carrinho de compras
// ─────────────────────────────────────────────────────────────

function mudaQtd(id, d) {
  var i = document.getElementById('qtd-' + id);
  if (i) {
    i.value = Math.max(1, (parseInt(i.value) || 1) + d);
    if (carrinho[id]) {
      carrinho[id].qtd = parseInt(i.value);
      salvarCarrinho();
    }
  }
}

function addCart(id) {
  var prod = prods().find(function(p) { return p.id === id; });
  if (!prod) return;
  if (isEsgotado(prod)) { alert('Este produto está temporariamente esgotado.'); return; }

  var qtd = parseInt(document.getElementById('qtd-' + id).value) || 1;
  carrinho[id] = { prod: prod, qtd: qtd };
  salvarCarrinho();

  var card = document.getElementById('card-' + id);
  var btn  = document.getElementById('badd-' + id);
  if (card) card.classList.add('incart');
  if (btn)  { btn.textContent = '✓ Adicionado'; btn.classList.add('done'); }

  updateBadge();
}

function addSugestao(id) {
  var prod = prods().find(function(p) { return p.id === id; });
  if (!prod || isEsgotado(prod)) return;
  carrinho[id] = { prod: prod, qtd: (carrinho[id] ? carrinho[id].qtd : 0) + 1 };
  salvarCarrinho();
  updateBadge();
  renderCartList();
}

function removerItem(id) {
  delete carrinho[id];
  salvarCarrinho();

  var card = document.getElementById('card-' + id);
  var btn  = document.getElementById('badd-' + id);
  if (card) card.classList.remove('incart');
  if (btn)  { btn.textContent = '+ Adicionar'; btn.classList.remove('done'); }

  updateBadge();
  renderCartList();
}

function limparCart() {
  if (!Object.keys(carrinho).length) return;
  if (!confirm('Limpar o carrinho?')) return;

  Object.keys(carrinho).forEach(function(id) {
    var card = document.getElementById('card-' + id);
    var btn  = document.getElementById('badd-' + id);
    if (card) card.classList.remove('incart');
    if (btn)  { btn.textContent = '+ Adicionar'; btn.classList.remove('done'); }
  });

  carrinho = {};
  salvarCarrinho();
  updateBadge();
  renderCartList();
}

function updateBadge() {
  var n = Object.keys(carrinho).length;
  var b = document.getElementById('cbadge');
  b.textContent = n;
  b.classList.toggle('on', n > 0);
}

function getRelacionados(prod) {
  var lista = prods().filter(function(p) { return p.id !== prod.id && !isEsgotado(p); });
  var rel   = lista.filter(function(p) { return p.subcategoria === prod.subcategoria; });
  if (rel.length < 4) {
    var comp = lista.filter(function(p) {
      return p.categoria === prod.categoria && p.subcategoria !== prod.subcategoria;
    });
    rel = rel.concat(comp);
  }
  return rel.slice(0, 4);
}

function renderCartList() {
  var list    = document.getElementById('clist');
  var totalEl = document.getElementById('ctotal');
  var itens   = Object.values(carrinho);

  if (!itens.length) {
    list.innerHTML = '<div class="cart-empty"><div class="cart-empty-ico">🛒</div><p>Carrinho vazio</p></div>';
    totalEl.textContent = 'R$ 0,00';
    return;
  }

  list.innerHTML = '';

  itens.forEach(function(item) {
    var p     = item.prod;
    var preco = parseFloat(p.preco) || 0;
    var sub   = preco * item.qtd;
    var ps    = preco > 0
      ? 'R$ ' + preco.toFixed(2).replace('.', ',') + (p.unidade ? ' ' + p.unidade : '')
      : 'Sob consulta';
    var ss = preco > 0 ? 'R$ ' + sub.toFixed(2).replace('.', ',') : '—';

    var div = document.createElement('div');
    div.className = 'cart-item';

    var icoHtml = p.imagem
      ? '<div class="ci-ico"><img src="' + p.imagem + '" alt="" onerror="this.style.display=\'none\'"></div>'
      : '<div class="ci-ico">📦</div>';

    div.innerHTML =
      icoHtml +
      '<div class="ci-info">' +
        '<div class="ci-name">' + p.nome + '</div>' +
        '<div class="ci-meta">' + ps + ' × ' + item.qtd + '</div>' +
      '</div>' +
      '<div class="ci-right">' +
        '<span class="ci-total">' + ss + '</span>' +
        '<span class="ci-remove" onclick="removerItem(' + p.id + ')">🗑 remover</span>' +
      '</div>';

    list.appendChild(div);
  });

  var total = itens.reduce(function(s, i) {
    return s + (parseFloat(i.prod.preco) || 0) * i.qtd;
  }, 0);
  totalEl.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');

  // Sugestões de produtos relacionados (apenas não-esgotados)
  var sugestoes = [];
  Object.values(carrinho).forEach(function(item) {
    sugestoes = sugestoes.concat(getRelacionados(item.prod));
  });
  sugestoes = sugestoes.filter(function(v, i, a) {
    return a.findIndex(function(t) { return t.id === v.id; }) === i;
  });
  sugestoes = sugestoes.filter(function(p) {
    return !carrinho[p.id] && !isEsgotado(p);
  });

  if (sugestoes.length) {
    var box   = document.createElement('div');
    box.style.marginTop = '18px';

    var title = document.createElement('div');
    title.textContent = '💡 Combine com:';
    title.style.cssText = 'font-size:.875rem;font-weight:600;margin-bottom:10px;';
    box.appendChild(title);

    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:8px;overflow-x:auto;';

    sugestoes.forEach(function(p) {
      var preco    = parseFloat(p.preco);
      var precoStr = preco > 0 ? 'R$ ' + preco.toFixed(2).replace('.', ',') : '';

      var card = document.createElement('div');
      card.style.cssText =
        'min-width:95px;background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.08);' +
        'border-radius:8px;padding:6px;text-align:center;';
      card.innerHTML =
        '<div style="font-size:.7rem;height:30px;overflow:hidden;color:var(--text2)">' + p.nome + '</div>' +
        '<div style="font-size:.75rem;font-weight:600">' + precoStr + '</div>' +
        '<button onclick="addSugestao(' + p.id + ')" ' +
          'style="margin-top:4px;background:var(--blue);color:#fff;border:none;border-radius:6px;' +
          'padding:4px 8px;font-size:.7rem;cursor:pointer;">+</button>';
      wrap.appendChild(card);
    });

    box.appendChild(wrap);
    list.appendChild(box);
  }
}

function abrirCart() {
  renderCartList();
  document.getElementById('cartPanel').classList.add('on');
  document.getElementById('backdrop').classList.add('on');
  document.body.style.overflow = 'hidden';
}

function fecharCart() {
  document.getElementById('cartPanel').classList.remove('on');
  document.getElementById('backdrop').classList.remove('on');
  document.body.style.overflow = '';
}
