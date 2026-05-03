// ─────────────────────────────────────────────────────────────
// CHECKOUT.JS — Modal de confirmação e envio pelo WhatsApp
// ─────────────────────────────────────────────────────────────

function enviarWpp() {
  var itens = Object.values(carrinho);
  if (!itens.length) { alert('Seu carrinho está vazio!'); return; }
  fecharCart();
  abrirModal();
}

function abrirModal() {
  var itens      = Object.values(carrinho);
  var modalItems = document.getElementById('modalItems');
  var modalTotal = document.getElementById('modalTotal');

  modalItems.innerHTML = '';

  itens.forEach(function(item) {
    var p      = item.prod;
    var preco  = parseFloat(p.preco) || 0;
    var sub    = preco * item.qtd;
    var precoStr = preco > 0
      ? 'R$ ' + sub.toFixed(2).replace('.', ',')
      : 'Sob consulta';
    var div = document.createElement('div');
    div.className = 'modal-item';
    div.innerHTML =
      '<span class="modal-item-name">'  + p.nome  + '</span>' +
      '<span class="modal-item-qty">× ' + item.qtd + '</span>' +
      '<span class="modal-item-price">' + precoStr + '</span>';
    modalItems.appendChild(div);
  });

  var total = itens.reduce(function(s, i) {
    return s + (parseFloat(i.prod.preco) || 0) * i.qtd;
  }, 0);
  modalTotal.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');

  // Reset form
  pagtoSelecionado = '';
  document.querySelectorAll('.pagto-chip').forEach(function(c) { c.classList.remove('on'); });
  document.getElementById('inputNome').value = '';
  document.getElementById('inputObs').value  = '';
  document.getElementById('fieldNome').classList.remove('has-error');
  document.getElementById('pagtoError').classList.remove('show');

  document.getElementById('checkoutModal').classList.add('on');
  document.body.style.overflow = 'hidden';
  setTimeout(function() { document.getElementById('inputNome').focus(); }, 300);
}

function fecharModal() {
  document.getElementById('checkoutModal').classList.remove('on');
  document.body.style.overflow = '';
}

function selecionarPagto(el, valor) {
  pagtoSelecionado = valor;
  document.querySelectorAll('.pagto-chip').forEach(function(c) { c.classList.remove('on'); });
  el.classList.add('on');
  document.getElementById('pagtoError').classList.remove('show');
}

function confirmarEEnviar() {
  var nome = document.getElementById('inputNome').value.trim();
  var obs  = document.getElementById('inputObs').value.trim();
  var valido = true;

  if (!nome) {
    document.getElementById('fieldNome').classList.add('has-error');
    document.getElementById('inputNome').classList.add('error');
    valido = false;
  } else {
    document.getElementById('fieldNome').classList.remove('has-error');
    document.getElementById('inputNome').classList.remove('error');
  }

  if (!pagtoSelecionado) {
    document.getElementById('pagtoError').classList.add('show');
    valido = false;
  } else {
    document.getElementById('pagtoError').classList.remove('show');
  }

  if (!valido) {
    var box = document.querySelector('.modal-box');
    box.style.animation = 'none';
    setTimeout(function() { box.style.animation = 'shake .4s ease'; }, 10);
    return;
  }

  var itens = Object.values(carrinho);
  var msg   = ' *Pedido - Cia Das Embalagens*\n\n';
  msg += ' *Cliente:* ' + nome + '\n *Pagamento:* ' + pagtoSelecionado + '\n\n*Itens do pedido:*\n';

  itens.forEach(function(i) {
    var preco = parseFloat(i.prod.preco) || 0;
    var sub   = preco * i.qtd;
    msg += '• ' + i.prod.nome + ' — Qtd: ' + i.qtd;
    if (preco > 0) msg += ' (R$ ' + sub.toFixed(2).replace('.', ',') + ')';
    msg += '\n';
  });

  var total = itens.reduce(function(s, i) {
    return s + (parseFloat(i.prod.preco) || 0) * i.qtd;
  }, 0);
  msg += '\n *Total estimado: R$ ' + total.toFixed(2).replace('.', ',') + '*';
  if (obs) msg += '\n\n *Observação:* ' + obs;
  msg += '\n\n_Aguardo confirmação, obrigado!';

  fecharModal();
  window.open('https://wa.me/5511972999835?text=' + encodeURIComponent(msg), '_blank');
}

// Animação de shake para validação
(function() {
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes shake{' +
      '0%,100%{transform:translateY(0) scale(1)}' +
      '20%{transform:translateX(-6px) scale(1)}' +
      '40%{transform:translateX(6px) scale(1)}' +
      '60%{transform:translateX(-4px) scale(1)}' +
      '80%{transform:translateX(4px) scale(1)}' +
    '}';
  document.head.appendChild(styleEl);
})();

// Fechar modal ao clicar no overlay
document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('checkoutModal');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) fecharModal();
    });
  }
});
