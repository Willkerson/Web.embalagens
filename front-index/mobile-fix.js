// ─────────────────────────────────────────────────────────────
// MOBILE-FIX.JS — Correções de UX para Android e iPhone
// Adicione este script APÓS todos os outros scripts.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // ── 1. BUSCA: reposiciona sugestões quando teclado virtual sobe ──
  // No iOS e Android, o teclado empurra o viewport.
  // Recalculamos a posição das sugestões com base no campo visível.
  function reposicionarSugestoes() {
    var box = document.getElementById('searchSuggestions');
    var inp = document.getElementById('searchInput');
    if (!box || !inp) return;

    if (!box.classList.contains('on')) return;

    var rect = inp.getBoundingClientRect();
    var top  = rect.bottom + 6;

    // Garante que não sai da tela
    var maxH = window.innerHeight - top - 16;
    box.style.top      = top + 'px';
    box.style.maxHeight = Math.min(Math.max(maxH, 120), window.innerHeight * 0.45) + 'px';
  }

  if (isMobile) {
    window.addEventListener('resize', reposicionarSugestoes, { passive: true });
    window.addEventListener('scroll', reposicionarSugestoes, { passive: true });
  }

  // ── 2. BUSCA: fecha sugestões ao rolar a página no mobile ──
  // No desktop o scroll é normal; no mobile o usuário role para ver mais produtos.
  if (isMobile) {
    var _scrollTimer;
    window.addEventListener('scroll', function () {
      clearTimeout(_scrollTimer);
      _scrollTimer = setTimeout(function () {
        var box = document.getElementById('searchSuggestions');
        if (box && box.classList.contains('on')) {
          box.classList.remove('on');
          box.innerHTML = '';
        }
      }, 80);
    }, { passive: true });
  }

  // ── 3. BUSCA: ao focar o input, rola a página para ele ficar visível ──
  // O teclado virtual empurra o layout — garantimos que o campo fique em cima.
  var searchInp = document.getElementById('searchInput');
  if (searchInp && isMobile) {
    searchInp.addEventListener('focus', function () {
      var self = this;
      // Aguarda o teclado subir (~300ms) e então rola
      setTimeout(function () {
        self.scrollIntoView({ behavior: 'smooth', block: 'start' });
        reposicionarSugestoes();
      }, 350);
    });

    // Ao fechar o teclado (blur), esconde sugestões com delay
    searchInp.addEventListener('blur', function () {
      setTimeout(function () {
        var box = document.getElementById('searchSuggestions');
        if (box) { box.classList.remove('on'); box.innerHTML = ''; }
      }, 200);
    });
  }

  // ── 4. FILTROS: drag/swipe horizontal nas abas de categoria ──
  // Permite arrastar a barra de filtros com o dedo sem acionar clique.
  function ativarSwipeHorizontal(seletor) {
    var el = document.querySelector(seletor);
    if (!el) return;

    var startX, startScrollLeft, isDragging = false;

    el.addEventListener('touchstart', function (e) {
      startX = e.touches[0].pageX;
      startScrollLeft = el.scrollLeft;
      isDragging = false;
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      var dx = startX - e.touches[0].pageX;
      if (Math.abs(dx) > 5) isDragging = true;
      el.scrollLeft = startScrollLeft + dx;
    }, { passive: true });
  }

  ativarSwipeHorizontal('.filter-tabs');
  ativarSwipeHorizontal('.subtabs.on');
  ativarSwipeHorizontal('.brand-filter-inner');

  // Reaplica swipe ao mudar de subcategoria (subtabs muda de .on)
  var observer = new MutationObserver(function () {
    ativarSwipeHorizontal('.subtabs.on');
  });
  var subtabsWrap = document.querySelector('.subtabs-wrap');
  if (subtabsWrap) {
    observer.observe(subtabsWrap, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }

  // ── 5. CART PANEL: fecha com swipe para baixo no mobile ──
  var cartPanel = document.querySelector('.cart-panel');
  if (cartPanel && isMobile) {
    var cpStartY, cpStartScroll;

    cartPanel.addEventListener('touchstart', function (e) {
      cpStartY = e.touches[0].clientY;
      cpStartScroll = cartPanel.querySelector('.cart-list') ? cartPanel.querySelector('.cart-list').scrollTop : 0;
    }, { passive: true });

    cartPanel.addEventListener('touchmove', function (e) {
      var dy = e.touches[0].clientY - cpStartY;
      // Só fecha se estiver no topo da lista E arrastando para baixo
      if (dy > 60 && cpStartScroll <= 0) {
        cartPanel.classList.remove('on');
        document.querySelector('.backdrop') && document.querySelector('.backdrop').classList.remove('on');
      }
    }, { passive: true });
  }

  // ── 6. PREVINE DUPLO-TAP ZOOM nos botões de quantidade ──
  // iOS dá zoom com duplo toque — desabilitamos para os controles do carrinho.
  document.addEventListener('touchend', function (e) {
    var el = e.target;
    if (el.classList.contains('bq') || el.classList.contains('badd')) {
      e.preventDefault();
      el.click();
    }
  });

  // ── 7. MODAL DE CHECKOUT: fecha com swipe para baixo ──
  var modalBox = document.querySelector('.modal-box');
  if (modalBox && isMobile) {
    var mbStartY;
    modalBox.addEventListener('touchstart', function (e) {
      mbStartY = e.touches[0].clientY;
    }, { passive: true });
    modalBox.addEventListener('touchmove', function (e) {
      var dy = e.touches[0].clientY - mbStartY;
      if (dy > 80 && modalBox.scrollTop <= 0) {
        var overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.classList.remove('on');
      }
    }, { passive: true });
  }

  // ── 8. VIEWPORT HEIGHT REAL no iOS ──
  // Corrige o problema do vh que inclui a barra de endereço no iOS.
  function setRealVH() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--real-vh', vh + 'px');
  }
  setRealVH();
  window.addEventListener('resize', setRealVH, { passive: true });

})();
