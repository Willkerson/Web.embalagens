/* admin-calc-danfe.js — Leitor de DANFE sem API externa
   CORREÇÕES aplicadas:
   - danfeRenderItens injeta numa <div id="danfe-itens-lista"> filha,
     sem sobrescrever o cabeçalho fixo que está no HTML
   - IIFE de drag & drop removido (handlers já estão inline no HTML)
   - PDF.js carregado via DOMContentLoaded para garantir que o head exista
*/

'use strict';

/* ════════════════════════════════════════
   CARREGA PDF.js via CDN
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  if (window.pdfjsLib) return;
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload = function () {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  };
  document.head.appendChild(s);
});

/* ════════════════════════════════════════
   DRAG & DROP (handlers inline no HTML —
   danfeDrop() precisa existir globalmente)
   ════════════════════════════════════════ */
function danfeDrop(e) {
  e.preventDefault();
  var drop = document.getElementById('danfe-drop');
  if (drop) drop.classList.remove('over');
  var f = e.dataTransfer && e.dataTransfer.files[0];
  if (f) danfeProcessar(f);
}

/* ════════════════════════════════════════
   ENTRADA PRINCIPAL
   ════════════════════════════════════════ */
function danfeProcessar(file) {
  if (!file) return;
  if (file.type !== 'application/pdf') {
    danfeStatus('err', '❌ Envie um arquivo PDF da DANFE.'); return;
  }
  if (file.size > 20 * 1024 * 1024) {
    danfeStatus('err', '❌ PDF muito grande (máx. 20 MB).'); return;
  }

  danfeStatus('loading', '⏳ Lendo o PDF… aguarde.');

  /* Esconde lista antiga mas mantém o cabeçalho do resultado */
  var lista = document.getElementById('danfe-itens-lista');
  if (lista) lista.innerHTML = '';
  var btns = document.getElementById('danfe-itens-btns');
  if (btns) btns.innerHTML = '';
  document.getElementById('danfe-resultado').style.display = 'none';

  var reader = new FileReader();
  reader.onload = function (ev) { danfeExtrairTexto(ev.target.result); };
  reader.onerror = function () { danfeStatus('err', '❌ Não foi possível ler o arquivo.'); };
  reader.readAsArrayBuffer(file);
}

/* ════════════════════════════════════════
   EXTRAI TEXTO COM PDF.js
   ════════════════════════════════════════ */
function danfeExtrairTexto(arrayBuffer) {
  if (!window.pdfjsLib) {
    danfeStatus('err', '❌ PDF.js ainda não carregou. Tente novamente em alguns segundos.');
    return;
  }

  pdfjsLib.getDocument({ data: arrayBuffer }).promise
    .then(function (pdf) {
      var paginas = [];
      for (var i = 1; i <= pdf.numPages; i++) paginas.push(i);

      return paginas.reduce(function (chain, num) {
        return chain.then(function (textoAcc) {
          return pdf.getPage(num).then(function (page) {
            return page.getTextContent().then(function (content) {
              var linhas = [];
              var ultimoY = null;
              content.items.forEach(function (item) {
                var y = Math.round(item.transform[5]);
                if (ultimoY !== null && Math.abs(y - ultimoY) > 3) linhas.push('\n');
                linhas.push(item.str);
                ultimoY = y;
              });
              return textoAcc + linhas.join(' ') + '\n--- PAGINA ' + num + ' ---\n';
            });
          });
        });
      }, Promise.resolve(''));
    })
    .then(function (textoCompleto) {
      danfeParseTexto(textoCompleto);
    })
    .catch(function (err) {
      danfeStatus('err', '❌ Erro ao ler PDF: ' + (err.message || err));
    });
}

/* ════════════════════════════════════════
   PARSER DA DANFE
   ════════════════════════════════════════ */
function danfeParseTexto(txt) {
  var t = txt.replace(/\r/g, '').replace(/\t/g, ' ');

  var nf       = danfePegaValor(t, /N[ºo°\.]\s*(?:DA\s*)?(?:NF|NOTA)[^\d]*(\d[\d\.\/]+)/i)
              || danfePegaValor(t, /NÚMERO\s*[:\-]?\s*(\d+)/i)
              || danfePegaValor(t, /NF-e\s*[nNºo°]*\s*[:\-]?\s*(\d+)/i);

  var emitente = danfePegaValor(t, /IDENTIFICAÇÃO DO EMITENTE\s*\n?\s*([^\n]+)/i)
              || danfePegaValor(t, /RAZÃO SOCIAL[:\-]?\s*([^\n]+)/i);

  var data     = danfePegaValor(t, /DATA\s*(?:DE\s*)?EMISSÃO[:\-\s]*(\d{2}\/\d{2}\/\d{4})/i)
              || danfePegaValor(t, /(\d{2}\/\d{2}\/\d{4})/);

  var frete    = danfePegaNum(t, /FRETE\s*[:\-]?\s*R?\$?\s*([\d\.,]+)/i)
              || danfePegaNum(t, /VALOR\s*DO\s*FRETE\s*[:\-]?\s*R?\$?\s*([\d\.,]+)/i);

  var totalNF  = danfePegaNum(t, /VALOR\s*TOTAL\s*DA\s*NOTA\s*[:\-]?\s*R?\$?\s*([\d\.,]+)/i)
              || danfePegaNum(t, /TOTAL\s*DA\s*NF[:\-\s]*R?\$?\s*([\d\.,]+)/i);

  var itens = danfeExtrairItens(t);

  if (!itens.length) {
    danfeStatus('err',
      '⚠️ Não foi possível identificar os itens automaticamente.<br>' +
      'Verifique se o PDF é uma DANFE digital (não escaneada).<br>' +
      '<small>Dica: abra o PDF e tente selecionar o texto — se não conseguir, é um scan.</small>'
    );
    return;
  }

  danfeStatus('ok',
    '✅ ' + itens.length + ' item(ns) encontrado(s). '
    + (emitente ? '<strong>' + danfeEsc(emitente.trim()) + '</strong> · ' : '')
    + (nf       ? 'NF ' + nf + ' · ' : '')
    + (data     ? data : '')
    + (frete    ? ' · Frete R$ ' + danfeFmt(frete) : '')
    + (totalNF  ? ' · Total NF R$ ' + danfeFmt(totalNF) : '')
  );

  danfeRenderItens({ nf: nf, emitente: emitente, data: data, frete: frete, itens: itens });
}

/* ════════════════════════════════════════
   EXTRAÇÃO DE ITENS — 3 estratégias
   ════════════════════════════════════════ */
function danfeExtrairItens(t) {
  var itens = danfeStrategiaTabular(t);
  if (itens.length) return itens;
  itens = danfeStrategiaLinha(t);
  if (itens.length) return itens;
  return danfeStrategiaFallback(t);
}

function danfeStrategiaTabular(t) {
  var blocoMatch = t.match(
    /DADOS DOS PRODUTOS[^\n]*\n([\s\S]+?)(?:CÁLCULO DO IMPOSTO|DADOS ADICIONAIS|INFORMAÇÕES COMPLEMENTARES|RESERVADO AO FISCO)/i
  );
  if (!blocoMatch) return [];

  var bloco  = blocoMatch[1];
  var linhas = bloco.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
  var itens  = [];
  var reItem = /^(\d{1,10})\s+(.+?)\s+(\d{1,3}[\d\.]*)\s+(UN|CX|KG|LT|MT|PC|GR|ML|MR|PAR|UNID|CAIXA|ROLO|POTE|FRASCO|SACO|DZ|DUZIA)\s+([\d\.,]+)\s+([\d\.,]+)/i;

  linhas.forEach(function (linha) {
    var m = linha.match(reItem);
    if (!m) return;
    var qtd  = danfeNumStr(m[3]);
    var unit = danfeNumStr(m[5]);
    if (qtd <= 0 || unit <= 0) return;
    itens.push({
      codigo: m[1], descricao: m[2].trim(), unidade: m[4].toUpperCase(),
      quantidade: qtd, valor_unitario: unit, valor_total: danfeNumStr(m[6]),
      icms_aliq: 0, ipi_aliq: 0
    });
  });
  return itens;
}

function danfeStrategiaLinha(t) {
  var itens  = [];
  var linhas = t.split('\n');
  var reValores = /([\d]{1,3}(?:[,\.]\d{3})*(?:[,\.]\d{2,4}))\s+([\d]{1,3}(?:[,\.]\d{3})*(?:[,\.]\d{2,4}))\s*$/;

  for (var i = 0; i < linhas.length; i++) {
    var linha = linhas[i].trim();
    if (!linha) continue;
    if (/^(CÓDIGO|COD\.|DESCRIÇÃO|PRODUTO|CFOP|NCM|TOTAL|SUBTOTAL|FRETE|SEGURO|DESC\.|OBSERV)/i.test(linha)) continue;
    if (/^\d{2}\/\d{2}\/\d{4}/.test(linha)) continue;

    var m = linha.match(reValores);
    if (!m) continue;

    var vtot = danfeNumStr(m[1]);
    var vuni = danfeNumStr(m[2]);
    if (vtot <= 0 || vuni <= 0) continue;
    if (vuni > vtot && vtot > 1) continue;

    var qtdCalc  = vuni > 0 ? Math.round(vtot / vuni * 10) / 10 : 1;
    if (qtdCalc < 0.01 || qtdCalc > 99999) continue;

    var semValores = linha.replace(reValores, '').trim();
    var mQtd = semValores.match(/\s+([\d]{1,6}(?:[,\.]\d{1,4})?)\s+(UN|CX|KG|LT|PC|GR|ML|MT|PAR|UNID|DUZIA|DZ|CAIXA|ROLO)?\s*$/i);
    var qtd  = mQtd ? danfeNumStr(mQtd[1]) : qtdCalc;
    var desc = semValores.replace(/\s+([\d]{1,6}(?:[,\.]\d{1,4})?)\s+(UN|CX|KG|LT|PC|GR|ML|MT|PAR|UNID|DUZIA|DZ|CAIXA|ROLO)?\s*$/i, '').trim();

    if (!desc || desc.length < 3 || /^\d+$/.test(desc)) continue;

    itens.push({ descricao: desc, quantidade: qtd, valor_unitario: vuni, valor_total: vtot, icms_aliq: 0, ipi_aliq: 0, unidade: 'UN' });
  }
  return itens;
}

function danfeStrategiaFallback(t) {
  var itens = [];
  var re = /([A-ZÁÉÍÓÚÀÃÕÂÊÔ][A-ZÁÉÍÓÚÀÃÕÂÊÔa-záéíóúàãõâêô0-9 \-\/\.]{4,60}?)\s+(\d{1,5}(?:[,\.]\d{1,4})?)\s+(?:UN|CX|KG|PC|LT|GR)?\s*([\d]{1,3}(?:[,\.]\d{3})*[,\.]\d{2})/gi;
  var m;
  while ((m = re.exec(t)) !== null) {
    var desc = m[1].trim();
    var qtd  = danfeNumStr(m[2]);
    var unit = danfeNumStr(m[3]);
    if (!desc || qtd <= 0 || unit <= 0 || unit > 99999 || /^\d+$/.test(desc)) continue;
    itens.push({ descricao: desc, quantidade: qtd, valor_unitario: unit, valor_total: qtd * unit, icms_aliq: 0, ipi_aliq: 0, unidade: 'UN' });
    if (itens.length >= 50) break;
  }
  return itens;
}

/* ════════════════════════════════════════
   RENDERIZA ITENS
   ► Injeta numa div filha — NÃO sobrescreve
     o cabeçalho fixo que está no HTML
   ════════════════════════════════════════ */
function danfeRenderItens(dados) {
  var itens = dados.itens || [];
  var res   = document.getElementById('danfe-resultado');

  /* Garante que existe a div de lista e a de botões */
  var lista = document.getElementById('danfe-itens-lista');
  if (!lista) {
    lista = document.createElement('div');
    lista.id = 'danfe-itens-lista';
    res.appendChild(lista);
  }
  var btns = document.getElementById('danfe-itens-btns');
  if (!btns) {
    btns = document.createElement('div');
    btns.id = 'danfe-itens-btns';
    res.appendChild(btns);
  }

  /* Renderiza linhas editáveis */
  lista.innerHTML = itens.map(function (item, i) {
    return '<div class="danfe-item-row" data-idx="' + i + '">'
      + '<input class="danfe-nome"  data-field="descricao"      value="' + danfeEsc(item.descricao || '') + '">'
      + '<input style="width:100%"  data-field="quantidade"     value="' + danfeNum(item.quantidade) + '" type="number" min="0" step="any">'
      + '<input style="width:100%"  data-field="valor_unitario" value="' + danfeNum(item.valor_unitario) + '" type="number" min="0" step="any">'
      + '<input style="width:100%"  data-field="icms_aliq"      value="' + danfeNum(item.icms_aliq, true) + '" type="number" min="0" step="any" placeholder="0">'
      + '<input style="width:100%"  data-field="ipi_aliq"       value="' + danfeNum(item.ipi_aliq, true)  + '" type="number" min="0" step="any" placeholder="0">'
      + '</div>';
  }).join('');

  /* Botões de ação */
  btns.innerHTML = '<div style="margin-top:12px">'
    + '<button class="danfe-btn-primary" onclick="danfeAplicarTodos()">⚡ Aplicar todos à calculadora</button>'
    + '<button class="danfe-btn-sec" onclick="danfeLimpar()">✕ Cancelar</button>'
    + '</div>';

  danfeRenderItens._dados = dados;
  res.style.display = 'block';
}

/* ════════════════════════════════════════
   LÊ CAMPOS EDITADOS
   ════════════════════════════════════════ */
function danfeGetItensEditados() {
  return Array.from(document.querySelectorAll('#danfe-itens-lista .danfe-item-row'))
    .map(function (row) {
      var g = function (f) { var el = row.querySelector('[data-field="' + f + '"]'); return el ? el.value : ''; };
      return {
        descricao:      (g('descricao') || '').trim(),
        quantidade:     parseFloat(g('quantidade'))     || 1,
        valor_unitario: parseFloat(g('valor_unitario')) || 0,
        icms_aliq:      parseFloat(g('icms_aliq'))      || 0,
        ipi_aliq:       parseFloat(g('ipi_aliq'))       || 0
      };
    })
    .filter(function (it) { return it.descricao && it.valor_unitario > 0; });
}

/* ════════════════════════════════════════
   APLICA TODOS OS ITENS
   ════════════════════════════════════════ */
function danfeAplicarTodos() {
  var itens  = danfeGetItensEditados();
  var dados  = danfeRenderItens._dados || {};
  var frete  = parseFloat(dados.frete) || 0;
  var freteUn = itens.length > 0 ? frete / itens.length : 0;

  if (!itens.length) { danfeStatus('err', '⚠️ Nenhum item válido.'); return; }

  var locais = (typeof calcGetLocalProds === 'function') ? calcGetLocalProds() : [];
  var novos  = 0;
  itens.forEach(function (it) {
    var existe = locais.find(function (p) { return p.nome.toLowerCase() === it.descricao.toLowerCase(); });
    if (!existe) {
      locais.unshift({
        id:        'lp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        nome:      it.descricao,
        preco:     0,
        custo:     it.valor_unitario,
        categoria: 'DANFE – ' + ((dados.emitente || '').trim() || 'Importado'),
        estoque:   Math.round(it.quantidade),
        sku:       '',
        unidade:   'un',
        desc:      'NF ' + (dados.nf || '') + ' — ' + (dados.data || ''),
        criado:    new Date().toLocaleDateString('pt-BR')
      });
      novos++;
    }
  });
  if (typeof calcSaveLocalProds === 'function') calcSaveLocalProds(locais);

  var p1  = itens[0];
  var set = function (id, v) { var el = document.getElementById(id); if (el) el.value = v; };
  set('calc-custo-unit',  p1.valor_unitario.toFixed(2));
  set('calc-qtd',         Math.round(p1.quantidade));
  set('calc-custo-total', (p1.valor_unitario * p1.quantidade).toFixed(2));
  set('calc-frete',       freteUn > 0 ? freteUn.toFixed(2) : '');

  if (p1.icms_aliq > 0 || p1.ipi_aliq > 0) {
    var elInc = document.getElementById('calc-icms-inc');
    if (elInc) elInc.value = 'nao';
    var elRow = document.getElementById('calc-icms-row');
    if (elRow) elRow.style.display = 'block';
    set('calc-icms', p1.icms_aliq || '');
    set('calc-ipi',  p1.ipi_aliq  || '');
  }

  if (typeof calcSelecionarProd === 'function') {
    var prod = locais.find(function (lp) { return lp.nome.toLowerCase() === p1.descricao.toLowerCase(); });
    if (prod) calcSelecionarProd(Object.assign({}, prod, { _src: 'local' }));
  }

  if (typeof calcAtualizar  === 'function') calcAtualizar();
  if (typeof calcSyncCusto  === 'function') calcSyncCusto('unit');

  danfeStatus('ok',
    '✅ ' + itens.length + ' item(ns) importado(s).'
    + (novos > 0 ? ' ' + novos + ' produto(s) adicionado(s) ao catálogo.' : ' Duplicatas ignoradas.')
    + ' Calculadora pronta com o 1º item.'
  );

  if (typeof showToast === 'function') showToast('✓ DANFE importada — ' + itens.length + ' itens', 'grn');

  setTimeout(function () {
    var panel = document.getElementById('calcPanel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (itens.length > 1 && typeof calcSwitchTab === 'function') calcSwitchTab('cad');
  }, 400);
}

/* ════════════════════════════════════════
   UTILITÁRIOS
   ════════════════════════════════════════ */
function danfeStatus(tipo, msg) {
  var el = document.getElementById('danfe-status');
  if (!el) return;
  el.className    = 'danfe-status-box ' + tipo;
  el.innerHTML    = msg;
  el.style.display = 'block';
}

function danfeLimpar() {
  var lista = document.getElementById('danfe-itens-lista');
  var btns  = document.getElementById('danfe-itens-btns');
  var res   = document.getElementById('danfe-resultado');
  var s     = document.getElementById('danfe-status');
  var inp   = document.getElementById('danfe-input');
  if (lista) lista.innerHTML = '';
  if (btns)  btns.innerHTML  = '';
  if (res)   res.style.display = 'none';
  if (s)     s.style.display   = 'none';
  if (inp)   inp.value = '';
}

function danfeNumStr(s) {
  if (s === null || s === undefined) return 0;
  var str = String(s).trim();
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(str)) str = str.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(str)) str = str.replace(/,/g, '');
  else str = str.replace(',', '.');
  return parseFloat(str) || 0;
}

function danfePegaValor(t, re) { var m = t.match(re); return m ? m[1].trim() : null; }
function danfePegaNum(t, re)   { var m = t.match(re); return m ? danfeNumStr(m[1]) : 0; }
function danfeFmt(n)  { return parseFloat(n || 0).toFixed(2).replace('.', ','); }
function danfeEsc(s)  { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function danfeNum(v, zeroVazio) { var n = parseFloat(v); if (isNaN(n)) return ''; if (zeroVazio && n === 0) return ''; return n; }
