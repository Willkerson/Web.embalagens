// ─────────────────────────────────────────────────────────────
// FILTROS.JS — Filtros de categoria, subcategoria e marca
// ─────────────────────────────────────────────────────────────

function renderBrandFilter(listaBase) {
  var wrap  = document.getElementById('brandFilterWrap');
  var inner = document.getElementById('brandFilterInner');
  var temSub = estado.sub && estado.sub !== 'todas';
  var marcas = temSub ? getMarcasDisponiveis(listaBase) : [];

  if (!temSub || marcas.length < 2) {
    wrap.classList.remove('on');
    estado.marca = 'todas';
    return;
  }

  inner.innerHTML = '<span class="brand-filter-label">Marca:</span>';

  var btnTodas = document.createElement('button');
  btnTodas.className = 'btab' + (estado.marca === 'todas' ? ' on' : '');
  btnTodas.textContent = 'Todas';
  btnTodas.onclick = function() { filtrarMarca('todas', this); };
  inner.appendChild(btnTodas);

  marcas.forEach(function(m) {
    var btn = document.createElement('button');
    btn.className = 'btab' + (estado.marca === m ? ' on' : '');
    btn.textContent = m;
    btn.onclick = function() { filtrarMarca(m, this); };
    inner.appendChild(btn);
  });

  wrap.classList.add('on');
}

function filtrarMarca(marca, btn) {
  estado.marca = marca;
  document.querySelectorAll('.btab').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  renderizar();
}

function filterCat(cat, btn) {
  limparBusca();
  estado.cat   = cat;
  estado.sub   = 'todas';
  estado.marca = 'todas';

  document.querySelectorAll('.ftab').forEach(function(b) { b.classList.remove('on'); });
  if (btn) btn.classList.add('on');
  else {
    var fb = document.querySelector('.ftab[data-cat="' + cat + '"]');
    if (fb) fb.classList.add('on');
  }

  document.querySelectorAll('.subtabs').forEach(function(b) { b.classList.remove('on'); });
  document.getElementById('brandFilterWrap').classList.remove('on');

  if (cat !== 'todos') {
    var sub = document.getElementById('sub-' + cat);
    if (sub) {
      sub.classList.add('on');
      sub.querySelectorAll('.stab').forEach(function(b) { b.classList.remove('on'); });
      sub.querySelector('.stab').classList.add('on');
    }
  }

  salvarHash();
  renderizar();
  document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}

function filtrarSub(sub, btn, cat) {
  limparBusca();
  if (cat) estado.cat = cat;
  estado.sub   = sub;
  estado.marca = 'todas';

  if (cat) {
    document.querySelectorAll('.ftab').forEach(function(b) { b.classList.remove('on'); });
    var fb = document.querySelector('.ftab[data-cat="' + cat + '"]');
    if (fb) fb.classList.add('on');
    document.querySelectorAll('.subtabs').forEach(function(b) { b.classList.remove('on'); });
    var subEl = document.getElementById('sub-' + cat);
    if (subEl) subEl.classList.add('on');
  }

  if (btn) {
    var parentSub = btn.closest('.subtabs');
    if (parentSub) parentSub.querySelectorAll('.stab').forEach(function(b) { b.classList.remove('on'); });
    btn.classList.add('on');
  }

  salvarHash();
  renderizar();

  if (sub !== 'todas') scrollParaSec(sub);
  else document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}

function scrollParaSec(sub) {
  setTimeout(function() {
    var sec = document.querySelector('.psec[data-sub="' + sub + '"]');
    if (!sec) {
      var secs = document.querySelectorAll('.psec');
      if (secs.length) sec = secs[0];
    }
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}
