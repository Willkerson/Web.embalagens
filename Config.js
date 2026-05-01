// ─────────────────────────────────────────────────────────────
// CONFIG.JS — Estado global, mapeamentos de categorias e labels
// ─────────────────────────────────────────────────────────────

var carrinho = {};
var estado = { cat: 'todos', sub: 'todas', busca: '', marca: 'todas' };
var pagtoSelecionado = '';

var catMap = {
  caixas:     ['caixas-correio', 'caixas-alimentos', 'caixas-ondulados'],
  sacolas:    ['sacos-lixo', 'sacolas-papel', 'sacolas-plasticas'],
  plastico:   ['potes-tampas', 'embalagens-bolo'],
  festa:      ['copos-pratos', 'talheres', 'pratos'],
  limpeza:    ['produtos-limpeza', 'utensilios-limpeza', 'epi'],
  higiene:    ['papel-higiene', 'aromas-inseticidas'],
  utilidades: ['pilhas-baterias', 'organiz-limpeza', 'ferramentas', 'escritorio', 'ganchos'],
  diversos:   ['isopor-geral', 'emb-flexiveis', 'emb-diversas', 'outros']
};

var subLabels = {
  'caixas-correio':    'Caixas Correios',
  'caixas-alimentos':  'Caixas p/ Alimentos',
  'sacos-lixo':        'Sacos de Lixo',
  'sacolas-papel':     'Sacolas de Papel',
  'sacolas-plasticas': 'Sacolas Plásticas',
  'potes-tampas':      'Potes e Tampas',
  'embalagens-bolo':   'Embalagens p/ Bolo',
  'copos-pratos':      'Copos e Pratos',
  'talheres':          'Talheres',
  'produtos-limpeza':  'Produtos Químicos',
  'utensilios-limpeza':'Utensílios',
  'epi':               'EPI & Proteção',
  'papel-higiene':     'Papel & Sabonetes',
  'pilhas-baterias':   'Pilhas & Baterias',
  'aromas-inseticidas':'Aromas & Inseticidas',
  'organiz-limpeza':   'Organização',
  'ferramentas':       'Ferramentas',
  'escritorio':        'Escritório',
  'ganchos':           'Ganchos',
  'isopor-geral':      'Isopor Geral',
  'emb-flexiveis':     'Emb. Flexíveis',
  'emb-diversas':      'Emb. Diversas',
  'outros':            'Outros',
  'caixas-ondulados':  'Caixas Ondulados',
  'pratos':            'Pratos Descartáveis'
};

var catEmojis = {
  caixas:'📦', sacolas:'🛍️', plastico:'🧪', festa:'🥂', limpeza:'🧹',
  higiene:'🧻', utilidades:'🔧', diversos:'🔓',
  'caixas-correio':'📬', 'caixas-alimentos':'🍕', 'sacos-lixo':'🗑️',
  'sacolas-papel':'🧻', 'sacolas-plasticas':'🛒', 'potes-tampas':'🫙',
  'embalagens-bolo':'🎂', 'copos-pratos':'🥤', 'talheres':'🍴',
  'produtos-limpeza':'🧴', 'utensilios-limpeza':'🧽', 'epi':'🧤',
  'papel-higiene':'🧻', 'pilhas-baterias':'🔋', 'aromas-inseticidas':'🌿',
  'organiz-limpeza':'🪣', 'ferramentas':'🔨', 'escritorio':'✏️',
  'ganchos':'🪝', 'isopor-geral':'❄️', 'emb-flexiveis':'📜',
  'emb-diversas':'🎁', 'outros':'📎'
};

// Chave de esgotados no localStorage (sincronizado com admin)
var ESGOTADOS_KEY = 'cia_esgotados_v1';

function prods() {
  return window.listaProdutosPlanilha || [];
}
