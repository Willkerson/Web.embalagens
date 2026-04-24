/* ══════════════════════════════════════════════
   INTEGRAÇÃO PLANILHA — COM CLASSIFICAÇÃO INTELIGENTE
══════════════════════════════════════════════ */

/* ── 1. MAPA DE CORRESPONDÊNCIA (Os que já existem no HTML) ── */
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

/* ── 2. O ROBÔ CLASSIFICADOR (A inteligência que você pediu) ── */
function classificarProduto(nome) {
    const n = nome.toUpperCase();
    
    // Regras para CAIXAS DE PAPELÃO
    if (n.includes("CAIXA") || n.includes("PAPELAO") || n.includes("ONDULADA")) {
        return { cat: "caixas", sub: "geral", tipo: null };
    }
    // Regras para ISOPOR
    if (n.includes("ISOPOR") || n.includes("MARMITEX") || n.includes("DISCO")) {
        return { cat: "isopor", sub: "todas", tipo: null };
    }
    // Regras para SACOLAS E SACOS DE LIXO
    if (n.includes("SACO") || n.includes("SACOLA") || n.includes("LIXO") || n.includes("BOBINA")) {
        let tipoSacola = "preta"; // Padrão
        if (n.includes("BRANC")) tipoSacola = "branca";
        else if (n.includes("VERDE")) tipoSacola = "verde";
        else if (n.includes("CRYSTAL") || n.includes("CRISTAL") || n.includes("TRANSPARENTE")) tipoSacola = "crystal";
        else if (n.includes("KRAFT") || n.includes("PAPEL")) tipoSacola = "kraft";
        else if (n.includes("BANHEIRO") || n.includes("PIA")) tipoSacola = "lixo-banheiro";
        return { cat: "sacolas", sub: "todas", tipo: tipoSacola };
    }
    // Regras para FESTA E DESCARTÁVEIS
    if (n.includes("GARFO") || n.includes("FACA") || n.includes("COLHER") || n.includes("COPO") || n.includes("PRATO") || n.includes("GUARDANAPO") || n.includes("MEXEDOR")) {
        return { cat: "festa", sub: "todas", tipo: null };
    }
    // Regras para PLÁSTICOS (Potes e Marmitas)
    if (n.includes("POTE") || n.includes("MARMITA") || n.includes("GALVANOTEK") || n.includes("HIVERPACK") || n.includes("PRA FESTA") || n.includes("PRAFESTA")) {
        let subP = "todas";
        if (n.includes("BOLO") || n.includes("TORTA")) subP = "bolo-plastico";
        else if (n.includes("MARMITA") || n.includes("RETANGULAR")) subP = "marmita-plastico";
        return { cat: "plastico", sub: subP, tipo: null };
    }
    // Regras para PRODUTOS DE LIMPEZA (Aba nova)
    if (n.includes("LIMPEZA") || n.includes("DETERGENTE") || n.includes("SABAO") || n.includes("DESINFETANTE") || n.includes("VASSOURA") || n.includes("RODO") || n.includes("ALVEJANTE") || n.includes("CLORO")) {
        return { cat: "limpeza", sub: "produtos-limpeza", tipo: null };
    }
    // Regras para HIGIENE E PAPEL (Aba nova)
    if (n.includes("PAPEL HIGIENICO") || n.includes("TOALHA") || n.includes("INTERFOLHA") || n.includes("SABONETE")) {
        return { cat: "higiene", sub: "papel-higiene", tipo: null };
    }
    
    // SE NÃO ENCAIXAR EM NADA: Joga numa categoria genérica "Diversos"
    return { cat: "diversos", sub: "outros", tipo: null };
}

/* ── 3. LÊ CSV E JOGA CADA UM NO SEU LUGAR ── */
async function carregarEAtualizarPrecos() {
  try {
    const resp = await fetch('precos.csv');
    if (!resp.ok) throw new Error('CSV não encontrado');
    const texto = await resp.text();
    const linhas = texto.trim().split('\n').slice(1);

    const precosCSV = {};
    linhas.forEach(linha => {
      const partes = linha.match(/"([^"]+)"/g);
      if (!partes || partes.length < 2) return;
      const nome  = partes[0].replace(/"/g, '').trim().toUpperCase();
      const valor = partes[1].replace(/"/g, '').replace(',', '.').trim();
      precosCSV[nome] = parseFloat(valor) || 0;
    });

    if (typeof listaProdutos !== 'undefined') {
        listaProdutos.forEach(p => {
          const nomeCSV = mapaPrecosPlanilha[p.id];
          if (nomeCSV && precosCSV[nomeCSV.toUpperCase()] !== undefined) {
            p.preco = precosCSV[nomeCSV.toUpperCase()];
          }
        });
    }

    // ── MAGIA ACONTECENDO AQUI ──
    const todosOsProdutosPlanilha = [];
    let novoId = 1000; 

    Object.keys(precosCSV).forEach(nomeNoCSV => {
        let existeNaFixa = false;
        if (typeof listaProdutos !== 'undefined') {
            existeNaFixa = listaProdutos.some(p => {
                const nomeMapeado = mapaPrecosPlanilha[p.id];
                return nomeMapeado && nomeMapeado.toUpperCase() === nomeNoCSV;
            });
        }
        
        if (!existeNaFixa) {
            // Chama a função robô que criamos pra descobrir a categoria certa
            const classificacao = classificarProduto(nomeNoCSV);

            todosOsProdutosPlanilha.push({
                id: novoId++,
                nome: nomeNoCSV,
                preco: precosCSV[nomeNoCSV],
                categoria: classificacao.cat, 
                subcategoria: classificacao.sub,
                tipo: classificacao.tipo,
                unidade: "/un",
                especificacoes: { "Categoria Identificada": classificacao.cat.toUpperCase(), "Fonte": "Importado do CSV" }
            });
        }
    });

    window.listaProdutosPlanilha = todosOsProdutosPlanilha;
    console.log(`✓ Leitura completa! ${todosOsProdutosPlanilha.length} itens novos categorizados automaticamente.`);

  } catch (e) {
    console.warn('Erro ao ler CSV:', e.message);
    window.listaProdutosPlanilha = [];
  }

  // Gera os botões extras e atualiza a tela
  adicionarFiltrosNovos();
  if (typeof renderizarProdutos === 'function') renderizarProdutos();
}

/* ── 4. CATEGORIAS EXTRAS (Se o robô achar produto de Limpeza, Higiene ou Diversos) ── */
function adicionarFiltrosNovos() {
  const containerFiltros = document.getElementById('containerFiltros');
  if (!containerFiltros) return;

  const categoriasExtras = [
    { id: 'limpeza',  label: 'Limpeza',  icon: 'https://img.icons8.com/fluency/48/broom.png' },
    { id: 'higiene',  label: 'Higiene',  icon: 'https://img.icons8.com/fluency/48/toilet-paper.png' },
    { id: 'diversos', label: 'Diversos', icon: 'https://img.icons8.com/fluency/48/open-box.png' }
  ];

  // Adiciona o botão no menu do site SOMENTE SE a planilha tiver produtos dessas categorias
  categoriasExtras.forEach(cat => {
    const temProdutoDessaCat = window.listaProdutosPlanilha && window.listaProdutosPlanilha.some(p => p.categoria === cat.id);
    
    if (temProdutoDessaCat && !document.getElementById(`btn-filtro-${cat.id}`)) {
        const btn = document.createElement('button');
        btn.className = 'btn-filter';
        btn.id = `btn-filtro-${cat.id}`;
        // Usa a lógica padrão do site para o clique, mas se for menu extra aciona o filtro extra
        btn.onclick = () => {
            if (typeof filtrarCategoria === 'function' && ['caixas','sacolas','isopor','plastico','festa'].includes(cat.id)) {
                filtrarCategoria(cat.id, btn);
            } else {
                filtrarCategoriaExtra(cat.id, btn);
            }
        };
        btn.innerHTML = `<img src="${cat.icon}" class="icon-png"> <span>${cat.label}</span>`;
        containerFiltros.appendChild(btn);
    }
  });
}

function filtrarCategoriaExtra(catId, btnEl) {
    // Desativa os outros botões do menu
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    
    // Some com as sub-barras (porque essas abas extras não precisam de submenu)
    document.querySelectorAll('.sub-bar-base').forEach(b => b.classList.remove('visible'));
    const breadcrumb = document.getElementById("breadcrumb");
    if(breadcrumb) breadcrumb.classList.remove("visible");

    // Limpa e injeta os produtos dessa categoria extra
    const container = document.getElementById('containerProdutos');
    container.innerHTML = '';
    
    const produtosDessaCat = window.listaProdutosPlanilha.filter(p => p.categoria === catId);
    
    // Reutiliza a função nativa do seu index.html para criar a sessão (fica bonito no layout!)
    if (typeof criarSecao === 'function') {
        const nomes = { limpeza: "Produtos de Limpeza", higiene: "Higiene & Papel", diversos: "Diversos e Utilidades" };
        criarSecao(nomes[catId] || "Produtos", produtosDessaCat, container, catId, null);
    }
}

// Inicia assim que o script é carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
