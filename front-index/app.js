// ─────────────────────────────────────────────────────────────
// APP.JS — Inicialização da página (deve ser o último script)
// ─────────────────────────────────────────────────────────────

function inicializarLoja() {
  restaurarCarrinho();
  lerHash();
  // Ativa o filtro correto caso venha de um hash na URL
  if (estado.cat !== 'todos') {
    var fb = document.querySelector('.ftab[data-cat="' + estado.cat + '"]');
    if (fb) {
      document.querySelectorAll('.ftab').forEach(function(b) { b.classList.remove('on'); });
      fb.classList.add('on');
      var subEl = document.getElementById('sub-' + estado.cat);
      if (subEl) {
        document.querySelectorAll('.subtabs').forEach(function(b) { b.classList.remove('on'); });
        subEl.classList.add('on');
      }
    }
  }
  updateBadge();
  renderizar();
}

// Aguarda os dados do loader antes de inicializar
document.addEventListener('planilhaCarregada', function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarLoja);
  } else {
    inicializarLoja();
  }
}, { once: true });
