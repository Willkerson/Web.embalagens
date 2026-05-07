/* admin-core.js — Lógica principal: produtos, estoque, filtros, render de cards */
'use strict';

var stkAjusteId = null, alertaIntervalId = null;
var indexHtmlContent = localStorage.getItem(K.IDXHTML) || '';
var indexSha = localStorage.getItem(K.IDXSHA) || null;
var filtroVis = 'todos', filtroCatId = '', filtroSubId = '';
var prodsFiltrados = [], deletePendente = null;
var spActiveCatId = null, spAddSubOpen = false;

/* ── UI helpers ── */
function markUnsaved() {
  var el = document.getElementById('pill-unsaved');
  el.style.display = 'inline-flex'; el.classList.add('warn');
}
function markSaved() { document.getElementById('pill-unsaved').style.display = 'none'; }

/* ── Labels ── */
function catLabel(id)     { var c = cats.find(function(x){return x.id===id;}); return c ? c.label : id; }
function subLabel(id)     { if(subLabels[id]) return subLabels[id]; var s = subs.find(function(x){return x.id===id;}); return s ? s.label : id; }
function catEmoji(id)     { var c = cats.find(function(x){return x.id===id;}); return c ? c.label.split(' ')[0] : '📦'; }
function catLabelText(id) { var c = cats.find(function(x){return x.id===id;}); return c ? c.label.replace(/^\S+\s/,'') : id; }

/* ── Dados de produto ── */
function prods() {
  var base = (window.listaProdutosPlanilha || []).filter(function(p){ return !deletados.has(p.id); });
  return base.concat(novosProd.filter(function(p){ return !deletados.has(p.id); }));
}
function getProd(p) {
  var ed = edicoes[p.id] || {};
  return {
    id:p.id,
    nome:        ed.nome         !== undefined ? ed.nome         : (p.nome||''),
    categoria:   ed.categoria    !== undefined ? ed.categoria    : (p.categoria||'diversos'),
    subcategoria:ed.subcategoria !== undefined ? ed.subcategoria : (p.subcategoria||'outros'),
    preco:       ed.preco        !== undefined ? ed.preco        : (parseFloat(p.preco)||0),
    unidade:     ed.unidade      !== undefined ? ed.unidade      : (p.unidade||'/unidade'),
    marca:       ed.marca        !== undefined ? ed.marca        : (p.marca||''),
    imagem:      ed.imagem       !== undefined ? ed.imagem       : (p.imagem||''),
    imgmode:     ed.imgmode      !== undefined ? ed.imgmode      : (p.imgmode||'thumbnail'),
    oculto:      ocultos.has(p.id),
    esgotado:    esgotados.has(p.id)
  };
}
function getOrig(id) {
  return (window.listaProdutosPlanilha||[]).find(function(x){return x.id===id;})
    || novosProd.find(function(x){return x.id===id;});
}

function setEd(id, campo, val) {
  var orig = getOrig(id); if(!orig) return;
  var ov = orig[campo] !== undefined ? orig[campo] : '';
  var igual = campo === 'preco' ? parseFloat(val) === parseFloat(ov) : String(val) === String(ov);
  if(igual) {
    if(edicoes[id]) { delete edicoes[id][campo]; if(!Object.keys(edicoes[id]).length) delete edicoes[id]; }
  } else {
    if(!edicoes[id]) edicoes[id] = {}; edicoes[id][campo] = val;
  }
  savE(); markUnsaved(); refreshCard(id); stats();
}

function refreshCard(id) {
  var card = document.getElementById('pc-'+id); if(!card) return;
  var vis = !ocultos.has(id), esg = esgotados.has(id);
  var isEd = !!edicoes[id] || !!novosProd.find(function(x){return x.id===id;});
  var st = getStkStatus(id);
  card.className = 'pcard'+(vis?' vis':' hid')+(esg?' esg':'')+(isEd?' edited':'')
    +(st==='low'?' stk-low':'')+(st==='out'?' stk-out':'');
  var tog = card.querySelector('.pc-tog'); if(tog) tog.className = 'pc-tog '+(vis?'on':'off');
  var et  = card.querySelector('.esg-tog'); if(et) et.className = 'esg-tog '+(esg?'on':'off');
  var nm  = card.querySelector('.pc-name'); if(nm) nm.classList.toggle('dim', !vis);
  var eb  = card.querySelector('.pc-btn-notify'); if(eb) eb.style.display = esg ? 'flex' : 'none';
}

/* ── Estoque ── */
function getStkQty(id)  { return estoque[id] !== undefined && estoque[id].qty !== undefined ? estoque[id].qty : null; }
function getStkMin(id)  { return estoque[id] ? estoque[id].min || 0 : 0; }
function getStkStatus(id) {
  var qty = getStkQty(id); if(qty === null) return 'none';
  if(qty <= 0) return 'out';
  var min = getStkMin(id);
  return (min > 0 && qty <= min) ? 'low' : 'ok';
}
function getStkPct(id) {
  var qty = getStkQty(id); if(qty === null) return 0;
  var min = getStkMin(id) || 10; var ref = min * 3 || 30;
  return Math.min(100, Math.round((qty / ref) * 100));
}
function getStkColor(status) {
  if(status === 'out') return 'var(--red)';
  if(status === 'low') return 'var(--amb)';
  if(status === 'ok')  return 'var(--grn)';
  return 'var(--bdr2)';
}

function registrarHist(id, nome, tipo, qtyAntes, qtyDepois, obs) {
  stkHist.unshift({id:id,nome:nome,tipo:tipo,delta:qtyDepois-qtyAntes,qtyAntes:qtyAntes,qtyDepois:qtyDepois,obs:obs||'',ts:Date.now()});
  savStkHist();
}

function aplicarAjusteEstoque(id, novaQty, novoMin, tipo, obs) {
  var prod = prods().find(function(p){return p.id===id;});
  var nomeProd = prod ? getProd(prod).nome : '#'+id;
  var qtyAntes = getStkQty(id) !== null ? getStkQty(id) : 0;
  if(!estoque[id]) estoque[id] = {qty:0, min:0};
  estoque[id].qty = Math.max(0, novaQty);
  if(novoMin >= 0) estoque[id].min = novoMin;
  savStk(); markUnsaved();
  registrarHist(id, nomeProd, tipo, qtyAntes, estoque[id].qty, obs);
  if(estoque[id].qty === 0 && !esgotados.has(id)) { esgotados.add(id); savEsg(); showToast('⚠ Estoque zerado — marcado esgotado','org'); }
  else if(estoque[id].qty > 0 && esgotados.has(id)) { esgotados.delete(id); savEsg(); showToast('✓ Estoque reposto — produto reativado','grn'); }
  refreshCard(id); atualizarBarraEstoque(id); painelStkRender(); verificarAlertasEstoque();
}

function atualizarBarraEstoque(id) {
  var row = document.getElementById('stk-row-'+id); if(!row) return;
  var status = getStkStatus(id), qty = getStkQty(id), min = getStkMin(id), pct = getStkPct(id);
  row.className = 'stk-row '+status;
  var bar  = row.querySelector('.stk-bar');
  var stEl = row.querySelector('.stk-st');
  var iQ   = row.querySelector('.stk-inp');
  var iM   = row.querySelector('.stk-min-inp');
  if(bar)  { bar.style.width = pct+'%'; bar.style.background = getStkColor(status); }
  if(stEl) {
    stEl.className = 'stk-st '+(status==='none'?'none':status);
    stEl.textContent = status==='out'?'🔴 Zerado':status==='low'?'⚠ Crítico':status==='ok'?'✅ OK':'';
    stEl.style.display = status==='none' ? 'none' : '';
  }
  if(iQ && qty !== null) iQ.value = qty;
  if(iM) iM.value = min || '';
}

/* ── Alertas ── */
function verificarAlertasEstoque() {
  var criticos = prods().filter(function(p){ var st=getStkStatus(p.id); return st==='out'||st==='low'; });
  var banner = document.getElementById('alertCritico');
  if(!criticos.length) { banner.classList.remove('on'); return; }
  document.getElementById('alertTitle').textContent = '🚨 '+criticos.length+' produto(s) com estoque crítico!';
  var linhas = criticos.slice(0,4).map(function(p){
    var ep = getProd(p); var st = getStkStatus(p.id);
    return (st==='out'?'🔴':'⚠️')+' '+ep.nome+' ('+getStkQty(p.id)+')';
  });
  if(criticos.length > 4) linhas.push('... e mais '+(criticos.length-4));
  document.getElementById('alertList').textContent = linhas.join(' • ');
  banner.classList.add('on');
}

function dispararWppCriticos() {
  var criticos = prods().filter(function(p){ var st=getStkStatus(p.id); return st==='out'||st==='low'; });
  if(!criticos.length) { showToast('Nenhum produto crítico','amb'); return; }
  var d = new Date().toLocaleDateString('pt-BR')+' '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  var linhas = criticos.map(function(p){
    var ep=getProd(p); var st=getStkStatus(p.id);
    return (st==='out'?'🔴 ZERADO':'⚠️ CRÍTICO')+': '+ep.nome+'\n   Estoque: '+getStkQty(p.id)+(getStkMin(p.id)?' (mín: '+getStkMin(p.id)+')':'');
  }).join('\n\n');
  var num = wppCfg.num || WPP_NUM;
  window.open('https://wa.me/'+num+'?text='+encodeURIComponent('🚨 *ALERTA DE ESTOQUE — Cia Das Embalagens*\n📅 '+d+'\n\n'+linhas+'\n\n⚡ _Solicitar reposição urgente!_'),'_blank');
}

function iniciarMonitoramento() {
  if(alertaIntervalId) clearInterval(alertaIntervalId);
  if(!wppCfg.enabled) return;
  verificarAlertasEstoque();
  alertaIntervalId = setInterval(verificarAlertasEstoque, (wppCfg.interval||15)*60*1000);
}

/* ── Geração JS ── */
function gerarJS() {
  var lista = prods();
  var lines = ['window.listaProdutosPlanilha = ['];
  lista.forEach(function(p, i) {
    var ep = getProd(p), comma = i < lista.length-1 ? ',' : '';
    var obj = {id:ep.id,nome:ep.nome,categoria:ep.categoria,subcategoria:ep.subcategoria,preco:ep.preco,unidade:ep.unidade};
    if(ep.marca) obj.marca = ep.marca;
    if(ep.imagem) { obj.imagem = ep.imagem; obj.imgmode = ep.imgmode || 'thumbnail'; }
    if(ep.oculto) obj.oculto = true;
    if(ep.esgotado) obj.esgotado = true;
    if(estoque[ep.id] && estoque[ep.id].qty !== undefined) { obj.qty = estoque[ep.id].qty; if(estoque[ep.id].min) obj.estoqueMin = estoque[ep.id].min; }
    lines.push('  '+JSON.stringify(obj)+comma);
  });
  lines.push('];'); return lines.join('\n');
}

/* ── HTML submenus ── */
function gerarSubtabsParaCat(catId) {
  var subIds = catMap[catId] || []; if(!subIds.length) return '';
  var btns = ['<button class="stab on" onclick="filtrarSub(\'todas\',this,\''+catId+'\')">Todas</button>'];
  subIds.forEach(function(sid){ btns.push('<button class="stab" onclick="filtrarSub(\''+sid+'\',this,\''+catId+'\')">'+subLabel(sid)+'</button>'); });
  return '<div class="subtabs" id="sub-'+catId+'">'+btns.join('')+'</div>';
}
function gerarSubtabsCompleto() {
  var linhas = ['<div class="subtabs-wrap">'];
  cats.forEach(function(cat){ var s=gerarSubtabsParaCat(cat.id); if(s) linhas.push('  '+s); });
  linhas.push('</div>'); return linhas.join('\n');
}
function gerarCatMapJS() {
  var lines = ['var catMap = {'];
  var keys = Object.keys(catMap);
  keys.forEach(function(k,i){ var vals=catMap[k].map(function(v){return"'"+v+"'";}).join(', '); lines.push('  '+k+': ['+vals+']'+(i<keys.length-1?',':'')); });
  lines.push('};'); return lines.join('\n');
}
function gerarSubLabelsJS() {
  var pairs = Object.keys(subLabels).map(function(k){ return"  '"+k+"': '"+subLabels[k]+"'"; });
  return 'var subLabels = {\n'+pairs.join(',\n')+'\n};';
}
function aplicarTudoNoHTML(txt) {
  var reCatMap = /var catMap\s*=\s*\{[\s\S]*?\};/;
  if(reCatMap.test(txt)) txt = txt.replace(reCatMap, gerarCatMapJS());
  var reSubLabels = /var subLabels\s*=\s*\{[\s\S]*?\};/;
  if(reSubLabels.test(txt)) txt = txt.replace(reSubLabels, gerarSubLabelsJS());
  var novoSubtabs = gerarSubtabsCompleto();
  var reMarcador = /<!--\s*SUBTABS-START\s*-->[\s\S]*?<!--\s*SUBTABS-END\s*-->/;
  if(reMarcador.test(txt)) return txt.replace(reMarcador,'<!-- SUBTABS-START -->\n'+novoSubtabs+'\n<!-- SUBTABS-END -->');
  var idxStart = txt.indexOf('<div class="subtabs-wrap"');
  if(idxStart >= 0) {
    var pos = idxStart, depth = 0;
    while(pos < txt.length) {
      var nO = txt.indexOf('<div', pos+1), nC = txt.indexOf('</div>', pos);
      if(nC < 0) break;
      if(nO >= 0 && nO < nC) { depth++; pos = nO; }
      else { if(depth === 0) { txt = txt.substring(0,idxStart)+novoSubtabs+txt.substring(nC+6); break; } depth--; pos = nC+1; }
    }
  }
  return txt;
}

/* ── Filtros e stats ── */
function stats() {
  var total = prods().length, hid = prods().filter(function(p){return ocultos.has(p.id);}).length;
  var ed = Object.keys(edicoes).length + novosProd.length, esg = esgotados.size;
  document.getElementById('st-total').textContent = total;
  document.getElementById('st-vis').textContent   = total-hid;
  document.getElementById('st-hid').textContent   = hid;
  document.getElementById('st-edit').textContent  = ed;
  document.getElementById('st-esg').textContent   = esg;
  document.getElementById('st-filt').textContent  = prodsFiltrados.length;
  var tc = document.getElementById('toolbar-count'); if(tc) tc.textContent = prodsFiltrados.length+' produto(s)';
  ['todos','vis','hid','edit','esg'].forEach(function(k){
    var el = document.getElementById('fb-'+k);
    if(el) el.textContent = k==='todos'?total:k==='vis'?total-hid:k==='hid'?hid:k==='edit'?ed:esg;
  });
}

function renderCatFilters() {
  var box = document.getElementById('cat-filters'); box.innerHTML = '';
  var btn0 = document.createElement('button');
  btn0.className = 'fbtn'+(filtroCatId===''?' on':''); btn0.dataset.cat = '';
  btn0.innerHTML = 'Todas <span class="fbadge">'+prods().length+'</span>';
  btn0.addEventListener('click', function(){ filtroCatId=''; filtroSubId=''; renderizar(); renderCatFilters(); popularSubSel(); });
  box.appendChild(btn0);
  var sep = document.createElement('div'); sep.className = 'fsep'; box.appendChild(sep);
  cats.forEach(function(c){
    var count = prods().filter(function(p){ var ep=getProd(p); return ep.categoria===c.id; }).length;
    if(!count) return;
    var btn = document.createElement('button');
    btn.className = 'fbtn'+(filtroCatId===c.id?' on':''); btn.dataset.cat = c.id;
    btn.innerHTML = c.label+' <span class="fbadge">'+count+'</span>';
    btn.addEventListener('click', function(){ filtroCatId=c.id; filtroSubId=''; renderizar(); renderCatFilters(); popularSubSel(); });
    box.appendChild(btn);
  });
}

function popularSubSel() {
  var ss = document.getElementById('filtroSub');
  ss.innerHTML = '<option value="">Todas as subcategorias</option>';
  subs.filter(function(s){ return !filtroCatId || s.catId===filtroCatId; }).forEach(function(s){
    var n = prods().filter(function(p){ var ep=getProd(p); return ep.subcategoria===s.id; }).length;
    if(!n) return;
    var o = document.createElement('option'); o.value = s.id;
    o.textContent = s.label+' ('+n+')';
    if(filtroSubId === s.id) o.selected = true;
    ss.appendChild(o);
  });
}

function getLista() {
  var busca = document.getElementById('busca').value.toLowerCase();
  return prods().filter(function(p){
    var ep = getProd(p);
    if(busca && !ep.nome.toLowerCase().includes(busca)) return false;
    if(filtroCatId && ep.categoria !== filtroCatId) return false;
    if(filtroSubId && ep.subcategoria !== filtroSubId) return false;
    if(filtroVis==='vis'  && ocultos.has(p.id)) return false;
    if(filtroVis==='hid'  && !ocultos.has(p.id)) return false;
    if(filtroVis==='edit' && !edicoes[p.id] && !novosProd.find(function(x){return x.id===p.id;})) return false;
    if(filtroVis==='esg'  && !esgotados.has(p.id)) return false;
    return true;
  });
}

function toggle(id)    { if(ocultos.has(id)) ocultos.delete(id); else ocultos.add(id); savO(); markUnsaved(); refreshCard(id); stats(); }
function toggleEsg(id) {
  if(esgotados.has(id)) esgotados.delete(id); else esgotados.add(id);
  savEsg(); markUnsaved(); refreshCard(id); stats(); painelEsg();
  showToast(esgotados.has(id)?'⚠ Marcado esgotado':'✓ Produto reativado', esgotados.has(id)?'org':'grn');
}

/* ── Imagem ── */
function buildImgPrev(id, url, mode) {
  var box = document.getElementById('imgprev-'+id); if(!box) return;
  box.innerHTML = '';
  if(url) {
    var lbl = document.createElement('span'); lbl.className = 'img-mode-lbl '+(mode||'thumbnail'); lbl.textContent = mode||'thumbnail'; box.appendChild(lbl);
    var img = document.createElement('img'); img.src = url; img.alt = '';
    img.onerror = function(){ box.innerHTML = '<div class="img-empty"><span>⚠️</span><p>URL inválida</p></div>'; };
    box.appendChild(img);
  } else { box.innerHTML = '<div class="img-empty"><span>🖼</span><p>Sem imagem</p></div>'; }
}
function onImgChange(id, url) { setEd(id,'imagem',url.trim()); var ep=getProd(getOrig(id)||{id:id}); buildImgPrev(id,url.trim(),ep.imgmode); }
function onImgMode(id, mode) {
  setEd(id,'imgmode',mode);
  var lbl = document.querySelector('#imgprev-'+id+' .img-mode-lbl'); if(lbl){ lbl.className='img-mode-lbl '+mode; lbl.textContent=mode; }
  var bt=document.getElementById('ibt-t-'+id), br=document.getElementById('ibt-r-'+id);
  if(bt) bt.classList.toggle('on', mode==='thumbnail');
  if(br) br.classList.toggle('on', mode==='replace');
}
function limparImg(id) {
  setEd(id,'imagem',''); setEd(id,'imgmode','thumbnail');
  var inp = document.getElementById('img-inp-'+id); if(inp) inp.value='';
  buildImgPrev(id,'','thumbnail');
}

/* ── Delete ── */
function pedirDelete(id) {
  deletePendente = id;
  var p = prods().find(function(x){return x.id===id;});
  document.getElementById('confirm-nome').textContent = p ? '"'+getProd(p).nome+'"' : 'este produto';
  abrirModal('modalConfirmar');
}
function confirmarDelete() {
  if(deletePendente === null) return;
  var id = deletePendente; deletePendente = null;
  deletados.add(id); savD();
  novosProd = novosProd.filter(function(p){return p.id!==id;}); savN();
  if(edicoes[id]) { delete edicoes[id]; savE(); }
  ocultos.delete(id); savO(); esgotados.delete(id); savEsg();
  markUnsaved();
  var card = document.getElementById('pc-'+id);
  if(card) {
    card.style.transition = 'opacity .22s,transform .22s'; card.style.opacity='0'; card.style.transform='scale(.94)';
    setTimeout(function(){
      if(card.parentNode){ var grid=card.parentNode; card.remove(); if(grid.querySelectorAll('.pcard').length===0){ var g2=grid.closest('.cat-group'); if(g2) g2.remove(); } }
    },240);
  }
  fecharModais(); stats(); painelEsg(); showToast('🗑 Produto deletado','red');
}

function toggleGrupo(catId, subId) {
  var lista = prods().filter(function(p){ var ep=getProd(p); return ep.categoria===catId&&ep.subcategoria===subId; });
  var todosV = lista.every(function(p){return !ocultos.has(p.id);});
  lista.forEach(function(p){ if(todosV) ocultos.add(p.id); else ocultos.delete(p.id); refreshCard(p.id); });
  savO(); markUnsaved(); stats();
}

/* ── Render principal ── */
function renderizar() {
  var lista = getLista(); prodsFiltrados = lista; stats(); painelEsg();
  var c = document.getElementById('container'); c.innerHTML = '';
  if(!lista.length) { c.innerHTML = '<div class="empty"><div class="empty-ico">🔍</div>Nenhum produto encontrado.</div>'; return; }
  var grupos = {};
  lista.forEach(function(p){ var ep=getProd(p); var k=ep.categoria+'||'+ep.subcategoria; if(!grupos[k]) grupos[k]={cat:ep.categoria,sub:ep.subcategoria,itens:[]}; grupos[k].itens.push(p); });
  Object.keys(grupos).sort().forEach(function(k){
    var g = grupos[k];
    var visC = g.itens.filter(function(p){return !ocultos.has(p.id);}).length;
    var hidC = g.itens.length - visC;
    var esgC = g.itens.filter(function(p){return esgotados.has(p.id);}).length;
    var sec = document.createElement('div'); sec.className = 'cat-group';
    var hdr = document.createElement('div'); hdr.className = 'cat-hdr';
    var emo = document.createElement('div'); emo.className = 'cat-emo'; emo.textContent = catEmoji(g.cat);
    var info = document.createElement('div'); info.className = 'cat-info';
    info.innerHTML = '<div class="cat-title">'+catLabel(g.cat).replace(/^\S+\s/,'')+'</div><div class="cat-sub">→ '+subLabel(g.sub)+'</div>';
    var pills = document.createElement('div'); pills.className = 'cat-pills';
    pills.innerHTML = (visC?'<span class="cp cp-v">'+visC+' vis.</span>':'')+(hidC?'<span class="cp cp-h">'+hidC+' ocult.</span>':'')+(esgC?'<span class="cp cp-e">⚠ '+esgC+'</span>':'');
    var altBtn = document.createElement('button'); altBtn.className = 'alt-btn'; altBtn.textContent = 'Alternar';
    altBtn.addEventListener('click', function(){ toggleGrupo(g.cat,g.sub); });
    pills.appendChild(altBtn);
    hdr.appendChild(emo); hdr.appendChild(info); hdr.appendChild(pills);
    var grid = document.createElement('div'); grid.className = 'pgrid';
    g.itens.forEach(function(p,i){ grid.appendChild(criarCard(p,getProd(p),i)); });
    sec.appendChild(hdr); sec.appendChild(grid); c.appendChild(sec);
  });
}

/* ── Criar card ── */
function criarCard(p, ep, idx) {
  var vis = !ep.oculto, esg = ep.esgotado;
  var isEd = !!edicoes[p.id] || !!novosProd.find(function(x){return x.id===p.id;});
  var st = getStkStatus(p.id);
  var card = document.createElement('div');
  card.className = 'pcard'+(vis?' vis':' hid')+(esg?' esg':'')+(isEd?' edited':'')+(st==='low'?' stk-low':'')+(st==='out'?' stk-out':'');
  card.id = 'pc-'+p.id;

  /* Toggle visibilidade */
  var top = document.createElement('div'); top.className = 'pc-top';
  var tog = document.createElement('div'); tog.className = 'pc-tog '+(vis?'on':'off'); tog.dataset.id = p.id;
  tog.addEventListener('click', function(){ toggle(parseInt(this.dataset.id)); });
  var nw = document.createElement('div'); nw.className = 'pc-name-wrap';
  var nta = document.createElement('textarea'); nta.className = 'pc-name'+(vis?'':' dim');
  nta.rows = 2; nta.value = ep.nome; nta.dataset.id = p.id;
  nta.addEventListener('input', function(){ this.style.height='auto'; this.style.height=this.scrollHeight+'px'; });
  nta.addEventListener('change', function(){ setEd(parseInt(this.dataset.id),'nome',this.value.trim()); });
  nw.appendChild(nta);
  var edDot = document.createElement('span'); edDot.className = 'edit-dot';
  top.appendChild(tog); top.appendChild(nw); top.appendChild(edDot);
  card.appendChild(top);

  /* Toggle esgotado */
  var er = document.createElement('div'); er.className = 'esg-row';
  var el2 = document.createElement('span'); el2.className = 'esg-lbl'; el2.textContent = 'Esgotado';
  var eb2 = document.createElement('span'); eb2.className = 'esg-badge-pill'; eb2.textContent = '⚠ ESGOTADO';
  var et = document.createElement('div'); et.className = 'esg-tog '+(esg?'on':'off'); et.dataset.id = p.id;
  et.addEventListener('click', function(){ toggleEsg(parseInt(this.dataset.id)); });
  er.appendChild(el2); er.appendChild(eb2); er.appendChild(et);
  card.appendChild(er);

  /* Imagem */
  var is2 = document.createElement('div'); is2.className = 'img-sec';
  var ip  = document.createElement('div'); ip.className = 'img-prev'; ip.id = 'imgprev-'+p.id;
  is2.appendChild(ip);
  var ic = document.createElement('div'); ic.className = 'img-ctrl';
  var ii = document.createElement('input'); ii.type='url'; ii.className='img-url'; ii.id='img-inp-'+p.id;
  ii.placeholder='https://link-da-imagem.jpg'; ii.value=ep.imagem||''; ii.dataset.id=p.id;
  ii.addEventListener('change', function(){ onImgChange(parseInt(this.dataset.id),this.value); });
  var mt = document.createElement('div'); mt.className = 'img-mtog';
  var bT = document.createElement('button'); bT.className='img-mbtn'+((!ep.imagem||ep.imgmode==='thumbnail')?' on':'');
  bT.id='ibt-t-'+p.id; bT.dataset.id=p.id; bT.dataset.mode='thumbnail'; bT.textContent='thumb';
  bT.addEventListener('click', function(){ onImgMode(parseInt(this.dataset.id),this.dataset.mode); });
  var bR = document.createElement('button'); bR.className='img-mbtn'+((ep.imagem&&ep.imgmode==='replace')?' on':'');
  bR.id='ibt-r-'+p.id; bR.dataset.id=p.id; bR.dataset.mode='replace'; bR.textContent='replace';
  bR.addEventListener('click', function(){ onImgMode(parseInt(this.dataset.id),this.dataset.mode); });
  mt.appendChild(bT); mt.appendChild(bR);
  var clr = document.createElement('div'); clr.className='img-clr'; clr.textContent='✕'; clr.dataset.id=p.id;
  clr.addEventListener('click', function(){ limparImg(parseInt(this.dataset.id)); });
  ic.appendChild(ii); ic.appendChild(mt); ic.appendChild(clr);
  is2.appendChild(ic); card.appendChild(is2);
  buildImgPrev(p.id, ep.imagem, ep.imgmode);

  /* Preço */
  var pr = document.createElement('div'); pr.className = 'price-row';
  var pb = document.createElement('div'); pb.className = 'price-box';
  var pfx = document.createElement('span'); pfx.className='price-pfx'; pfx.textContent='R$';
  var pi = document.createElement('input'); pi.type='text'; pi.inputMode='decimal'; pi.className='price-inp';
  pi.placeholder='0,00'; pi.value=ep.preco>0?String(ep.preco).replace('.',','):''; pi.dataset.id=p.id;
  pi.addEventListener('change', function(){ var n=parseFloat(this.value.replace(',','.')); if(!isNaN(n)) setEd(parseInt(this.dataset.id),'preco',Math.round(n*100)/100); });
  pb.appendChild(pfx); pb.appendChild(pi);
  var ui = document.createElement('input'); ui.type='text'; ui.className='unit-inp';
  ui.placeholder='/unidade'; ui.value=ep.unidade; ui.dataset.id=p.id;
  ui.addEventListener('change', function(){ setEd(parseInt(this.dataset.id),'unidade',this.value.trim()); });
  pr.appendChild(pb); pr.appendChild(ui); card.appendChild(pr);

  /* Marca */
  var br2 = document.createElement('div'); br2.className='brand-row';
  var bi  = document.createElement('span'); bi.className='brand-ico'; bi.textContent='🏷️';
  var bni = document.createElement('input'); bni.type='text'; bni.className='brand-inp';
  bni.placeholder='Marca...'; bni.value=ep.marca; bni.dataset.id=p.id;
  bni.addEventListener('change', function(){ setEd(parseInt(this.dataset.id),'marca',this.value.trim()); });
  br2.appendChild(bi); br2.appendChild(bni); card.appendChild(br2);

  /* Categoria/Subcategoria */
  var cr = document.createElement('div'); cr.className='cat-row';
  var cs = document.createElement('select'); cs.className='cat-sel'; cs.id='csel-'+p.id; cs.dataset.id=p.id;
  cats.forEach(function(cv){ var o=document.createElement('option'); o.value=cv.id; o.textContent=cv.label.replace(/^\S+\s/,''); if(ep.categoria===cv.id) o.selected=true; cs.appendChild(o); });
  cs.addEventListener('change', function(){
    var id2=parseInt(this.dataset.id); setEd(id2,'categoria',this.value);
    var catSubs=subs.filter(function(s){return s.catId===this.value;}.bind(this));
    if(catSubs.length) setEd(id2,'subcategoria',catSubs[0].id);
    var ss2=document.getElementById('ssel-'+id2);
    if(ss2){ ss2.innerHTML=''; catSubs.forEach(function(s){ var o=document.createElement('option'); o.value=s.id; o.textContent=s.label; ss2.appendChild(o); }); if(catSubs.length) ss2.value=catSubs[0].id; }
  });
  var ss3 = document.createElement('select'); ss3.className='cat-sel'; ss3.id='ssel-'+p.id; ss3.dataset.id=p.id;
  subs.filter(function(s){return s.catId===ep.categoria;}).forEach(function(s){ var o=document.createElement('option'); o.value=s.id; o.textContent=s.label; if(ep.subcategoria===s.id) o.selected=true; ss3.appendChild(o); });
  ss3.addEventListener('change', function(){ setEd(parseInt(this.dataset.id),'subcategoria',this.value); });
  cr.appendChild(cs); cr.appendChild(ss3); card.appendChild(cr);

  /* Ações */
  var ac  = document.createElement('div'); ac.className='pc-actions';
  var emb = document.createElement('button'); emb.className='pc-btn pc-btn-notify'; emb.textContent='📧 Notificar';
  emb.style.display=esg?'flex':'none'; emb.dataset.id=p.id;
  emb.addEventListener('click', function(){ var pp=prods().find(function(x){return x.id===parseInt(this.dataset.id);}.bind(this)); if(pp) abrirEmailModal([getProd(pp)]); });
  var db = document.createElement('button'); db.className='pc-btn pc-btn-del'; db.textContent='🗑 Deletar'; db.dataset.id=p.id;
  db.addEventListener('click', function(){ pedirDelete(parseInt(this.dataset.id)); });
  ac.appendChild(emb); ac.appendChild(db); card.appendChild(ac);

  /* Estoque */
  var status=getStkStatus(p.id),qty=getStkQty(p.id),min=getStkMin(p.id),pct=getStkPct(p.id);
  var stkRow=document.createElement('div'); stkRow.className='stk-row '+status; stkRow.id='stk-row-'+p.id;
  var stkIco=document.createElement('span'); stkIco.className='stk-ico'; stkIco.textContent='📦';
  var stkLbl=document.createElement('span'); stkLbl.className='stk-lbl'; stkLbl.textContent='Qtd:';
  var stkIQ=document.createElement('input'); stkIQ.type='number'; stkIQ.className='stk-inp'; stkIQ.min='0'; stkIQ.placeholder='—'; stkIQ.dataset.id=p.id;
  if(qty!==null) stkIQ.value=qty;
  var stkSep=document.createElement('span'); stkSep.className='stk-sep'; stkSep.textContent='/';
  var stkLblM=document.createElement('span'); stkLblM.className='stk-lbl'; stkLblM.textContent='mín:';
  var stkIM=document.createElement('input'); stkIM.type='number'; stkIM.className='stk-min-inp'; stkIM.min='0'; stkIM.placeholder='0'; stkIM.dataset.id=p.id;
  if(min) stkIM.value=min;
  var stkBW=document.createElement('div'); stkBW.className='stk-bar-wrap';
  var stkB=document.createElement('div'); stkB.className='stk-bar'; stkB.style.width=pct+'%'; stkB.style.background=getStkColor(status);
  stkBW.appendChild(stkB);
  var stkSt=document.createElement('span'); stkSt.className='stk-st '+(status==='none'?'none':status);
  stkSt.textContent=status==='out'?'🔴 Zerado':status==='low'?'⚠ Crítico':status==='ok'?'✅ OK':'';
  if(status==='none') stkSt.style.display='none';
  var stkAdj=document.createElement('button'); stkAdj.className='stk-adj'; stkAdj.textContent='✎'; stkAdj.title='Ajuste rápido'; stkAdj.dataset.id=p.id;
  stkAdj.addEventListener('click', function(){ abrirStkAjuste(parseInt(this.dataset.id)); });
  stkIQ.addEventListener('change', function(){
    var id2=parseInt(this.dataset.id); var novaQty=parseInt(this.value); if(isNaN(novaQty)||novaQty<0) return;
    var novoMin=parseInt(document.querySelector('#stk-row-'+id2+' .stk-min-inp').value)||getStkMin(id2);
    aplicarAjusteEstoque(id2,novaQty,novoMin,'ajuste','Edição direta no card');
  });
  stkIM.addEventListener('change', function(){
    var id2=parseInt(this.dataset.id); var novoMin=parseInt(this.value)||0;
    if(!estoque[id2]) estoque[id2]={qty:0,min:0};
    estoque[id2].min=novoMin; savStk(); atualizarBarraEstoque(id2); painelStkRender(); verificarAlertasEstoque();
  });
  stkRow.appendChild(stkIco); stkRow.appendChild(stkLbl); stkRow.appendChild(stkIQ); stkRow.appendChild(stkSep);
  stkRow.appendChild(stkLblM); stkRow.appendChild(stkIM); stkRow.appendChild(stkBW); stkRow.appendChild(stkSt); stkRow.appendChild(stkAdj);
  card.appendChild(stkRow);

  card.style.opacity='0'; card.style.transform='translateY(4px)';
  setTimeout(function(){ card.style.transition='opacity .2s,transform .2s'; card.style.opacity=''; card.style.transform=''; }, idx*4);
  return card;
}

/* ── Painel esgotados ── */
function painelEsg() {
  var lista = prods().filter(function(p){return esgotados.has(p.id);});
  document.getElementById('esgCount').textContent = lista.length;
  var el = document.getElementById('esgList'); el.innerHTML = '';
  if(!lista.length){ el.innerHTML='<div style="padding:1rem;text-align:center;color:var(--t3);font-size:.8rem">Nenhum produto esgotado 🎉</div>'; return; }
  lista.forEach(function(p){
    var ep = getProd(p);
    var item=document.createElement('div'); item.className='esg-item';
    var info=document.createElement('div'); info.style.flex='1'; info.style.minWidth='0';
    info.innerHTML='<div class="esg-nome">'+ep.nome+'</div><div class="esg-meta">'+(ep.marca?ep.marca+' · ':'')+subLabel(ep.subcategoria)+'</div>';
    var wbtn=document.createElement('button'); wbtn.className='btn btn-wpp btn-xs'; wbtn.textContent='💬';
    wbtn.addEventListener('click', function(){ enviarWppEsgotado([ep]); });
    var eb3=document.createElement('button'); eb3.className='btn btn-org btn-xs'; eb3.textContent='📧';
    eb3.addEventListener('click', function(){ abrirEmailModal([ep]); });
    var rb=document.createElement('button'); rb.className='btn btn-grn btn-xs'; rb.textContent='✓ Reativar';
    rb.addEventListener('click', function(){ esgotados.delete(p.id); savEsg(); markUnsaved(); refreshCard(p.id); stats(); painelEsg(); showToast('✓ Reativado','grn'); });
    item.appendChild(info); item.appendChild(wbtn); item.appendChild(eb3); item.appendChild(rb);
    el.appendChild(item);
  });
}

/* ── Painel estoque ── */
function painelStkRender() {
  var lista = prods().filter(function(p){return getStkQty(p.id)!==null;});
  var out   = lista.filter(function(p){return getStkStatus(p.id)==='out';});
  var low   = lista.filter(function(p){return getStkStatus(p.id)==='low';});
  var ok    = lista.filter(function(p){return getStkStatus(p.id)==='ok';});
  var none  = prods().filter(function(p){return getStkStatus(p.id)==='none';});
  document.getElementById('stk-sum-out').textContent  = out.length;
  document.getElementById('stk-sum-low').textContent  = low.length;
  document.getElementById('stk-sum-ok').textContent   = ok.length;
  document.getElementById('stk-sum-none').textContent = none.length;

  var criticos = out.concat(low).sort(function(a,b){return getStkQty(a.id)-getStkQty(b.id);});
  var tbC = document.querySelector('#stk-table-criticos tbody');
  var emptyEl = document.getElementById('stk-criticos-empty');
  if(tbC){
    tbC.innerHTML='';
    if(!criticos.length){ document.getElementById('stk-table-criticos').style.display='none'; emptyEl.style.display='block'; }
    else {
      document.getElementById('stk-table-criticos').style.display=''; emptyEl.style.display='none';
      criticos.forEach(function(p){
        var ep=getProd(p),st=getStkStatus(p.id),qty=getStkQty(p.id),min=getStkMin(p.id);
        var tr=document.createElement('tr');
        tr.innerHTML='<td><div style="font-weight:600;font-size:.78rem;color:var(--t1)">'+ep.nome+'</div><div style="font-size:.64rem;color:var(--t3)">'+subLabel(ep.subcategoria)+'</div></td>'
          +'<td><span style="font-family:var(--mono);font-weight:700;color:'+(st==='out'?'var(--red)':'var(--amb)')+'">'+qty+'</span></td>'
          +'<td><span style="font-family:var(--mono);color:var(--t3)">'+min+'</span></td>'
          +'<td><span class="stk-badge '+st+'">'+(st==='out'?'🔴 Zerado':'⚠ Crítico')+'</span></td>'
          +'<td><button class="btn btn-acc btn-xs" onclick="abrirStkAjuste('+p.id+')">📥 Repor</button></td>';
        tbC.appendChild(tr);
      });
    }
  }

  var tbT = document.querySelector('#stk-table-todos tbody');
  if(tbT){
    tbT.innerHTML='';
    lista.sort(function(a,b){return getStkPct(a.id)-getStkPct(b.id);}).forEach(function(p){
      var ep=getProd(p),st=getStkStatus(p.id),qty=getStkQty(p.id),min=getStkMin(p.id),pct=getStkPct(p.id);
      var tr=document.createElement('tr');
      tr.innerHTML='<td><div style="font-weight:600;font-size:.77rem">'+ep.nome+'</div><div style="font-size:.62rem;color:var(--t3)">'+subLabel(ep.subcategoria)+'</div></td>'
        +'<td><span style="font-family:var(--mono);font-weight:700">'+qty+'</span></td>'
        +'<td><span style="font-family:var(--mono);color:var(--t3)">'+min+'</span></td>'
        +'<td><div style="display:flex;align-items:center;gap:5px"><div style="width:55px;height:4px;background:var(--bdr);border-radius:99px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+getStkColor(st)+';border-radius:99px"></div></div><span style="font-size:.64rem;color:var(--t3);font-family:var(--mono)">'+pct+'%</span></div></td>'
        +'<td><span class="stk-badge '+st+'">'+(st==='out'?'🔴':st==='low'?'⚠':'✅')+'</span></td>';
      tbT.appendChild(tr);
    });
  }

  var histEl   = document.getElementById('stk-hist-list');
  var histEmpty= document.getElementById('stk-hist-empty');
  if(histEl){
    if(!stkHist.length){ histEl.innerHTML=''; if(histEmpty) histEmpty.style.display='block'; return; }
    if(histEmpty) histEmpty.style.display='none';
    histEl.innerHTML='';
    stkHist.slice(0,80).forEach(function(h){
      var d=new Date(h.ts), dStr=d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      var sinal=h.delta>=0?'+':'';
      var cor=h.tipo==='entrada'?'var(--grn)':h.tipo==='saida'?'var(--red)':'var(--acc)';
      var row=document.createElement('div'); row.className='hist-row';
      row.innerHTML='<span class="hist-tipo '+h.tipo+'">'+h.tipo+'</span>'
        +'<div style="flex:1;min-width:0"><div style="font-size:.77rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+h.nome+'</div>'
        +(h.obs?'<div style="font-size:.64rem;color:var(--t3)">'+h.obs+'</div>':'')+'</div>'
        +'<span style="font-family:var(--mono);font-size:.77rem;font-weight:700;color:'+cor+'">'+sinal+h.delta+'</span>'
        +'<span style="font-family:var(--mono);font-size:.7rem;color:var(--t3);margin-left:4px">→ '+h.qtyDepois+'</span>'
        +'<span style="font-size:.62rem;color:var(--t3);white-space:nowrap;margin-left:6px">'+dStr+'</span>';
      histEl.appendChild(row);
    });
  }
}
