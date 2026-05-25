/* admin-data.js — Defaults, constantes, storage e sincronização com planilha.js */
'use strict';

var WPP_NUM = '5511972999835';

var K = {
  OCU:'cia_ocultos_v2', ED:'cia_edicoes_v2', CFG:'cia_github_cfg',
  NEW:'cia_novos_v1', DEL:'cia_deletados_v1', ESG:'cia_esgotados_v1',
  CAT:'cia_cats_v1', SUB:'cia_subs_v1', MENU:'cia_menu_v1',
  CATMAP:'cia_catmap_v1', SUBLABELS:'cia_sublabels_v1',
  IDXHTML:'cia_index_html_cache', IDXSHA:'cia_index_sha_cache',
  STK:'cia_estoque_v1', STKHIST:'cia_stk_hist_v1',
  WPPCFG:'cia_wpp_alert_cfg',
  SNAP:'cia_planilha_snap_v1'   /* snapshot dos IDs da última carga */
};

var DEF_CATS = [
  {id:'caixas',label:'📦 Caixas'},{id:'sacolas',label:'🛍️ Sacolas & Lixo'},
  {id:'plastico',label:'🧪 Plásticos'},{id:'festa',label:'🥂 Festa'},
  {id:'limpeza',label:'🧹 Limpeza'},{id:'higiene',label:'🧻 Higiene'},
  {id:'utilidades',label:'🔧 Utilidades'},{id:'diversos',label:'🔓 Diversos'}
];

var DEF_SUBS = [
  {id:'caixas-correio',catId:'caixas',label:'Correios'},{id:'caixas-alimentos',catId:'caixas',label:'Alimentos'},
  {id:'caixas-ondulados',catId:'caixas',label:'Ondulados'},
  {id:'sacos-lixo',catId:'sacolas',label:'Sacos de Lixo'},{id:'sacolas-papel',catId:'sacolas',label:'Papel'},
  {id:'sacolas-plasticas',catId:'sacolas',label:'Plásticas'},{id:'potes-tampas',catId:'plastico',label:'Potes & Tampas'},
  {id:'embalagens-bolo',catId:'plastico',label:'Emb. Bolo'},{id:'copos-pratos',catId:'festa',label:'Copos & Pratos'},
  {id:'talheres',catId:'festa',label:'Talheres'},{id:'pratos',catId:'festa',label:'Pratos Descartáveis'},
  {id:'produtos-limpeza',catId:'limpeza',label:'Produtos Químicos'},{id:'utensilios-limpeza',catId:'limpeza',label:'Utensílios'},
  {id:'epi',catId:'limpeza',label:'EPI & Proteção'},{id:'papel-higiene',catId:'higiene',label:'Papel & Sabonetes'},
  {id:'aromas-inseticidas',catId:'higiene',label:'Aromas & Inset.'},
  {id:'pilhas-baterias',catId:'utilidades',label:'Pilhas'},{id:'organiz-limpeza',catId:'utilidades',label:'Organização'},
  {id:'ferramentas',catId:'utilidades',label:'Ferramentas'},{id:'escritorio',catId:'utilidades',label:'Escritório'},
  {id:'ganchos',catId:'utilidades',label:'Ganchos'},{id:'isopor-geral',catId:'diversos',label:'Isopor Geral'},
  {id:'emb-flexiveis',catId:'diversos',label:'Emb. Flexíveis'},{id:'emb-diversas',catId:'diversos',label:'Emb. Diversas'},
  {id:'outros',catId:'diversos',label:'Outros'}
];

var DEF_MENU = [
  {label:'Embalagens',catId:'caixas',tipo:'normal'},{label:'Descartáveis',catId:'festa',tipo:'normal'},
  {label:'Limpeza & EPI',catId:'limpeza',tipo:'normal'},{label:'Utilidades',catId:'utilidades',tipo:'normal'},
  {label:'Contato',catId:'',tipo:'green'}
];

var DEF_CATMAP = {
  caixas:['caixas-correio','caixas-alimentos','caixas-ondulados'],
  sacolas:['sacos-lixo','sacolas-papel','sacolas-plasticas'],
  plastico:['potes-tampas','embalagens-bolo'],
  festa:['copos-pratos','talheres','pratos'],
  limpeza:['produtos-limpeza','utensilios-limpeza','epi'],
  higiene:['papel-higiene','aromas-inseticidas'],
  utilidades:['pilhas-baterias','organiz-limpeza','ferramentas','escritorio','ganchos'],
  diversos:['isopor-geral','emb-flexiveis','emb-diversas','outros']
};

var DEF_SUBLABELS = {
  'caixas-correio':'Caixas Correios','caixas-alimentos':'Caixas p/ Alimentos','caixas-ondulados':'Caixas Ondulados',
  'sacos-lixo':'Sacos de Lixo','sacolas-papel':'Sacolas de Papel','sacolas-plasticas':'Sacolas Plásticas',
  'potes-tampas':'Potes e Tampas','embalagens-bolo':'Embalagens p/ Bolo','copos-pratos':'Copos e Pratos',
  'talheres':'Talheres','pratos':'Pratos Descartáveis','produtos-limpeza':'Produtos Químicos',
  'utensilios-limpeza':'Utensílios','epi':'EPI & Proteção','papel-higiene':'Papel & Sabonetes',
  'pilhas-baterias':'Pilhas & Baterias','aromas-inseticidas':'Aromas & Inseticidas',
  'organiz-limpeza':'Organização','ferramentas':'Ferramentas','escritorio':'Escritório','ganchos':'Ganchos',
  'isopor-geral':'Isopor Geral','emb-flexiveis':'Emb. Flexíveis','emb-diversas':'Emb. Diversas','outros':'Outros'
};

/* ══════════════════════════════════════════════
   STORAGE HELPERS
══════════════════════════════════════════════ */
function rls(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e) { return d; } }
function wls(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

/* ══════════════════════════════════════════════
   ESTADO GLOBAL
══════════════════════════════════════════════ */
var ocultos    = new Set(rls(K.OCU, []));
var edicoes    = rls(K.ED, {});
var novosProd  = rls(K.NEW, []);
var deletados  = new Set(rls(K.DEL, []));
var esgotados  = new Set(rls(K.ESG, []));
var cats       = rls(K.CAT, DEF_CATS);
var subs       = rls(K.SUB, DEF_SUBS);
var menuItems  = rls(K.MENU, DEF_MENU);
var catMap     = rls(K.CATMAP, DEF_CATMAP);
var subLabels  = rls(K.SUBLABELS, DEF_SUBLABELS);
var estoque    = rls(K.STK, {});
var stkHist    = rls(K.STKHIST, []);
var wppCfg     = rls(K.WPPCFG, {enabled:false, num:WPP_NUM, interval:15});

/* ══════════════════════════════════════════════
   PERSISTÊNCIA
══════════════════════════════════════════════ */
function savO()         { wls(K.OCU, [...ocultos]); }
function savE()         { wls(K.ED, edicoes); }
function savN()         { wls(K.NEW, novosProd); }
function savD()         { wls(K.DEL, [...deletados]); }
function savEsg()       { wls(K.ESG, [...esgotados]); }
function savCats()      { wls(K.CAT, cats); }
function savSubs()      { wls(K.SUB, subs); }
function savMenu()      { wls(K.MENU, menuItems); }
function savCatMap()    { wls(K.CATMAP, catMap); }
function savSubLabels() { wls(K.SUBLABELS, subLabels); }
function savStk()       { wls(K.STK, estoque); }
function savStkHist()   { wls(K.STKHIST, stkHist.slice(-500)); }
function savWppCfg()    { wls(K.WPPCFG, wppCfg); }

/* ══════════════════════════════════════════════
   SINCRONIZAÇÃO COM planilha.js
   
   Roda UMA VEZ no carregamento, antes de qualquer
   render. Compara o que veio do planilha.js com o
   snapshot da última carga e faz a limpeza:

   1. Produto NOVO na planilha  → respeita (aparece normalmente)
   2. Produto REMOVIDO da planilha → remove de edicoes, ocultos,
      esgotados (não cria entrada no deletados, pois ele
      já não existe na fonte)
   3. Produto que estava em novosProd mas agora existe na
      planilha → migra (remove de novosProd, preserva edicoes)
   4. Produto em edicoes/ocultos/esgotados que NÃO existe
      em nenhuma fonte → limpa o registro órfão
══════════════════════════════════════════════ */
function sincronizarComPlanilha() {
  var planilha = window.listaProdutosPlanilha || [];
  if (!planilha.length) return; /* planilha vazia = nada a fazer */

  var idsPlanilha  = new Set(planilha.map(function(p){ return p.id; }));
  var idsSnapshot  = new Set(rls(K.SNAP, []));
  var idsNovos     = new Set(novosProd.map(function(p){ return p.id; }));

  var removidos    = [];  /* IDs que saíram da planilha desde a última carga */
  var incorporados = [];  /* IDs que eram novosProd e agora entraram na planilha */

  /* ── 1. Detectar o que SAIU da planilha ── */
  idsSnapshot.forEach(function(id) {
    if (!idsPlanilha.has(id)) {
      removidos.push(id);
    }
  });

  /* ── 2. Limpar registros de produtos removidos da planilha ── */
  if (removidos.length) {
    removidos.forEach(function(id) {
      /* Só limpa se também não está em novosProd
         (evita apagar produto adicionado pelo admin com mesmo id) */
      if (idsNovos.has(id)) return;

      if (edicoes[id])      { delete edicoes[id]; }
      if (ocultos.has(id))  { ocultos.delete(id); }
      if (esgotados.has(id)){ esgotados.delete(id); }
      /* Não tocamos em deletados nem estoque intencionalmente */
    });
    savE(); savO(); savEsg();
  }

  /* ── 3. Migrar novosProd que a planilha absorveu ──
     Quando você publica, o produto sai de novosProd e vai para
     a planilha. Na próxima carga o admin precisa reconhecer isso. */
  var novosRestantes = novosProd.filter(function(p) {
    if (idsPlanilha.has(p.id)) {
      incorporados.push(p.id);
      /* Preserva edições que estavam sobre ele — já estão em edicoes */
      return false; /* remove de novosProd */
    }
    return true;
  });

  if (incorporados.length) {
    novosProd = novosRestantes;
    savN();
  }

  /* ── 4. Limpar edicoes/ocultos/esgotados órfãos ──
     Registros locais que não existem nem na planilha nem em novosProd */
  var idsNovosAtual = new Set(novosProd.map(function(p){ return p.id; }));
  var sujo = false;

  Object.keys(edicoes).forEach(function(id) {
    var idN = parseInt(id);
    if (!idsPlanilha.has(idN) && !idsNovosAtual.has(idN)) {
      delete edicoes[id]; sujo = true;
    }
  });
  if (sujo) savE();

  ocultos.forEach(function(id) {
    if (!idsPlanilha.has(id) && !idsNovosAtual.has(id)) {
      ocultos.delete(id); sujo = true;
    }
  });
  if (sujo) savO();

  esgotados.forEach(function(id) {
    if (!idsPlanilha.has(id) && !idsNovosAtual.has(id)) {
      esgotados.delete(id); sujo = true;
    }
  });
  if (sujo) savEsg();

  /* ── 5. Sincronizar campos da planilha para o admin ──
     Se um campo foi alterado DIRETAMENTE na planilha (sem passar
     pelo admin), e NÃO há edição local para aquele campo,
     o admin vai ler o valor certo automaticamente porque getProd()
     já usa a planilha como base e só sobrepõe com edicoes.
     Portanto este passo não precisa de código extra — já funciona. */

  /* ── 6. Salvar novo snapshot dos IDs atuais ── */
  wls(K.SNAP, [...idsPlanilha]);

  /* Log resumido no console para diagnóstico */
  if (removidos.length || incorporados.length) {
    console.log(
      '[Admin] Sincronização com planilha.js:',
      removidos.length   ? removidos.length   + ' removido(s) da planilha limpos' : '',
      incorporados.length ? incorporados.length + ' produto(s) migrado(s) de novosProd → planilha' : ''
    );
  }
}

/* Executa a sincronização imediatamente */
sincronizarComPlanilha();
