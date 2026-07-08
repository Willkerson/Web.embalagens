// ─────────────────────────────────────────────────────────────
// MOBILE-FIX.JS — Correções de UX para Android e iPhone
// Adicione este script APÓS todos os outros scripts.
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // ── 1. BUSCA: sugestões ficam por conta do CSS (position:absolute,
  // relativo a #searchWrap) — ver front-index/estilo.css e mobile.css.
  // Havia aqui uma função "reposicionarSugestoes" que recalculava
  // box.style.top com inp.getBoundingClientRect().bottom (coordenadas
  // relativas à JANELA) e aplicava esse valor num elemento posicionado de
  // forma ABSOLUTA (coordenadas relativas ao próprio #searchWrap, não à
  // janela). Misturar esses dois sistemas de coordenadas jogava a caixa
  // de sugestões pra um ponto bem mais abaixo na página — exatamente o
  // bug de "sugestão cobrindo o catálogo" ao rolar a tela. Removida.
  function reposicionarSugestoes() {
    // no-op — mantido só pra não quebrar as chamadas abaixo.
  }

  if (isMobile) {
    window.addEventListener('resize', reposicionarSugestoes, { passive: true });
    window.addEventListener('scroll', reposicionarSugestoes, { passive: true });
  }

  // ── 2. BUSCA: fecha sugestões ao rolar a PÁGINA (não as sugestões em si) ──
  // Só fecha se o scroll for no body/window, não dentro do box de sugestões.
  if (isMobile) {
    var _scrollTimer;
    window.addEventListener('scroll', function () {
      clearTimeout(_scrollTimer);
      _scrollTimer = setTimeout(function () {
        var box = document.getElementById('searchSuggestions');
        // Só fecha se as sugestões estiverem abertas E o foco não estiver nelas
        if (box && box.classList.contains('on') && !_tocandoSugestao) {
          box.classList.remove('on');
          box.innerHTML = '';
        }
      }, 200); // delay maior para não fechar ao abrir teclado
    }, { passive: true });
  }

  // ── 3. BUSCA: ao focar o input, rola a página para ele ficar visível ──
  // O teclado virtual empurra o layout — garantimos que o campo fique em cima.
  var searchInp = document.getElementById('searchInput');
  if (searchInp && isMobile) {
    searchInp.addEventListener('focus', function () {
      var self = this;
      setTimeout(function () {
        self.scrollIntoView({ behavior: 'smooth', block: 'start' });
        reposicionarSugestoes();
      }, 350);
    });

    // NÃO fecha sugestões no blur — o usuário pode ter só recolhido o teclado
    // para rolar e ver as sugestões. O fechamento é feito pelo touchstart fora.
    // (O busca.js cuida do _tocandoSugestao flag para isso)
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
