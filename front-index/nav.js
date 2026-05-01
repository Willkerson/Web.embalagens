// ─────────────────────────────────────────────────────────────
// NAV.JS — Navegação, mega-menu e alternância de tema
// ─────────────────────────────────────────────────────────────

// Classe "sc" no header ao rolar
window.addEventListener('scroll', function() {
  document.getElementById('hdr').classList.toggle('sc', scrollY > 50);
}, { passive: true });

function toggleNav(id) {
  document.querySelectorAll('.nav-item').forEach(function(el) {
    if (el.id !== id) el.classList.remove('open');
  });
  document.getElementById(id).classList.toggle('open');
}

function fecharNav() {
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.remove('open');
  });
}

function toggleTheme() {
  var html = document.documentElement;
  var btn  = document.getElementById('themeBtn');
  var dark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', dark ? 'light' : 'dark');
  btn.textContent = dark ? '🌙' : '☀️';
}

// Fecha nav e sugestões ao clicar fora
document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-item'))   fecharNav();
  if (!e.target.closest('#searchWrap')) esconderSugestoes();
});
