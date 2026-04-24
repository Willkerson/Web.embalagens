/* ══════════════════════════════════════════════
   INTEGRAÇÃO PLANILHA — CÓDIGO COMPLETO
   Substitua todo o conteúdo do seu integracao_planilha.js por este.
══════════════════════════════════════════════ */

/* ── 1. MAPA DE CORRESPONDÊNCIA: id do produto no HTML -> nome no CSV ── */
const mapaPrecosPlanilha = {
  1:   "CAIXA P/CORREIO N0016X11X07 1UN NIAGRA",
  2:   "CAIXA P/CORREIO N01 21X15X6,5 NIAGRA",
  3:   "CAIXA P/CORREIO N02 26X17X08",
  4:   "CAIXA P CORREIO N03 30X20X11 NIAGRA",
  5:   "CAIXA P/CORREIO N04 34X27X14",
  6:   "CAIXA P/BOLO TORRE 32 32X32X22 NIAGRA",
  7:   "CAIXA DE BOLO N09 40X40X12 1 UN NIAGRA",
  8:   "CAIXA P/BOLO N07 MEDIA 28X28X10 NIAGRA",
  9:   "CAIXA P/BOLO N07 COM ALCA 20X20X10",
  10:  "CAIXA P/BOLO N06 26X26X10 NIAGRA",
  11:  "CAIXA P/BOLO 22X22X10",
  12:  "CAIXA P/ESFIHA N3 25X25X05 NIAGRA",
  13:  "CAIXA P/ COPINHO C/50 DIVISÓRIAS",
  14:  "CAIXA P/ 25 CUPCAKES (40X40X12)",
  15:  "CAIXA P /ESFIHA N02 20X20X05 NIAGRA",
  16:  "CAIXA REDONDA P/PIZZA N 35 NIAGRA",
  310: "CAIXA ONDULADA N05",
  311: "CAIXA ONDULADA N04",
  312: "CAIXA PAPELAO N3 40X30X30",
  200: "KIT GARFO E FACA C/50UN",
  201: "GARFO P/ REFEIÇAO C/200UN ELITE",
  202: "FACA REFEIÇÃO BRANCO C/200UN ELITE",
  203: "POTE QUADRADO 250ML C/24UN PRAFESTA",
  204: "POTE REDONDO 200ML C/TAMPA C/24UN PRAFESTA",
  205: "POTE REDONDO 250ML C/TAMPA C/24UN",
  206: "POTE REDONDO 350ML C/TAMPA C/24UN PRAFESTA",
  207: "POTE REDONDO 200ML C/TAMPA C/24UN DANUBIO",
  208: "POTE E TAMPA REDONDO 500ML C/TAMPA C/24UN DANUBIIO",
  209: "POTE E TAMPA REDONDO 750ML C/24UN DANUBIO",
  210: "POTE E TAMPA REDONDO 1000ML C/24UN DANUBIO",
  211: "MARMITA PRETA 850ML C/3 DIVISORIAS C/10UN",
  212: "KIT POTE E TAMPA RET. 750ML C/12UN GOUR MAX",
  213: "KIT POTE E TAMPA RET. 500ML C/12UN GOUR MAX",
  214: "KIT POTE E TAMPA RET. 350ML C/12UN GOUR MAX",
  300: "SACO P/ LIXO PRETO P8 60L C/10UN",
  301: "SACOS P/LIXO 100L P8 C10UN PRETO",
  302: "SACO P/ LIXO PRETO P6 40L C/10UN",
  303: "SACO P/ LIXO PRETO 200L C/10UN",
  304: "SACO P/ LIXO PRETO P12 200L C/50UN",
  305: "SACO P/ LIXO PRETO 100L C/50UN",
  306: "SACO P/ LIXO PRETO P8 60L C/50UN",
  307: "SACO P/ LIXO PRETO P6 40L C/50UN",
  308: "SACOS PARA LIXO PRETO 20L P5 C/10UN",
  309: "SACO P/LIXO 20L PRETO P5 C/50UN",
  320: "PACK LIXO PIA E BANHEIRO TUTTI-FRUITI C/80UN DIVA",
  321: "TOP LIXO PIA E BANHEIRO BRANCO C/40UN PACK LIXO",
  322: "TOP LIXO PIA E BANHEIRO LAVANDA C/40UN PACK LIXO",
  323: "TOP LIXO BRANCO 15L C/60UN PACK LIXO",
  324: "TOP LIXO PRETO 15L C/60UN PACK LIXO",
  325: "TOP LIXO PRETO 30L C/30UN PACK LIXO",
  326: "TOP LIXO BRANCO 30L C/30UN PACK LIXO",
};

/* ── 2. CATEGORIAS NOVAS ── */
const categoriasNovas = [
  { id: 'limpeza',              label: 'Limpeza',             icon: 'fas fa-spray-can'    },
  { id: 'higiene',              label: 'Higiene & Papel',     icon: 'fas fa-toilet-paper' },
  { id: 'utilidades',           label: 'Utilidades',          icon: 'fas fa-toolbox'       },
  { id: 'embalagens-flexiveis', label: 'Emb. Flexíveis',      icon: 'fas fa-film'          },
  { id: 'embalagens-diversas',  label: 'Emb. Diversas',       icon: 'fas fa-shapes'        },
];

const subCategoriasNovas = {
  limpeza: [
    { id: 'todas',              label: 'Todas'              },
    { id: 'produtos-limpeza',   label: 'Produtos de Limpeza'},
    { id: 'utensilios-limpeza', label: 'Utensílios'         },
    { id: 'epi',                label: 'EPI & Proteção'     },
  ],
  higiene:              [{ id: 'todas', label: 'Todas' }, { id: 'papel-higiene', label: 'Papel & Higiene' }],
  utilidades: [
    { id: 'todas',              label: 'Todas'              },
    { id: 'organiz-limpeza',    label: 'Organização'        },
    { id: 'ganchos',            label: 'Ganchos'            },
    { id: 'aromas-inseticidas', label: 'Aromas & Inseticidas'},
    { id: 'ferramentas',        label: 'Ferramentas'        },
    { id: 'pilhas-baterias',    label: 'Pilhas & Baterias'  },
    { id: 'escritorio',         label: 'Escritório'         },
    { id: 'outros',             label: 'Outros'             },
  ],
  'embalagens-flexiveis': [{ id: 'todas', label: 'Todas' }, { id: 'emb-flexiveis', label: 'Embalagens Flexíveis' }],
  'embalagens-diversas':  [{ id: 'todas', label: 'Todas' }, { id: 'emb-diversas',  label: 'Embalagens Diversas'  }],
};

/* ── 3. LÊ CSV, ATUALIZA PREÇOS E CRIA PRODUTOS NOVOS AUTOMATICAMENTE ── */
async function carregarEAtualizarPrecos() {
  try {
    const resp = await fetch('precos.csv');
    if (!resp.ok) throw new Error('CSV não encontrado');
    const texto = await resp.text();
    const linhas = texto.trim().split('\n').slice(1); // pula cabeçalho

    // 3.1. Constrói dicionário nome -> preco a partir do CSV
    const precosCSV = {};
    linhas.forEach(linha => {
      const partes = linha.match(/"([^"]+)"/g);
      if (!partes || partes.length < 2) return;
      const nome  = partes[0].replace(/"/g, '').trim().toUpperCase();
      const valor = partes[1].replace(/"/g, '').replace(',', '.').trim();
      precosCSV[nome] = parseFloat(valor) || 0;
    });

    // 3.2. Atualiza os preços dos produtos que já existem no site (index.html)
    if (typeof listaProdutos !== 'undefined') {
        listaProdutos.forEach(p => {
          const nomeCSV = mapaPrecosPlanilha[p.id];
          if (nomeCSV && precosCSV[nomeCSV.toUpperCase()] !== undefined) {
            p.preco = precosCSV[nomeCSV.toUpperCase()];
          }
        });
    }

    // 3.3. AUTO-CRIAÇÃO: Verifica o que tem no CSV que NÃO está no HTML
    const todosOsProdutosPlanilha = [];
    let novoId = 1000; // IDs novos começam de 1000 para não conflitar com os antigos

    Object.keys(precosCSV).forEach(nomeNoCSV => {
        // Verifica se este produto do CSV já está mapeado no HTML
        let existeNaFixa = false;
        if (typeof listaProdutos !== 'undefined') {
            existeNaFixa = listaProdutos.some(p => {
                const nomeMapeado = mapaPrecosPlanilha[p.id];
                return nomeMapeado && nomeMapeado.toUpperCase() === nomeNoCSV;
            });
        }
        
        if (!existeNaFixa) {
            // Se não existe, cria ele como um produto da aba "Utilidades"
            todosOsProdutosPlanilha.push({
                id: novoId++,
                nome: nomeNoCSV,
                preco: precosCSV[nomeNoCSV],
                categoria: "utilidades", 
                subcategoria: "outros",
                unidade: "/un",
                especificacoes: { "Fonte": "Catálogo Importado", "Categoria": "Utilidades" }
            });
        }
    });

    // 3.4. Salva os produtos novos na memória global
    window.listaProdutosPlanilha = todosOsProdutosPlanilha;

    console.log(`✓ Leitura completa: ${Object.keys(precosCSV).length} itens processados do CSV. Produtos novos criados: ${todosOsProdutosPlanilha.length}`);
  } catch (e) {
    console.warn('Não foi possível carregar precos.csv — usando preços padrão.', e.message);
    window.listaProdutosPlanilha = [];
  }

  // 3.5. Adiciona os filtros novos (botões) e recarrega os produtos na tela
  adicionarFiltrosNovos();
  if (typeof renderizarProdutos === 'function') {
      renderizarProdutos();
  }
}

/* ── 4. INJETA BOTÕES DE FILTRO DAS NOVAS CATEGORIAS ── */
function adicionarFiltrosNovos() {
  const containerFiltros = document.getElementById('containerFiltros');
  if (!containerFiltros) return;

  // Evita duplicar se já foi adicionado
  if (document.getElementById('btn-filtro-limpeza')) return;

  const iconMap = {
    limpeza:              'https://img.icons8.com/fluency/48/broom.png',
    higiene:              'https://img.icons8.com/fluency/48/toilet-paper.png',
    utilidades:           'https://img.icons8.com/fluency/48/toolbox.png',
    'embalagens-flexiveis': 'https://img.icons8.com/fluency/48/film-roll.png',
    'embalagens-diversas':  'https://img.icons8.com/fluency/48/open-box.png',
  };

  categoriasNovas.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'btn-filter';
    btn.id = `btn-filtro-${cat.id}`;
    btn.onclick = () => filtrarCategoriaNova(cat.id, btn);
    btn.innerHTML = `<img src="${iconMap[cat.id]||''}" class="icon-png"> <span>${cat.label}</span>`;
    containerFiltros.appendChild(btn);
  });
}

/* ── 5. FILTRO PARA CATEGORIAS NOVAS ── */
let subBarraNovaAtiva = null;

function filtrarCategoriaNova(cat, el) {
  // Desativa todos os filtros
  document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
  el.classList.add('active');

  // Esconde todas as barras de subcategorias originais
  document.querySelectorAll('.sub-bar-base').forEach(b => {
    b.classList.remove('visible');
  });

  // Remove barra nova anterior se existir
  const barraAntiga = document.getElementById('barra-nova-sub');
  if (barraAntiga) barraAntiga.remove();

  subBarraNovaAtiva = cat;

  // Cria barra de subcategorias para as novas
  const subs = subCategoriasNovas[cat];
  if (subs && subs.length > 1) {
    const barra = document.createElement('div');
    barra.className = 'sub-bar-base visible';
    barra.id = 'barra-nova-sub';
    subs.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn-sub' + (i === 0 ? ' active' : '');
      btn.innerHTML = `<i class="fas fa-tag"></i> ${s.label}`;
      btn.onclick = () => {
        barra.querySelectorAll('.btn-sub').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtrarSubCategoriaNova(cat, s.id);
      };
      barra.appendChild(btn);
    });
    document.getElementById('sub-bar-container') 
      ? document.querySelector('.sub-bar-container').appendChild(barra)
      : document.querySelector('.filters-wrapper').after(barra);
  }

  filtrarSubCategoriaNova(cat, 'todas');
}

function filtrarSubCategoriaNova(cat, sub) {
  const container = document.getElementById('containerProdutos');
  container.innerHTML = '';

  if (typeof window.listaProdutosPlanilha === 'undefined') {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:4rem 0;">Nenhum produto extra carregado da planilha.</p>';
    return;
  }

  const filtrados = window.listaProdutosPlanilha.filter(p => {
    if (p.categoria !== cat) return false;
    if (sub !== 'todas' && p.subcategoria !== sub) return false;
    return true;
  });

  if (!filtrados.length) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:4rem 0;">Nenhum produto encontrado nesta categoria.</p>';
    return;
  }

  // Agrupa por subcategoria para exibição
  const grupos = {};
  filtrados.forEach(p => {
    const key = p.subcategoria;
    if (!grupos[key]) grupos[key] = { label: p.especificacoes?.Subcategoria || "Outros", produtos: [] };
    grupos[key].produtos.push(p);
  });

  Object.values(grupos).forEach(g => {
    criarSecaoNova(g.label, g.produtos, container);
  });
}

/* ── 6. RENDERIZA UMA SEÇÃO DE PRODUTOS NOVOS ── */
function criarSecaoNova(titulo, produtos, container) {
  const secao = document.createElement('div');
  secao.className = 'product-section';
  secao.innerHTML = `<h2 class="section-title"><i class="fas fa-tag" style="color:var(--blue-600);background:var(--blue-50);padding:10px;border-radius:14px;font-size:1.4rem;"></i> ${titulo}</h2>`;

  const grade = document.createElement('div');
  grade.className = 'products-grid';

  produtos.forEach(p => {
    // carrinho vem do HTML principal
    const noCarrinho = typeof carrinho !== 'undefined' ? !!carrinho[p.id] : false;
    const ehConsulta = p.preco === 'Sob consulta' || p.preco === 0;
    const pFmt = !ehConsulta ? p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';

    const htmlPreco = ehConsulta
      ? `<div class="price-box"><span class="price-label">Consulte-nos</span><span class="price-value" style="font-size:1.4rem;">Sob consulta</span></div>`
      : `<div class="price-box"><span class="price-label">A partir de</span><div class="price-row"><span class="price-value">${pFmt}</span><span class="price-unit">${p.unidade}</span></div></div>`;

    const card = document.createElement('div');
    card.className = `product-card${noCarrinho ? ' in-cart' : ''}`;
    card.id = `card-${p.id}`;

    // Tenta usar a função de SVG do HTML principal, senão usa um ícone fixo
    let svgIcon = `<svg viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="30" width="90" height="80" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2.5"/><rect x="20" y="30" width="90" height="24" rx="6" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/><rect x="46" y="30" width="38" height="24" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="2"/><line x1="35" y1="72" x2="95" y2="72" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,3"/><line x1="35" y1="86" x2="95" y2="86" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,3"/><line x1="35" y1="100" x2="75" y2="100" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,3"/></svg>`;
    if (typeof svgProdutos !== 'undefined' && svgProdutos.default) {
        svgIcon = svgProdutos.default;
    }

    card.innerHTML = `
      <div class="product-img">
        <div class="cart-seal"><i class="fas fa-check"></i></div>
        ${svgIcon}
      </div>
      <div class="product-body">
        <h3 class="product-name" title="${p.nome}">${p.nome.length > 50 ? p.nome.substring(0,48)+'…' : p.nome}</h3>
        <p class="product-desc">${p.especificacoes?.Subcategoria || p.categoria}</p>
        ${htmlPreco}
        <div class="product-actions">
          <div class="qty-control">
            <button class="btn-qty" onclick="event.stopPropagation();alterarInputQtd(${p.id},-1)">−</button>
            <input class="input-qty" id="qtd-${p.id}" type="number" value="1" min="1" onclick="event.stopPropagation()">
            <button class="btn-qty" onclick="event.stopPropagation();alterarInputQtd(${p.id},1)">+</button>
          </div>
          <button class="btn-add${noCarrinho ? ' added' : ''}" id="btn-add-${p.id}"
            onclick="event.stopPropagation();adicionarAoCarrinhoPlanilha(${p.id},document.getElementById('qtd-${p.id}').value)">
            <i class="fas fa-shopping-cart"></i> Adicionar
          </button>
          <button class="btn-info" onclick="abrirModalPlanilha(${p.id})" title="Ver detalhes">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      </div>`;

    grade.appendChild(card);
    if (typeof cardObserver !== 'undefined') cardObserver.observe(card);
  });

  secao.appendChild(grade);
  container.appendChild(secao);
}

/* ── 7. CARRINHO PARA PRODUTOS DA PLANILHA ── */
function adicionarAoCarrinhoPlanilha(id, qtd) {
  if (typeof window.listaProdutosPlanilha === 'undefined') return;
  const produto = window.listaProdutosPlanilha.find(p => p.id === id);
  if (!produto) return;
  
  // Repassa para a função adicionarAoCarrinho principal que você já tem no HTML
  if (typeof adicionarAoCarrinho === 'function') {
      // Temporariamente joga o produto na lista principal para o carrinho reconhecer
      if (!listaProdutos.find(p => p.id === id)) {
          listaProdutos.push(produto);
      }
      adicionarAoCarrinho(id, qtd);
  }
}

function abrirModalPlanilha(id) {
  if (typeof window.listaProdutosPlanilha === 'undefined') return;
  const p = window.listaProdutosPlanilha.find(x => x.id === id);
  if (!p) return;
  
  const obj = {
    ...p,
    icone: 'fas fa-box',
    descricao: p.especificacoes?.Subcategoria || 'Importado da planilha',
    especificacoes: {
      'Categoria': p.especificacoes?.Categoria || 'Utilidades',
      'Fonte': p.especificacoes?.Fonte || 'Planilha CSV',
    }
  };
  
  if (typeof abrirModal === 'function') {
      abrirModal(obj);
  }
}

/* ── 8. INICIALIZAÇÃO ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
