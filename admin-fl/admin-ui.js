/* admin-ui.js — Modais, e-mail, WhatsApp, GitHub, Estrutura, Bindings */
'use strict';

var emailAlvos = [], emailTipo = 'fornecedor';
var tT; // toast timer

/* ── Toast ── */
function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast on'+(type?' '+type:'');
  clearTimeout(tT); tT = setTimeout(function(){ t.className='toast'; }, 2600);
}

/* ── Modais ── */
function abrirModal(id) { fecharModais(); document.getElementById('overlay').classList.add('on'); document.getElementById(id).classList.add('on'); }
function fecharModais() { document.getElementById('overlay').classList.remove('on'); document.querySelectorAll('.modal').forEach(function(m){ m.classList.remove('on'); }); }

/* ── GitHub ── */
function getCfg()  { return rls(K.CFG, {}); }
function setCfg(o) { wls(K.CFG, o); }

function abrirCfg() {
  var c = getCfg();
  document.getElementById('cfg-user').value      = c.user   || '';
  document.getElementById('cfg-repo').value      = c.repo   || '';
  document.getElementById('cfg-branch').value    = c.branch || 'main';
  document.getElementById('cfg-path').value      = c.path   || 'front-index/produtos_planilha.js';
  document.getElementById('cfg-html-path').value = c.htmlPath|| 'front-index/index.html';
  document.getElementById('cfg-token').value     = c.token  || '';
  document.getElementById('cfg-auto-index').checked = !!c.autoIndex;
  abrirModal('modalConfig');
}
function salvarCfg() {
  var c = {
    user:      document.getElementById('cfg-user').value.trim(),
    repo:      document.getElementById('cfg-repo').value.trim(),
    branch:    document.getElementById('cfg-branch').value.trim() || 'main',
    path:      document.getElementById('cfg-path').value.trim()   || 'front-index/produtos_planilha.js',
    htmlPath:  document.getElementById('cfg-html-path').value.trim() || 'front-index/index.html',
    token:     document.getElementById('cfg-token').value.trim(),
    autoIndex: document.getElementById('cfg-auto-index').checked
  };
  if(!c.user || !c.repo || !c.token){ showToast('⚠ Preencha usuário, repo e token','red'); return; }
  setCfg(c); fecharModais(); syncBadge(); showToast('✓ Config salva!','grn');
}
async function testarCfg() {
  var c = getCfg(); if(!c.token){ showToast('⚠ Configure o token primeiro','red'); return; }
  setSyncSt('','🔄 Testando...');
  try {
    var r = await fetch('https://api.github.com/repos/'+c.user+'/'+c.repo+'/contents/'+c.path,
      {headers:{Authorization:'token '+c.token,Accept:'application/vnd.github+json'}});
    if(r.ok){ setSyncSt('ok','✓ Conectado'); showToast('✓ Conexão OK!','grn'); }
    else { var e=await r.json(); setSyncSt('err','✕ Erro '+r.status); showToast('Erro: '+(e.message||r.status),'red'); }
  } catch(e){ setSyncSt('err','✕ Falha'); showToast('Falha: '+e.message,'red'); }
}
function syncBadge() { var c=getCfg(); if(c.token&&c.user&&c.repo) setSyncSt('ok','✓ '+c.user+'/'+c.repo); else setSyncSt('','⬤ não configurado'); }
function setSyncSt(t, txt) { var el=document.getElementById('sync-status'); el.className='pill-status'+(t?' '+t:''); el.textContent=txt; }

function setStep(id, estado) {
  var el=document.getElementById(id); if(!el) return;
  el.className='pub-step '+estado;
  var ico=el.querySelector('.pub-step-ico');
  if(ico) ico.textContent = estado==='doing'?'↻':estado==='done'?'✓':'✕';
}
function setPM(t, s) { document.getElementById('pubMsg').textContent=t; document.getElementById('pubSub').textContent=s; }

async function publicar() {
  var c = getCfg();
  if(!c.token||!c.user||!c.repo){ abrirCfg(); showToast('⚠ Configure o GitHub primeiro','red'); return; }
  abrirModal('modalPublicando');
  var autoIndex = !!c.autoIndex;
  document.getElementById('step-index').style.opacity = autoIndex ? '1' : '0.35';
  setPM('Publicando...','Preparando arquivos');
  setStep('step-js','doing'); setStep('step-index','');
  var apiBase='https://api.github.com/repos/'+c.user+'/'+c.repo+'/contents/';
  var hdrs={Authorization:'token '+c.token,Accept:'application/vnd.github+json','Content-Type':'application/json'};
  try {
    setPM('Passo 1/2','Publicando produtos_planilha.js...');
    var jsUrl=apiBase+c.path;
    var getR=await fetch(jsUrl,{headers:hdrs}); var shaProd=null;
    if(getR.ok) shaProd=(await getR.json()).sha;
    else if(getR.status!==404){ var err=await getR.json(); throw new Error(err.message||'Erro '+getR.status); }
    var b64js=btoa(unescape(encodeURIComponent(gerarJS())));
    var bodyJs={message:'🔧 Admin: atualiza produtos — '+new Date().toLocaleString('pt-BR'),content:b64js,branch:c.branch||'main'};
    if(shaProd) bodyJs.sha=shaProd;
    var putJs=await fetch(jsUrl,{method:'PUT',headers:hdrs,body:JSON.stringify(bodyJs)});
    if(!putJs.ok){ var pe=await putJs.json(); throw new Error(pe.message||'Erro '+putJs.status); }
    setStep('step-js','done');
    novosProd=[]; savN(); deletados=new Set(); savD();
  } catch(e){
    setStep('step-js','err'); fecharModais(); showToast('✕ Falha no JS: '+e.message,'red'); setSyncSt('err','✕ Erro');
    document.getElementById('codeArea').textContent=gerarJS(); abrirModal('modalExport'); return;
  }
  if(!autoIndex){
    setPM('✓ Produtos publicados!','index.html não atualizado (desativado)');
    setSyncSt('ok','✓ Publicado'); markSaved(); setTimeout(fecharModais,1800); showToast('🚀 Produtos publicados!','grn'); return;
  }
  setStep('step-index','doing'); setPM('Passo 2/2','Atualizando index.html...');
  try {
    var htmlPath=c.htmlPath||'front-index/index.html';
    var htmlUrl=apiBase+htmlPath;
    var getHtml=await fetch(htmlUrl,{headers:hdrs});
    if(!getHtml.ok) throw new Error('Erro ao buscar index.html: HTTP '+getHtml.status);
    var dataHtml=await getHtml.json();
    indexSha=dataHtml.sha; localStorage.setItem(K.IDXSHA,indexSha);
    var htmlAtual=decodeURIComponent(escape(atob(dataHtml.content.replace(/\n/g,''))));
    var novoHtml=aplicarTudoNoHTML(htmlAtual);
    indexHtmlContent=novoHtml; localStorage.setItem(K.IDXHTML,novoHtml);
    var b64html=btoa(unescape(encodeURIComponent(novoHtml)));
    var bodyHtml={message:'📄 Admin: atualiza catMap + submenus — '+new Date().toLocaleString('pt-BR'),content:b64html,branch:c.branch||'main',sha:indexSha};
    var putHtml=await fetch(htmlUrl,{method:'PUT',headers:hdrs,body:JSON.stringify(bodyHtml)});
    if(!putHtml.ok){ var he=await putHtml.json(); throw new Error(he.message||'Erro '+putHtml.status); }
    var dHtml=await putHtml.json();
    if(dHtml.content){ indexSha=dHtml.content.sha; localStorage.setItem(K.IDXSHA,indexSha); }
    setStep('step-index','done'); setPM('✓ Tudo publicado!','Loja atualizada em ~1 min');
    setSyncSt('ok','✓ Publicado'); markSaved(); setTimeout(fecharModais,2000); showToast('🚀 Tudo publicado!','grn');
  } catch(e){
    setStep('step-index','err'); setPM('⚠ Produtos ok, index.html falhou',e.message);
    showToast('⚠ index.html: '+e.message,'amb'); setSyncSt('ok','✓ Produtos ok'); setTimeout(fecharModais,2800);
  }
}

async function publicarIndexStruct() {
  var c=getCfg(); if(!c.token||!c.user||!c.repo){ showToast('⚠ Configure o GitHub primeiro','red'); return; }
  showToast('⏳ Publicando...','amb');
  try {
    var htmlPath=c.htmlPath||'front-index/index.html';
    var apiUrl='https://api.github.com/repos/'+c.user+'/'+c.repo+'/contents/'+htmlPath;
    var hdrs={Authorization:'token '+c.token,Accept:'application/vnd.github+json','Content-Type':'application/json'};
    var getR=await fetch(apiUrl,{headers:hdrs});
    var content=''; var sha=indexSha;
    if(getR.ok){ var d=await getR.json(); sha=d.sha; localStorage.setItem(K.IDXSHA,sha); content=decodeURIComponent(escape(atob(d.content.replace(/\n/g,'')))); }
    else if(getR.status!==404) throw new Error('HTTP '+getR.status);
    var novo=content?aplicarTudoNoHTML(content):gerarSubtabsCompleto();
    var b64=btoa(unescape(encodeURIComponent(novo)));
    var body={message:'📄 Admin: atualiza estrutura — '+new Date().toLocaleString('pt-BR'),content:b64,branch:c.branch||'main'};
    if(sha) body.sha=sha;
    var putR=await fetch(apiUrl,{method:'PUT',headers:hdrs,body:JSON.stringify(body)});
    if(!putR.ok){ var e2=await putR.json(); throw new Error(e2.message||'HTTP '+putR.status); }
    var d2=await putR.json();
    if(d2.content){ indexSha=d2.content.sha; localStorage.setItem(K.IDXSHA,indexSha); }
    markSaved(); showToast('🚀 Estrutura publicada!','grn');
  } catch(e){ showToast('✕ Erro: '+e.message,'red'); }
}

/* ── E-mail ── */
function emailBody(tipo, alvos) {
  var d=new Date().toLocaleDateString('pt-BR');
  if(tipo==='fornecedor'){
    var ls=alvos.map(function(p){return'  • '+p.nome+(p.marca?' ['+p.marca+']':'')+' (R$ '+(p.preco>0?p.preco.toFixed(2).replace('.',','):'a definir')+')';}).join('\n');
    return 'Prezado(a) Fornecedor(a),\n\nSolicitamos reposição dos itens esgotados:\n\n'+ls+'\n\nPedimos cotação com prazo, preço unitário e condições de pagamento.\n\nAtenciosamente,\nCia Das Embalagens\n📞 (11) 97299-9835\n'+d;
  }
  if(tipo==='aviso-cliente'){
    var ls=alvos.map(function(p){return'  • '+p.nome;}).join('\n');
    return 'Prezado(a) cliente,\n\nOs produto(s) abaixo estão temporariamente indisponíveis:\n\n'+ls+'\n\nJá estamos trabalhando na reposição.\nPara alternativas: 📞 (11) 97299-9835\n\nCia Das Embalagens — '+d;
  }
  var ls=alvos.map(function(p){return'  • '+p.nome+(p.marca?' | '+p.marca:'')+' | R$ '+(p.preco>0?p.preco.toFixed(2).replace('.',','):'—');}).join('\n');
  return 'REPOSIÇÃO INTERNA — '+d+'\n\nPRODUTOS EM FALTA:\n'+ls+'\n\nAÇÕES: Contatar fornecedores e emitir pedido de compra.\n\nPrioridade: ALTA';
}
function emailSubject(tipo, alvos) {
  var n=alvos.length===1?alvos[0].nome.substring(0,45):(alvos.length+' produtos');
  if(tipo==='fornecedor') return '[PEDIDO] Reposição — '+n;
  if(tipo==='aviso-cliente') return 'Produto temporariamente esgotado — Cia Das Embalagens';
  return '[INTERNO] Reposição urgente — '+n;
}
function abrirEmailModal(alvos) {
  emailAlvos=alvos; emailTipo='fornecedor';
  document.querySelectorAll('.e-chip').forEach(function(c){ c.classList.toggle('on',c.dataset.tipo==='fornecedor'); });
  document.getElementById('emailSubject').value=emailSubject('fornecedor',alvos);
  document.getElementById('emailTo').value='';
  refreshEmailPrev(); abrirModal('modalEmail');
}
function refreshEmailPrev() {
  var para=document.getElementById('emailTo').value.trim()||'—';
  var ass=document.getElementById('emailSubject').value.trim();
  document.getElementById('em-para').textContent=para;
  document.getElementById('em-assunto').textContent=ass;
  document.getElementById('em-body').textContent=emailBody(emailTipo,emailAlvos);
}

/* ── WhatsApp esgotados ── */
function wppEsgMsg(alvos) {
  var d=new Date().toLocaleDateString('pt-BR');
  var ls=alvos.map(function(p){return'• '+p.nome+(p.marca?' ['+p.marca+']':'')+(p.preco>0?' — R$ '+p.preco.toFixed(2).replace('.',','):'');}).join('\n');
  return '⚠️ *Produtos Esgotados — Cia Das Embalagens*\n\nData: '+d+'\n\n'+ls+'\n\nPrecisamos repor esses itens. Aguardamos cotação. 🙏';
}
function enviarWppEsgotado(alvos) { window.open('https://wa.me/'+WPP_NUM+'?text='+encodeURIComponent(wppEsgMsg(alvos)),'_blank'); }

/* ── Modal ajuste estoque ── */
function abrirStkAjuste(id) {
  stkAjusteId=id;
  var prod=prods().find(function(p){return p.id===id;});
  var ep=prod?getProd(prod):{nome:'#'+id};
  document.getElementById('stk-ajuste-nome').textContent=ep.nome;
  var qty=getStkQty(id)!==null?getStkQty(id):0;
  document.getElementById('stk-ajuste-val').value=qty;
  document.getElementById('stk-ajuste-min').value=getStkMin(id)||'';
  document.getElementById('stk-ajuste-obs').value='';
  document.getElementById('stk-ajuste-tipo').value='ajuste';
  document.getElementById('stk-ajuste-atual').textContent=qty;
  document.getElementById('stk-ajuste-novo').textContent=qty;
  document.querySelectorAll('.stk-quick-btn').forEach(function(btn){
    btn.onclick=function(){
      var delta=parseInt(this.dataset.delta);
      var cur=parseInt(document.getElementById('stk-ajuste-val').value)||0;
      var nova=Math.max(0,cur+delta);
      document.getElementById('stk-ajuste-val').value=nova;
      document.getElementById('stk-ajuste-novo').textContent=nova;
      document.getElementById('stk-ajuste-tipo').value=delta>0?'entrada':'saida';
    };
  });
  document.getElementById('stk-ajuste-val').oninput=function(){ document.getElementById('stk-ajuste-novo').textContent=Math.max(0,parseInt(this.value)||0); };
  abrirModal('modalStkAjuste');
}
function confirmarStkAjuste() {
  if(stkAjusteId===null) return;
  var novaQty=Math.max(0,parseInt(document.getElementById('stk-ajuste-val').value)||0);
  var novoMin=Math.max(0,parseInt(document.getElementById('stk-ajuste-min').value)||0);
  var tipo=document.getElementById('stk-ajuste-tipo').value;
  var obs=document.getElementById('stk-ajuste-obs').value.trim();
  aplicarAjusteEstoque(stkAjusteId,novaQty,novoMin,tipo,obs);
  fecharModais(); showToast('✓ Estoque atualizado','grn'); stkAjusteId=null;
}

/* ── Painel Estrutura ── */
function spPopularMenuSel() {
  var sel=document.getElementById('sp-nm-cat'); var cur=sel.value; sel.innerHTML='';
  var emp=document.createElement('option'); emp.value=''; emp.textContent='(sem link)'; sel.appendChild(emp);
  cats.forEach(function(c){ var o=document.createElement('option'); o.value=c.id; o.textContent=catLabelText(c.id); sel.appendChild(o); });
  if(cur) sel.value=cur;
}
function spRenderCats() {
  var list=document.getElementById('sp-cat-list'); list.innerHTML='';
  document.getElementById('sp-cat-total').textContent=cats.length;
  cats.forEach(function(c){
    var subIds=catMap[c.id]||[];
    var item=document.createElement('div'); item.className='sp-cat-item'+(spActiveCatId===c.id?' on':'');
    var emo=document.createElement('span'); emo.className='sp-cat-emo'; emo.textContent=catEmoji(c.id);
    var info=document.createElement('div'); info.className='sp-cat-info';
    info.innerHTML='<div class="sp-cat-name">'+catLabelText(c.id)+'</div><div class="sp-cat-count">'+subIds.length+' sub'+(subIds.length!==1?'s':'')+'</div>';
    var del=document.createElement('div'); del.className='sp-cat-del'; del.textContent='✕'; del.title='Remover';
    del.addEventListener('click',function(e){
      e.stopPropagation();
      if(!confirm('Remover categoria "'+catLabelText(c.id)+'"?')) return;
      cats=cats.filter(function(x){return x.id!==c.id;}); subs=subs.filter(function(s){return s.catId!==c.id;}); delete catMap[c.id];
      if(spActiveCatId===c.id) spActiveCatId=null;
      savCats(); savSubs(); savCatMap(); markUnsaved(); spRenderCats(); spRenderSubs(); spPopularMenuSel(); popularNpSelects();
      showToast('Categoria removida','amb');
    });
    item.appendChild(emo); item.appendChild(info); item.appendChild(del);
    item.addEventListener('click',function(){ spActiveCatId=c.id; spRenderCats(); spRenderSubs(); });
    list.appendChild(item);
  });
  spPopularMenuSel();
}
function spRenderSubs() {
  var empty=document.getElementById('sp-subs-empty');
  var list=document.getElementById('sp-sub-list');
  var title=document.getElementById('sp-subs-title');
  var showAddBtn=document.getElementById('sp-btn-show-add-sub');
  var addForm=document.getElementById('sp-add-sub-form');
  if(!spActiveCatId){
    empty.style.display=''; empty.innerHTML='<span style="font-size:1.5rem;opacity:.2">📂</span><span>Selecione uma categoria</span>';
    list.style.display='none'; title.textContent='← Selecione uma categoria';
    showAddBtn.style.display='none'; addForm.className='sp-add-sub'; return;
  }
  var cat=cats.find(function(c){return c.id===spActiveCatId;});
  title.textContent=cat?cat.label:'—'; showAddBtn.style.display='';
  var subIds=catMap[spActiveCatId]||[];
  if(!subIds.length){
    empty.style.display=''; empty.innerHTML='<span style="font-size:1.5rem;opacity:.2">📂</span><span>Nenhum submenu ainda</span>'; list.style.display='none';
  } else {
    empty.style.display='none'; list.style.display=''; list.innerHTML='';
    subIds.forEach(function(subId){
      var item=document.createElement('div'); item.className='sp-sub-item';
      var idEl=document.createElement('span'); idEl.className='sp-sub-id'; idEl.textContent=subId; idEl.title=subId;
      var inp=document.createElement('input'); inp.type='text'; inp.className='sp-sub-inp';
      inp.value=subLabel(subId); inp.dataset.subid=subId;
      inp.addEventListener('change',function(){
        var sid=this.dataset.subid; subLabels[sid]=this.value.trim();
        var sv=subs.find(function(s){return s.id===sid;}); if(sv) sv.label=this.value.trim();
        savSubLabels(); savSubs(); markUnsaved(); showToast('✓ Rótulo salvo','grn');
      });
      var del=document.createElement('div'); del.className='sp-sub-del'; del.textContent='✕'; del.title='Remover';
      del.addEventListener('click',(function(sid,catId){return function(){
        catMap[catId]=(catMap[catId]||[]).filter(function(x){return x!==sid;});
        subs=subs.filter(function(s){return s.id!==sid;}); delete subLabels[sid];
        savCatMap(); savSubs(); savSubLabels(); markUnsaved(); spRenderCats(); spRenderSubs(); showToast('Submenu removido','amb');
      };})(subId,spActiveCatId));
      item.appendChild(idEl); item.appendChild(inp); item.appendChild(del); list.appendChild(item);
    });
  }
}
function spRenderMenu() {
  var list=document.getElementById('sp-menu-list'); list.innerHTML='';
  document.getElementById('sp-menu-total').textContent=menuItems.length;
  menuItems.forEach(function(m,i){
    var item=document.createElement('div'); item.className='sp-menu-item';
    var lbl=document.createElement('span'); lbl.className='sp-menu-label'; lbl.textContent=m.label;
    var cat2=document.createElement('span'); cat2.className='sp-menu-cat'; cat2.textContent=m.catId||'link externo';
    var badge=document.createElement('span'); badge.className='sp-menu-badge '+m.tipo; badge.textContent=m.tipo;
    var del=document.createElement('div'); del.className='sp-menu-del'; del.textContent='✕';
    del.addEventListener('click',(function(idx){ return function(){ menuItems.splice(idx,1); savMenu(); markUnsaved(); spRenderMenu(); showToast('Item removido','amb'); }; })(i));
    item.appendChild(lbl); item.appendChild(cat2); item.appendChild(badge); item.appendChild(del); list.appendChild(item);
  });
}

/* ── Novo produto ── */
function popularNpSelects() {
  var nc=document.getElementById('np-cat'); if(!nc) return;
  var cur=nc.value; nc.innerHTML='';
  cats.forEach(function(c){ var o=document.createElement('option'); o.value=c.id; o.textContent=c.label; nc.appendChild(o); });
  if(cur) nc.value=cur;
  popularNpSub(nc.value);
}
function popularNpSub(catId) {
  var ns=document.getElementById('np-sub'); if(!ns) return;
  ns.innerHTML='';
  subs.filter(function(s){return s.catId===catId;}).forEach(function(s){ var o=document.createElement('option'); o.value=s.id; o.textContent=s.label; ns.appendChild(o); });
}
function adicionarProd() {
  var nome=document.getElementById('np-nome').value.trim();
  if(!nome){ showToast('⚠ Preencha o nome','red'); return; }
  var preco=parseFloat(document.getElementById('np-preco').value.replace(',','.'))||0;
  var unidade=document.getElementById('np-unidade').value.trim()||'/unidade';
  var marca=document.getElementById('np-marca').value.trim();
  var cat=document.getElementById('np-cat').value;
  var sub=document.getElementById('np-sub').value;
  var imagem=document.getElementById('np-imagem').value.trim();
  var imgmode=document.getElementById('np-imgmode').value;
  var maxId=9000; prods().forEach(function(p){ if(p.id>=maxId) maxId=p.id+1; });
  var novo={id:maxId,nome:nome,categoria:cat,subcategoria:sub,preco:preco,unidade:unidade};
  if(marca) novo.marca=marca;
  if(imagem){ novo.imagem=imagem; novo.imgmode=imgmode; }
  novosProd.push(novo); savN(); markUnsaved();
  fecharModais(); renderizar(); renderCatFilters(); popularSubSel();
  showToast('✓ Produto adicionado!','grn');
}

/* ── WPP alerta config ── */
function renderWppAlertCfg() {
  var tog=document.getElementById('wppAlertTog');
  tog.className='tog '+(wppCfg.enabled?'on':'off');
  document.getElementById('wpp-alert-num').value=wppCfg.num||WPP_NUM;
  document.getElementById('wpp-alert-interval').value=wppCfg.interval||15;
  tog.onclick=function(){
    wppCfg.enabled=!wppCfg.enabled; this.className='tog '+(wppCfg.enabled?'on':'off');
    savWppCfg(); iniciarMonitoramento(); showToast(wppCfg.enabled?'✓ Alertas ativados':'Alertas desativados', wppCfg.enabled?'grn':'amb');
  };
  document.getElementById('btn-salvar-wpp-cfg').onclick=function(){
    wppCfg.num=document.getElementById('wpp-alert-num').value.trim().replace(/\D/g,'')||WPP_NUM;
    wppCfg.interval=parseInt(document.getElementById('wpp-alert-interval').value)||15;
    savWppCfg(); iniciarMonitoramento(); showToast('✓ Config WPP salva!','grn');
  };
}

/* ── Bindings ── */
function bind() {
  /* GitHub */
  document.getElementById('btn-cfg').addEventListener('click', abrirCfg);
  document.getElementById('btn-pub').addEventListener('click', publicar);
  document.getElementById('btn-exportar').addEventListener('click', function(){
    document.getElementById('codeArea').textContent=gerarJS(); abrirModal('modalExport');
  });

  /* Estrutura */
  document.getElementById('btn-struct').addEventListener('click', function(){
    var p=document.getElementById('structPanel'); p.classList.toggle('on');
    if(p.classList.contains('on')){ spRenderCats(); spRenderSubs(); spRenderMenu(); p.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  });
  document.getElementById('btn-pub-struct').addEventListener('click', publicarIndexStruct);

  /* Cats */
  document.getElementById('sp-btn-add-cat').addEventListener('click', function(){
    var emoji=document.getElementById('sp-nc-emoji').value.trim()||'📦';
    var id=document.getElementById('sp-nc-id').value.trim().toLowerCase().replace(/\s+/g,'-');
    var label=document.getElementById('sp-nc-label').value.trim();
    if(!id||!label){ showToast('⚠ Preencha ID e rótulo','red'); return; }
    if(cats.find(function(c){return c.id===id;})){ showToast('⚠ ID já existe','red'); return; }
    cats.push({id:id,label:emoji+' '+label}); catMap[id]=[];
    savCats(); savCatMap(); markUnsaved();
    document.getElementById('sp-nc-emoji').value=''; document.getElementById('sp-nc-id').value=''; document.getElementById('sp-nc-label').value='';
    spRenderCats(); popularNpSelects(); renderCatFilters(); showToast('✓ Categoria adicionada','grn');
  });
  ['sp-nc-emoji','sp-nc-id','sp-nc-label'].forEach(function(id){
    document.getElementById(id).addEventListener('keydown',function(e){ if(e.key==='Enter') document.getElementById('sp-btn-add-cat').click(); });
  });

  /* Subs */
  document.getElementById('sp-btn-show-add-sub').addEventListener('click', function(){
    spAddSubOpen=!spAddSubOpen;
    var form=document.getElementById('sp-add-sub-form'); form.className='sp-add-sub'+(spAddSubOpen?' on':'');
    this.textContent=spAddSubOpen?'✕ Fechar':'＋ Sub';
    if(spAddSubOpen) document.getElementById('sp-ns-id').focus();
  });
  document.getElementById('sp-btn-add-sub').addEventListener('click', function(){
    if(!spActiveCatId){ showToast('⚠ Selecione uma categoria','red'); return; }
    var id=document.getElementById('sp-ns-id').value.trim().toLowerCase().replace(/\s+/g,'-');
    var label=document.getElementById('sp-ns-label').value.trim();
    if(!id||!label){ showToast('⚠ Preencha ID e rótulo','red'); return; }
    if(subs.find(function(s){return s.id===id;})){ showToast('⚠ ID já existe','red'); return; }
    subs.push({id:id,catId:spActiveCatId,label:label});
    if(!catMap[spActiveCatId]) catMap[spActiveCatId]=[];
    catMap[spActiveCatId].push(id); subLabels[id]=label;
    savSubs(); savCatMap(); savSubLabels(); markUnsaved();
    document.getElementById('sp-ns-id').value=''; document.getElementById('sp-ns-label').value='';
    spRenderCats(); spRenderSubs(); popularSubSel(); showToast('✓ Submenu adicionado','grn');
  });
  ['sp-ns-id','sp-ns-label'].forEach(function(id){
    document.getElementById(id).addEventListener('keydown',function(e){ if(e.key==='Enter') document.getElementById('sp-btn-add-sub').click(); });
  });

  /* Menu nav */
  document.getElementById('sp-btn-add-menu').addEventListener('click', function(){
    var label=document.getElementById('sp-nm-label').value.trim();
    if(!label){ showToast('⚠ Preencha o rótulo','red'); return; }
    menuItems.push({label:label,catId:document.getElementById('sp-nm-cat').value,tipo:document.getElementById('sp-nm-tipo').value});
    savMenu(); markUnsaved(); document.getElementById('sp-nm-label').value=''; spRenderMenu(); showToast('✓ Item adicionado','grn');
  });
  document.getElementById('sp-nm-label').addEventListener('keydown',function(e){ if(e.key==='Enter') document.getElementById('sp-btn-add-menu').click(); });
  document.getElementById('sp-btn-copiar-menu').addEventListener('click', function(){
    var linhas=menuItems.map(function(m){
      if(m.catId) return '<div class="nav-link" onclick="filterCat(\''+m.catId+'\')">'+m.label+'</div>';
      var cls=m.tipo==='green'?'nav-link nav-link-green':m.tipo==='blue'?'nav-link nav-link-blue':'nav-link';
      return '<a class="'+cls+'" href="https://wa.me/'+WPP_NUM+'" target="_blank">'+m.label+'</a>';
    });
    navigator.clipboard.writeText(linhas.join('\n')).then(function(){ showToast('📋 Código copiado!','grn'); });
  });

  /* Novo produto */
  document.getElementById('btn-novo').addEventListener('click', function(){
    ['np-nome','np-preco','np-marca','np-imagem'].forEach(function(id){ document.getElementById(id).value=''; });
    document.getElementById('np-unidade').value='/unidade'; document.getElementById('np-imgmode').value='thumbnail';
    popularNpSelects(); abrirModal('modalNovoProduto');
  });
  document.getElementById('btn-add-prod').addEventListener('click', adicionarProd);
  document.getElementById('np-cat').addEventListener('change', function(){ popularNpSub(this.value); });

  /* Esgotados */
  document.getElementById('btn-esg-panel').addEventListener('click', function(){
    var p=document.getElementById('esgPanel'); p.classList.toggle('on'); painelEsg();
    if(p.classList.contains('on')) p.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  document.getElementById('btn-email-todos').addEventListener('click', function(){
    var l=prods().filter(function(p){return esgotados.has(p.id);}); if(!l.length){ showToast('Nenhum esgotado','amb'); return; }
    abrirEmailModal(l.map(function(p){return getProd(p);}));
  });
  document.getElementById('btn-wpp-todos').addEventListener('click', function(){
    var l=prods().filter(function(p){return esgotados.has(p.id);}); if(!l.length){ showToast('Nenhum esgotado','amb'); return; }
    enviarWppEsgotado(l.map(function(p){return getProd(p);}));
  });
  document.getElementById('btn-reativar-todos').addEventListener('click', function(){
    prods().filter(function(p){return esgotados.has(p.id);}).forEach(function(p){ esgotados.delete(p.id); refreshCard(p.id); });
    savEsg(); markUnsaved(); stats(); painelEsg(); showToast('✓ Todos reativados','grn');
  });

  /* Estoque */
  document.getElementById('btn-stk-panel').addEventListener('click', function(){
    var p=document.getElementById('stkPanel'); p.classList.toggle('on'); painelStkRender();
    if(p.classList.contains('on')) p.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  document.querySelectorAll('.stk-tab').forEach(function(tab){
    tab.addEventListener('click', function(){
      document.querySelectorAll('.stk-tab').forEach(function(t){ t.classList.remove('on'); });
      document.querySelectorAll('.stk-pane').forEach(function(p){ p.classList.remove('on'); });
      this.classList.add('on');
      var pane=document.getElementById('spane-'+this.dataset.spane); if(pane) pane.classList.add('on');
      if(this.dataset.spane==='alertas') renderWppAlertCfg();
    });
  });
  document.getElementById('btn-stk-wpp-criticos').addEventListener('click', dispararWppCriticos);
  document.getElementById('btn-stk-email-criticos').addEventListener('click', function(){
    var criticos=prods().filter(function(p){return getStkStatus(p.id)==='out'||getStkStatus(p.id)==='low';});
    if(!criticos.length){ showToast('Nenhum produto crítico','amb'); return; }
    abrirEmailModal(criticos.map(function(p){return getProd(p);}));
  });
  document.getElementById('btn-alert-wpp').addEventListener('click', dispararWppCriticos);
  document.getElementById('btn-alert-fechar').addEventListener('click', function(){ document.getElementById('alertCritico').classList.remove('on'); });
  document.getElementById('btn-stk-confirmar').addEventListener('click', confirmarStkAjuste);

  /* Filtros */
  document.getElementById('vis-filters').addEventListener('click', function(e){
    var btn=e.target.closest('.fbtn'); if(!btn) return;
    filtroVis=btn.dataset.vis;
    document.querySelectorAll('#vis-filters .fbtn').forEach(function(b){ b.classList.remove('on'); });
    btn.classList.add('on'); renderizar();
  });
  document.getElementById('busca').addEventListener('input', function(){ renderizar(); renderCatFilters(); });
  document.getElementById('filtroSub').addEventListener('change', function(){ filtroSubId=this.value; renderizar(); });
  document.getElementById('btn-mostrar').addEventListener('click', function(){
    prodsFiltrados.forEach(function(p){ ocultos.delete(p.id); refreshCard(p.id); }); savO(); markUnsaved(); stats(); showToast('✓ '+prodsFiltrados.length+' visíveis','grn');
  });
  document.getElementById('btn-ocultar').addEventListener('click', function(){
    prodsFiltrados.forEach(function(p){ ocultos.add(p.id); refreshCard(p.id); }); savO(); markUnsaved(); stats(); showToast('✕ '+prodsFiltrados.length+' ocultos','red');
  });

  /* Overlay/modais */
  document.getElementById('overlay').addEventListener('click', function(){ deletePendente=null; fecharModais(); });
  document.querySelectorAll('[data-close]').forEach(function(btn){ btn.addEventListener('click', function(){ deletePendente=null; fecharModais(); }); });
  document.getElementById('btn-salvar-cfg').addEventListener('click', salvarCfg);
  document.getElementById('btn-testar-cfg').addEventListener('click', testarCfg);
  document.getElementById('btn-confirmar-del').addEventListener('click', confirmarDelete);
  document.getElementById('btn-copiar-codigo').addEventListener('click', function(){ navigator.clipboard.writeText(document.getElementById('codeArea').textContent).then(function(){ showToast('📋 Copiado!','grn'); }); });
  document.getElementById('btn-cfg-from-export').addEventListener('click', abrirCfg);

  /* Email */
  document.querySelectorAll('.e-chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      emailTipo=this.dataset.tipo;
      document.querySelectorAll('.e-chip').forEach(function(c){ c.classList.remove('on'); }); this.classList.add('on');
      document.getElementById('emailSubject').value=emailSubject(emailTipo,emailAlvos);
      refreshEmailPrev();
    });
  });
  document.getElementById('emailTo').addEventListener('input', refreshEmailPrev);
  document.getElementById('emailSubject').addEventListener('input', refreshEmailPrev);
  document.getElementById('btn-mailto').addEventListener('click', function(){
    var para=document.getElementById('emailTo').value.trim();
    var ass=encodeURIComponent(document.getElementById('emailSubject').value.trim());
    var corpo=encodeURIComponent(emailBody(emailTipo,emailAlvos));
    window.location.href='mailto:'+para+'?subject='+ass+'&body='+corpo;
  });
  document.getElementById('btn-wpp-email').addEventListener('click', function(){
    var corpo=emailBody(emailTipo,emailAlvos);
    var ass=document.getElementById('emailSubject').value.trim();
    window.open('https://wa.me/'+WPP_NUM+'?text='+encodeURIComponent((ass?'*'+ass+'*\n\n':'')+corpo),'_blank');
  });
  document.getElementById('btn-copy-email').addEventListener('click', function(){ navigator.clipboard.writeText(emailBody(emailTipo,emailAlvos)).then(function(){ showToast('📋 E-mail copiado!','grn'); }); });
}

/* ── Init ── */
function init() {
  if(!window.listaProdutosPlanilha) window.listaProdutosPlanilha=[];
  bind(); popularNpSelects(); renderCatFilters(); popularSubSel(); renderizar(); syncBadge(); painelEsg();
  verificarAlertasEstoque(); iniciarMonitoramento();
  window.abrirStkAjuste = abrirStkAjuste;
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
else init();
