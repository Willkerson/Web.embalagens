/* admin-calc.js — Calculadora de Preço integrada ao Admin
   Salve em: admin-fl/admin-calc.js
   Depende de: admin-core.js (getProd, setEd, refreshCard, prods, showToast)
*/
'use strict';

var calcResultado = null;
var calcProdSel   = null;

/* ── Abre/fecha painel ── */
document.getElementById('btn-calc-panel').addEventListener('click', function() {
  var p = document.getElementById('calcPanel');
  p.classList.toggle('on');
  if (p.classList.contains('on')) {
    p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

/* ── Busca produto no catálogo ── */
function calcBuscarProd() {
  var q   = (document.getElementById('calc-busca-prod').value || '').toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  var sug = document.getElementById('calc-prod-sug');

  if (!q || q.length < 2) { sug.style.display = 'none'; return; }

  var lista = prods()
    .map(function(p) { return getProd(p); })
    .filter(function(ep) {
      return ep.nome && ep.nome.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .includes(q);
    })
    .slice(0, 8);

  if (!lista.length) { sug.style.display = 'none'; return; }

  sug.innerHTML = '';
  sug.style.display = 'block';

  lista.forEach(function(ep) {
    var div = document.createElement('div');
    div.className = 'calc-sug-item';
    div.innerHTML =
      '<span class="calc-sug-nome">' + calcEsc(ep.nome) + '</span>' +
      '<span class="calc-sug-preco">R$ ' + calcFmt(ep.preco || 0) + '</span>';
    div.onmousedown = function() { calcSelecionarProd(ep); };
    sug.appendChild(div);
  });
}

function calcSelecionarProd(ep) {
  calcProdSel = { id: ep.id, nome: ep.nome, preco: parseFloat(ep.preco) || 0 };

  document.getElementById('calc-busca-prod').value        = ep.nome;
  document.getElementById('calc-prod-sug').style.display  = 'none';

  var box = document.getElementById('calc-prod-sel-box');
  box.style.display = 'flex';
  document.getElementById('calc-prod-sel-nome').textContent  = ep.nome;
  document.getElementById('calc-prod-sel-preco').textContent = 'Preço atual: R$ ' + calcFmt(ep.preco || 0);

  calcAtualizar();
}

function calcLimparProdSel() {
  calcProdSel = null;
  document.getElementById('calc-busca-prod').value            = '';
  document.getElementById('calc-prod-sug').style.display      = 'none';
  document.getElementById('calc-prod-sel-box').style.display  = 'none';
  document.getElementById('calc-aviso').style.display         = 'none';
}

/* ── Toggle linha ICMS ── */
function calcToggleICMS() {
  var inc = document.getElementById('calc-icms-inc').value;
  document.getElementById('calc-icms-row').style.display = inc === 'nao' ? 'grid' : 'none';
  calcAtualizar();
}

/* ── Chips de margem ── */
function calcSetMargem(v) {
  document.getElementById('calc-margem').value = v;
  document.querySelectorAll('#calc-margem-chips .calc-chip').forEach(function(b) {
    b.classList.toggle('on', parseInt(b.textContent) === v);
  });
  calcAtualizar();
}

/* ── Calculo principal ── */
function calcAtualizar() {
  var custo  = parseFloat(document.getElementById('calc-custo').value)  || 0;
  var margem = parseFloat(document.getElementById('calc-margem').value) || 0;
  var frete  = parseFloat(document.getElementById('calc-frete').value)  || 0;
  var inc    = document.getElementById('calc-icms-inc').value;
  var icmsA  = parseFloat((document.getElementById('calc-icms') || {}).value) || 0;
  var ipiA   = parseFloat((document.getElementById('calc-ipi')  || {}).value) || 0;
  var arred  = document.getElementById('calc-arred').value;

  var elRes  = document.getElementById('calc-resultado');
  var elVaz  = document.getElementById('calc-vazio');

  if (custo <= 0) {
    elRes.style.display = 'none';
    elVaz.style.display = 'block';
    return;
  }

  elVaz.style.display = 'none';

  var base = custo, vICMS = 0, vIPI = 0;
  if (inc === 'nao') {
    if (icmsA > 0) { vICMS = base * (icmsA / 100); base += vICMS; }
    if (ipiA  > 0) { vIPI  = custo * (ipiA / 100); base += vIPI; }
  }
  var custoTotal = base + frete;
  var fator      = 1 + margem / 100;
  var calc       = custoTotal * fator;

  var final = calc, arredTxt = '';
  if (arred === 'ceil') {
    final    = Math.ceil(calc);
    arredTxt = 'Arredondado para cima';
  } else if (parseFloat(arred) > 0) {
    var dec  = parseFloat(arred);
    var intP = Math.floor(calc);
    final    = intP + dec;
    if (final < calc) final += 1;
    arredTxt = 'Arredondado ,' + String(arred).replace('0.', '');
  }

  var lucro  = final - custoTotal;
  var lucroP = custoTotal > 0 ? (lucro / custoTotal * 100).toFixed(1) : '0';

  calcResultado = { custo: custo, custoTotal: custoTotal, final: final,
    lucro: lucro, lucroP: lucroP, margem: margem,
    vICMS: vICMS, vIPI: vIPI, frete: frete, inc: inc,
    icmsA: icmsA, ipiA: ipiA, fator: fator };

  elRes.style.display = 'block';
  document.getElementById('calc-r-custo').textContent  = 'R$ ' + calcFmt(custoTotal);
  document.getElementById('calc-r-margem').textContent = margem + '%';
  document.getElementById('calc-r-preco').textContent  = 'R$ ' + calcFmt(final);
  document.getElementById('calc-r-arred').textContent  = arredTxt;
  document.getElementById('calc-r-lucro').textContent  = 'R$ ' + calcFmt(lucro);
  document.getElementById('calc-r-lucrop').textContent = lucroP + '% sobre o custo';

  var bd = '';
  bd += calcBdRow('Valor na DANFE', 'R$ ' + calcFmt(custo), '');
  if (inc === 'nao' && vICMS > 0) bd += calcBdRow('+ ICMS (' + icmsA + '%)', 'R$ ' + calcFmt(vICMS), 'amb');
  if (inc === 'nao' && vIPI  > 0) bd += calcBdRow('+ IPI ('  + ipiA  + '%)', 'R$ ' + calcFmt(vIPI),  'red');
  if (frete > 0)                   bd += calcBdRow('+ Frete / outros',        'R$ ' + calcFmt(frete), 'acc');
  bd += calcBdRow('= Custo total',            'R$ ' + calcFmt(custoTotal), 'acc');
  bd += calcBdRow('× Markup ' + margem + '%', '× ' + fator.toFixed(2),    'amb');
  bd += '<div class="calc-bd-row calc-bd-tot">'
      + '<span>Preço de venda final</span>'
      + '<span class="calc-c-grn">R$ ' + calcFmt(final) + '</span>'
      + '</div>';
  document.getElementById('calc-breakdown').innerHTML = bd;
}

function calcBdRow(lbl, val, cls) {
  return '<div class="calc-bd-row"><span>' + lbl + '</span>'
       + '<span' + (cls ? ' class="calc-c-' + cls + '"' : '') + '>' + val + '</span></div>';
}

/* ── Aplicar preço no produto vinculado ── */
function calcAplicarPreco() {
  if (!calcResultado) { showToast('Calcule um preço primeiro', 'amb'); return; }
  if (!calcProdSel)   { showToast('Selecione um produto acima', 'amb'); return; }

  var precoNovo = Math.round(calcResultado.final * 100) / 100;
  var precoAnt  = calcProdSel.preco;

  /* setEd do admin-core: registra edição, marca "editado", atualiza card */
  setEd(calcProdSel.id, 'preco', precoNovo);

  calcProdSel.preco = precoNovo;
  document.getElementById('calc-prod-sel-preco').textContent =
    'Preço atual: R$ ' + calcFmt(precoNovo);

  var aviso = document.getElementById('calc-aviso');
  aviso.style.display = 'block';
  aviso.innerHTML = '✅ <strong>R$ ' + calcFmt(precoNovo) + '</strong> aplicado'
    + (precoAnt > 0 ? ' · era R$ ' + calcFmt(precoAnt) : '')
    + ' · clique em 🚀 Publicar para enviar ao GitHub.';

  showToast('✓ R$ ' + calcFmt(precoNovo) + ' — "'
    + calcProdSel.nome.substring(0, 28)
    + (calcProdSel.nome.length > 28 ? '…' : '') + '"', 'grn');
}

/* ── Copiar preço ── */
function calcCopiarPreco() {
  if (!calcResultado) return;
  var txt = 'R$ ' + calcFmt(calcResultado.final);
  navigator.clipboard.writeText(txt).then(function() {
    showToast('📋 ' + txt + ' copiado!', 'grn');
  });
}

/* ── Limpar calculadora ── */
function calcLimpar() {
  ['calc-custo', 'calc-frete', 'calc-icms', 'calc-ipi'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('calc-margem').value            = '80';
  document.getElementById('calc-icms-inc').value          = 'sim';
  document.getElementById('calc-arred').value             = '0';
  document.getElementById('calc-icms-row').style.display  = 'none';
  document.getElementById('calc-resultado').style.display = 'none';
  document.getElementById('calc-vazio').style.display     = 'block';
  document.getElementById('calc-aviso').style.display     = 'none';
  calcLimparProdSel();
  calcResultado = null;

  document.querySelectorAll('#calc-margem-chips .calc-chip').forEach(function(b) {
    b.classList.toggle('on', b.textContent === '80%');
  });
}

/* ── Fechar sugestões ao clicar fora ── */
document.addEventListener('click', function(e) {
  if (!e.target.closest('#calc-busca-prod') && !e.target.closest('#calc-prod-sug')) {
    var s = document.getElementById('calc-prod-sug');
    if (s) s.style.display = 'none';
  }
});

/* ── Utilitários locais ── */
function calcFmt(n) { return parseFloat(n).toFixed(2).replace('.', ','); }
function calcEsc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
