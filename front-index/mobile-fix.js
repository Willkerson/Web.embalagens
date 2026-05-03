// ─────────────────────────────────────────────────────────────
// MOBILE-FIX.JS — Correções de UX para Android e iPhone
// Adicione APÓS todos os outros scripts (depois do app.js).
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── 1. BUSCA: fecha sugestões ao tocar fora ──
  // O busca.js já fecha no blur, mas no mobile o tap em outro lugar
  // não dispara blur primeiro — adicionamos touchstart no document.
  document.addEventListener('touchstart', function (e) {
    var wrap = document.getElementById('searchWrap');
    if (wrap && !wrap.contains(e.target)) {
      var box = document.getElementById('searchSuggestions');
      if (box) { box.classList.remove('on'); box.innerHTML = ''; }
    }
  }, { passive: true });

  // ── 2. BUSCA: rola a página para o campo ficar visível ao abrir teclado ──
  var searchInp = document.getElementById('searchInput');
  if (searchInp) {
    searchInp.addEventListener('focus', function () {
      var self = this;
      // Aguarda o teclado virtual subir (~300ms)
      setTimeout(function () {
        self.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 320);
    }, { passive: true });
  }

  // ── 3. CART PANEL: fecha com swipe para baixo ──
  var cartPanel = document.querySelector('.cart-panel');
  if (cartPanel) {
    var cpStartY = 0, cpListTop = 0;

    cartPanel.addEventListener('touchstart', function (e) {
      cpStartY = e.touches[0].clientY;
      var list = cartPanel.querySelector('.cart-list');
      cpListTop = list ? list.scrollTop : 0;
    }, { passive: true });

    cartPanel.addEventListener('touchmove', function (e) {
      var dy = e.touches[0].clientY - cpStartY;
      // Fecha só se estiver no topo da lista e arrastando ≥ 70px para baixo
      if (dy > 70 && cpListTop <= 0) {
        cartPanel.classList.remove('on');
        var bd = document.querySelector('.backdrop');
        if (bd) bd.classList.remove('on');
      }
    }, { passive: true });
  }

})();
