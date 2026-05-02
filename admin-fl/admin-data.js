/* admin-data.js — Defaults, constantes e storage */
'use strict';

var WPP_NUM = '5511972999835';

var K = {
  OCU:'cia_ocultos_v2', ED:'cia_edicoes_v2', CFG:'cia_github_cfg',
  NEW:'cia_novos_v1', DEL:'cia_deletados_v1', ESG:'cia_esgotados_v1',
  CAT:'cia_cats_v1', SUB:'cia_subs_v1', MENU:'cia_menu_v1',
  CATMAP:'cia_catmap_v1', SUBLABELS:'cia_sublabels_v1',
  IDXHTML:'cia_index_html_cache', IDXSHA:'cia_index_sha_cache',
  STK:'cia_estoque_v1', STKHIST:'cia_stk_hist_v1',
  WPPCFG:'cia_wpp_alert_cfg'
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

/* ── Storage helpers ── */
function rls(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e) { return d; } }
function wls(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

/* ── Estado global ── */
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

/* ── Persistência ── */
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
