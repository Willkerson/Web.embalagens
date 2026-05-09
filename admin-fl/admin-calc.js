/* admin-calc.js — Calculadora de Preço integrada ao Admin
   Versão expandida: quantidade, custo unitário, cadastro de produto
   Depende de: admin-core.js (getProd, setEd, refreshCard, prods, showToast)
   Salve em: admin-fl/admin-calc.js
*/
'use strict';

var calcResultado = null;
var calcProdSel   = null;

/* ════════════════════════════════════════
   PAINEL — abre / fecha
   ════════════════════════════════════════ */
document.getElementById('btn-calc-panel').addEventListener('click', function () {
  var p = document.getElementById('calcPanel');
  p.classList.toggle('on');
  if (p.classList.contains('on')) {
    p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

/* ════════════════════════════════════════
   ABAS — Calculadora / Cadastro
   ════════════════════════════════════════ */
function calcSwitchTab(tab) {
  document.querySelectorAll('.calc-tab').forEach(function (el) {
    el.classList.toggle('on', el.dataset.tab === tab);
  });
  document.querySelectorAll('.calc-pane').forEach(function (el) {
    el.classList.toggle('on', el.dataset.pane === tab);
  });
  if (tab === 'cad') cadRenderLista();
}

/* ════════════════════════════════════════
   SYNC — custo unitário ↔ quantidade ↔ custo total
   ════════════════════════════════════════ */
function calcSyncCusto(origem) {
  var elUnit  = document.getElementById('calc-custo-unit');
  var elQtd   = document.getElementById('calc-qtd');
  var elTotal = document.getElementById('calc-custo-total');

  var unit  = parseFloat(elUnit.value)  || 0;
  var qtd   = parseFloat(elQtd.value)   || 1;
  var total = parseFloat(elTotal.value) || 0;

  if (origem === 'unit' || origem === 'qtd') {
    if (unit > 0) elTotal.value = (unit * qtd).toFixed(2);
  } else if (origem === 'total') {
    if (total > 0 && qtd > 0) elUnit.value = (total / qtd).toFixed(2);
  }
}

/* ════════════════════════════════════════
   BUSCA DE PRODUTO NO CATÁLOGO
   ════════════════════════════════════════ */
function calcBuscarProd() {
  var q   = (document.getElementById('calc-busca-prod').value || '')
              .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  var sug = document.getElementById('calc-prod-sug');

  if (!q || q.length < 1) { sug.style.display = 'none'; return; }

  var lista = [];

  /* Produtos do admin-core (se disponível) */
  if (typeof prods === 'function') {
    prods().forEach(function (id) {
      var ep = getProd(id);
      if (ep && ep.nome && ep.nome.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)) {
        lista.push({ id: ep.id, nome: ep.nome, preco: ep.preco || 0, custo: ep.custo || 0, _src: 'core' });
      }
    });
  }

  /* Produtos cadastrados localmente */
  calcGetLocalProds().forEach(function (p) {
    if (p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)) {
      lista.push({ id: p.id, nome: p.nome, preco: p.preco || 0, custo: p.custo || 0, _src: 'local' });
    }
  });

  lista = lista.slice(0, 8);

  if (!lista.length) { sug.style.display = 'none'; return; }

  sug.innerHTML     = '';
  sug.style.display = 'block';

  lista.forEach(function (p) {
    var div       = document.createElement('div');
    div.className = 'calc-sug-item';
    div.innerHTML =
      '<span class="calc-sug-nome">' + calcEsc(p.nome) + '</span>' +
      '<span class="calc-sug-preco">R$ ' + calcFmt(p.preco) + '</span>';
    div.onmousedown = function () { calcSelecionarProd(p); };
    sug.appendChild(div);
  });
}

function calcSelecionarProd(p) {
  calcProdSel = { id: p.id, nome: p.nome, preco: parseFloat(p.preco) || 0, custo: parseFloat(p.custo) || 0, _src: p._src };

  document.getElementById('calc-busca-prod').value       = p.nome;
  document.getElementById('calc-prod-sug').style.display = 'none';

  var box = document.getElementById('calc-prod-sel-box');
  box.style.display = 'flex';
  document.getElementById('calc-prod-sel-nome').textContent  = p.nome;
  document.getElementById('calc-prod-sel-preco').textContent = 'Preço atual: R$ ' + calcFmt(p.preco);

  /* Preenche custo automaticamente se cadastrado */
  if (p.custo > 0) {
    document.getElementById('calc-custo-unit').value = p.custo.toFixed(2);
    calcSyncCusto('unit');
  }

  calcAtualizar();
}

function calcLimparProdSel() {
  calcProdSel = null;
  document.getElementById('calc-busca-prod').value            = '';
  document.getElementById('calc-prod-sug').style.display      = 'none';
  document.getElementById('calc-prod-sel-box').style.display  = 'none';
  document.getElementById('calc-aviso').style.display         = 'none';
}

/* ════════════════════════════════════════
   TOGGLE ICMS
   ════════════════════════════════════════ */
function calcToggleICMS() {
  var inc = document.getElementById('calc-icms-inc').value;
  document.getElementById('calc-icms-row').style.display = inc === 'nao' ? 'block' : 'none';
  calcAtualizar();
}

/* ════════════════════════════════════════
   CHIPS DE MARGEM
   ════════════════════════════════════════ */
function calcSetMargem(v) {
  document.getElementById('calc-margem').value = v;
  document.querySelectorAll('#calc-margem-chips .calc-chip').forEach(function (b) {
    b.classList.toggle('on', parseInt(b.textContent) === v);
  });
  calcAtualizar();
}

function calcSyncChips() {
  var v = parseInt(document.getElementById('calc-margem').value) || 0;
  document.querySelectorAll('#calc-margem-chips .calc-chip').forEach(function (b) {
    b.classList.toggle('on', parseInt(b.textContent) === v);
  });
}

/* ════════════════════════════════════════
   CÁLCULO PRINCIPAL
   ════════════════════════════════════════ */
function calcAtualizar() {
  var unit   = parseFloat(document.getElementById('calc-custo-unit').value)  || 0;
  var qtd    = parseFloat(document.getElementById('calc-qtd').value)          || 1;
  var frete  = parseFloat(document.getElementById('calc-frete').value)        || 0;
  var margem = parseFloat(document.getElementById('calc-margem').value)       || 0;
  var inc    = document.getElementById('calc-icms-inc').value;
  var icmsA  = parseFloat((document.getElementById('calc-icms') || {}).value) || 0;
  var ipiA   = parseFloat((document.getElementById('calc-ipi')  || {}).value) || 0;
  var arred  = document.getElementById('calc-arred').value;

  var elRes = document.getElementById('calc-resultado');
  var elVaz = document.getElementById('calc-vazio');

  if (unit <= 0) { elRes.style.display = 'none'; elVaz.style.display = 'block'; return; }
  elVaz.style.display = 'none';

  /* Impostos */
  var base = unit, vICMS = 0, vIPI = 0;
  if (inc === 'nao') {
    if (icmsA > 0) { vICMS = base * (icmsA / 100); base += vICMS; }
    if (ipiA  > 0) { vIPI  = unit * (ipiA  / 100); base += vIPI; }
  }

  /* Frete rateado por unidade */
  var freteUnit  = qtd > 1 ? frete / qtd : frete;
  var custoUnit  = base + freteUnit;
  var fator      = 1 + margem / 100;
  var calc       = custoUnit * fator;

  /* Arredondamento */
  var final = calc, arredTxt = '';
  if (arred === 'ceil') {
    final    = Math.ceil(calc);
    arredTxt = 'Arredondado para cima (inteiro)';
  } else if (parseFloat(arred) > 0) {
    var dec  = parseFloat(arred);
    var intP = Math.floor(calc);
    final    = intP + dec;
    if (final < calc) final += 1;
    arredTxt = 'Termina em ,' + String(arred).replace('0.', '');
  }

  var lucro  = final - custoUnit;
  var lucroP = custoUnit > 0 ? (lucro / custoUnit * 100).toFixed(1) : '0';

  calcResultado = {
    unit: unit, qtd: qtd, custoUnit: custoUnit, freteUnit: freteUnit,
    final: final, lucro: lucro, lucroP: lucroP, margem: margem,
    vICMS: vICMS, vIPI: vIPI, frete: frete, inc: inc,
    icmsA: icmsA, ipiA: ipiA, fator: fator
  };

  elRes.style.display = 'block';

  document.getElementById('calc-r-preco').textContent  = 'R$ ' + calcFmt(final);
  document.getElementById('calc-r-arred').textContent  = arredTxt;
  document.getElementById('calc-r-lucro').textContent  = 'R$ ' + calcFmt(lucro);
  document.getElementById('calc-r-lucrop').textContent = lucroP + '% sobre o custo';
  document.getElementById('calc-r-custo').textContent  = 'R$ ' + calcFmt(custoUnit);
  document.getElementById('calc-r-margem').textContent = margem + '%';

  /* Breakdown */
  var bd = '';
  bd += calcBdRow('Valor na DANFE / unitário', 'R$ ' + calcFmt(unit), '');
  if (inc === 'nao' && vICMS > 0) bd += calcBdRow('+ ICMS (' + icmsA + '%)', 'R$ ' + calcFmt(vICMS), 'amb');
  if (inc === 'nao' && vIPI  > 0) bd += calcBdRow('+ IPI ('  + ipiA  + '%)', 'R$ ' + calcFmt(vIPI),  'red');
  if (qtd > 1)                     bd += calcBdRow('Quantidade', '× ' + qtd + ' un', '');
  if (freteUnit > 0)               bd += calcBdRow('+ Frete por unidade', 'R$ ' + calcFmt(freteUnit), '');
  bd += calcBdRow('= Custo por unidade', 'R$ ' + calcFmt(custoUnit), 'acc');
  bd += calcBdRow('× Markup ' + margem + '%', '× ' + fator.toFixed(2), 'amb');
  bd += '<div class="calc-bd-row calc-bd-tot">'
      + '<span>Preço de venda (por unidade)</span>'
      + '<span class="calc-c-grn">R$ ' + calcFmt(final) + '</span>'
      + '</div>';
  if (qtd > 1) {
    bd += '<div class="calc-bd-row">'
        + '<span>Total para ' + qtd + ' unidades</span>'
        + '<span class="calc-c-grn">R$ ' + calcFmt(final * qtd) + '</span>'
        + '</div>';
  }

  document.getElementById('calc-breakdown').innerHTML = bd;
}

function calcBdRow(lbl, val, cls) {
  return '<div class="calc-bd-row"><span>' + lbl + '</span>'
       + '<span' + (cls ? ' class="calc-c-' + cls + '"' : '') + '>' + val + '</span></div>';
}

/* ════════════════════════════════════════
   APLICAR PREÇO AO PRODUTO
   ════════════════════════════════════════ */
function calcAplicarPreco() {
  if (!calcResultado) { showToast('Calcule um preço primeiro', 'amb'); return; }
  if (!calcProdSel)   { showToast('Selecione um produto acima', 'amb'); return; }

  var precoNovo = Math.round(calcResultado.final * 100) / 100;
  var precoAnt  = calcProdSel.preco;

  if (calcProdSel._src === 'core' && typeof setEd === 'function') {
    setEd(calcProdSel.id, 'preco', precoNovo);
  } else {
    var locals = calcGetLocalProds();
    var idx    = locals.findIndex(function (p) { return p.id === calcProdSel.id; });
    if (idx > -1) { locals[idx].preco = precoNovo; calcSaveLocalProds(locals); }
  }

  calcProdSel.preco = precoNovo;
  document.getElementById('calc-prod-sel-preco').textContent =
    'Preço atual: R$ ' + calcFmt(precoNovo);

  var aviso = document.getElementById('calc-aviso');
  aviso.style.display = 'block';
  aviso.innerHTML = '✅ <strong>R$ ' + calcFmt(precoNovo) + '</strong> aplicado'
    + (precoAnt > 0 ? ' · era R$ ' + calcFmt(precoAnt) : '')
    + (calcProdSel._src === 'core' ? ' · clique em 🚀 Publicar para enviar ao GitHub.' : ' · salvo localmente.');

  if (typeof showToast === 'function') {
    showToast('✓ R$ ' + calcFmt(precoNovo) + ' — "' +
      calcProdSel.nome.substring(0, 28) +
      (calcProdSel.nome.length > 28 ? '…' : '') + '"', 'grn');
  }
}

/* ════════════════════════════════════════
   COPIAR PREÇO
   ════════════════════════════════════════ */
function calcCopiarPreco() {
  if (!calcResultado) return;
  var txt = 'R$ ' + calcFmt(calcResultado.final);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(function () {
      if (typeof showToast === 'function') showToast('📋 ' + txt + ' copiado!', 'grn');
    });
  }
}

/* ════════════════════════════════════════
   LIMPAR CALCULADORA
   ════════════════════════════════════════ */
function calcLimpar() {
  ['calc-custo-unit', 'calc-custo-total', 'calc-frete', 'calc-icms', 'calc-ipi'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('calc-qtd').value               = '1';
  document.getElementById('calc-margem').value            = '80';
  document.getElementById('calc-icms-inc').value          = 'sim';
  document.getElementById('calc-arred').value             = '0';
  document.getElementById('calc-icms-row').style.display  = 'none';
  document.getElementById('calc-resultado').style.display = 'none';
  document.getElementById('calc-vazio').style.display     = 'block';
  document.getElementById('calc-aviso').style.display     = 'none';
  calcLimparProdSel();
  calcSyncChips();
  calcResultado = null;
}

/* ════════════════════════════════════════
   FECHAR SUGESTÕES AO CLICAR FORA
   ════════════════════════════════════════ */
document.addEventListener('click', function (e) {
  if (!e.target.closest('#calc-busca-prod') && !e.target.closest('#calc-prod-sug')) {
    var s = document.getElementById('calc-prod-sug');
    if (s) s.style.display = 'none';
  }
});

/* ════════════════════════════════════════
   CADASTRO DE PRODUTO LOCAL (localStorage)
   ════════════════════════════════════════ */
var CAD_KEY = 'admin_calc_prods_local';

function calcGetLocalProds() {
  try { return JSON.parse(localStorage.getItem(CAD_KEY) || '[]'); } catch (e) { return []; }
}

function calcSaveLocalProds(lista) {
  try { localStorage.setItem(CAD_KEY, JSON.stringify(lista)); } catch (e) {}
}

function cadSalvar() {
  var nome = (document.getElementById('cad-nome').value || '').trim();
  if (!nome) {
    if (typeof showToast === 'function') showToast('Informe o nome do produto', 'amb');
    document.getElementById('cad-nome').focus();
    return;
  }

  var prod = {
    id:        'lp_' + Date.now(),
    nome:      nome,
    preco:     parseFloat(document.getElementById('cad-preco').value)   || 0,
    custo:     parseFloat(document.getElementById('cad-custo').value)   || 0,
    categoria: (document.getElementById('cad-cat').value    || '').trim(),
    estoque:   parseInt(document.getElementById('cad-estoque').value)   || 0,
    sku:       (document.getElementById('cad-sku').value    || '').trim(),
    unidade:   document.getElementById('cad-unidade').value,
    desc:      (document.getElementById('cad-desc').value   || '').trim(),
    criado:    new Date().toLocaleDateString('pt-BR')
  };

  var lista = calcGetLocalProds();
  lista.unshift(prod);
  calcSaveLocalProds(lista);

  cadRenderLista();

  var av = document.getElementById('cad-aviso');
  av.style.display = 'block';
  av.innerHTML = '✅ <strong>' + calcEsc(prod.nome) + '</strong> cadastrado com sucesso!';
  setTimeout(function () { av.style.display = 'none'; }, 4000);

  cadLimpar();
  if (typeof showToast === 'function') showToast('✓ Produto "' + prod.nome.substring(0, 28) + '" cadastrado', 'grn');
}

function cadLimpar() {
  ['cad-nome', 'cad-preco', 'cad-custo', 'cad-cat', 'cad-estoque', 'cad-sku', 'cad-desc'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('cad-unidade').value = 'un';
}

function cadExcluir(id) {
  if (!confirm('Excluir este produto?')) return;
  var lista = calcGetLocalProds().filter(function (p) { return p.id !== id; });
  calcSaveLocalProds(lista);
  cadRenderLista();
}

function cadUsarNaCalc(id) {
  var p = calcGetLocalProds().find(function (x) { return x.id === id; });
  if (!p) return;
  calcSwitchTab('calc');
  calcSelecionarProd(Object.assign({}, p, { _src: 'local' }));
}

function cadRenderLista() {
  var lista  = calcGetLocalProds();
  var elList = document.getElementById('cad-lista');
  var elCt   = document.getElementById('cad-count');

  if (elCt) elCt.textContent = lista.length;

  if (!lista.length) {
    elList.innerHTML = '<p class="calc-empty">Nenhum produto cadastrado ainda.</p>';
    return;
  }

  elList.innerHTML = lista.map(function (p) {
    return '<div class="cad-item">'
      + '<div class="cad-item-info">'
      + '<span class="cad-item-nome">' + calcEsc(p.nome) + '</span>'
      + '<span class="cad-item-meta">'
      + (p.categoria ? p.categoria + ' · ' : '')
      + (p.sku       ? 'SKU: ' + calcEsc(p.sku) + ' · ' : '')
      + 'R$ ' + calcFmt(p.preco)
      + (p.custo > 0 ? ' · custo R$ ' + calcFmt(p.custo) : '')
      + ' · ' + p.criado
      + '</span></div>'
      + '<div class="cad-item-btns">'
      + '<button class="calc-btn" onclick="cadUsarNaCalc(\'' + p.id + '\')" title="Usar na calculadora">🧮</button>'
      + '<button class="calc-btn calc-btn-del" onclick="cadExcluir(\'' + p.id + '\')" title="Excluir">🗑</button>'
      + '</div>'
      + '</div>';
  }).join('');
}

/* Inicializa lista ao carregar (se painel já estiver na aba cad) */
(function () {
  var pane = document.getElementById('pane-cad');
  if (pane && pane.classList.contains('on')) cadRenderLista();
})();

/* ════════════════════════════════════════
   UTILITÁRIOS
   ════════════════════════════════════════ */
function calcFmt(n) { return parseFloat(n || 0).toFixed(2).replace('.', ','); }

function calcEsc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
