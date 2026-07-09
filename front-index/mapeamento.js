/**
 * mapeamento.js
 * Traduz os dados brutos do JSON externo para as categorias e subcategorias
 * utilizadas pelo site. Substitua este arquivo quando a lógica mudar —
 * o JSON externo nunca precisa ser alterado.
 *
 * Função principal: mapearProduto(produto) → { cat, sub }
 *   cat : chave de categoria usada nos filtros do site
 *         ('caixas' | 'sacolas' | 'plastico' | 'festa' | 'limpeza' | 'higiene' | 'utilidades' | 'diversos')
 *   sub : subcategoria (opcional, usada nas sub-abas)
 */

;(function (global) {

  // ─── 1. HELPERS ────────────────────────────────────────────────────────────

  /** Retorna true se o nome do produto contém qualquer uma das palavras-chave */
  function nomeContem(nome, ...termos) {
    const n = nome.toUpperCase();
    return termos.some(t => n.includes(t.toUpperCase()));
  }

  // ─── 2. REGRAS POR NOME (têm prioridade sobre a categoria) ─────────────────
  // Cada regra: { termos: [...], cat, sub }
  // A primeira que bater é usada.

  const REGRAS_NOME = [

    // ── CAIXAS – Correios ──────────────────────────────────────────────────
    { termos: ['CAIXA P/CORREIO', 'CAIXA DE CELULAR'], cat: 'caixas', sub: 'caixas-correio' },

    // ── CAIXAS – Alimentos ────────────────────────────────────────────────
    { termos: ['CAIXA P/PIZZA', 'CAIXA REDONDA P/PIZZA'], cat: 'caixas', sub: 'caixas-alimentos' },
    { termos: ['CAIXA P/BOLO', 'CAIXA P/ BOLO', 'CAIXA PARA BOLO', 'CAIXA P/ESFIHA', 'CAIXA P ESFIHA',
               'CAIXA P/ ESFIHA', 'CAIXA P/SFIHA', 'CAIXA P/ 25 CUPCAKE'],
      cat: 'caixas', sub: 'caixas-alimentos' },

    // ── CAIXAS – Ondulados / Papelão ──────────────────────────────────────
    { termos: ['CAIXA PAPELAO', 'CAIXA PAP.', 'CAIXA ONDULADA', 'CAIXA DE PAP.', 'PAPELAO ONDULADO'],
      cat: 'caixas', sub: 'caixas-ondulados' },

    // ── SACOLAS – Sacos de Lixo ───────────────────────────────────────────
    { termos: ['SACO P/ LIXO', 'SACO P/LIXO', 'SACO PARA LIXO', 'TOP LIXO', 'PACK LIXO'],
      cat: 'sacolas', sub: 'sacos-lixo' },

    // ── SACOLAS – Papel / Kraft ───────────────────────────────────────────
    { termos: ['SACOLA KRAFT', 'SACO KRAFT', 'SACO SOS', 'SACOLA SOS', 'SACOLA S3', 'SACO ECO KRAFT',
               'SACOLA DE PAPEL', 'SACOLA PARA VINHO', 'SACOLA P/1 GARRAFA'],
      cat: 'sacolas', sub: 'sacolas-papel' },

    // ── SACOLAS – Plásticas ───────────────────────────────────────────────
    { termos: ['SACOLA PLASTICA', 'SACOLA VERDE', 'SACOLA BRANCA', 'SACOLA PRETA', 'SACOLA REFORÇADA',
               'SACOLA VERDE LISA', 'SACOLA MILHEIRO', 'SACOLA UNIDADE', 'SACOLA PEQUENA'],
      cat: 'sacolas', sub: 'sacolas-plasticas' },

    // ── PLÁSTICOS – Potes e Tampas ────────────────────────────────────────
    { termos: ['POTE E TAMPA', 'POTE REDONDO', 'POTE OVAL', 'POTE QUADRADO', 'POTE TERMICO',
               'KIT POTE', 'KIT POTE E TAMPA', 'TAMPA P/POTE', 'TAMPA P/ POTE',
               'TAMPA BOLHA P/ COPO', 'TAMPA PP', 'D645', 'D650', 'D695', 'G77', 'G677',
               'G697', 'G680', 'CUMBUCA', 'SALADEIRA GALV'],
      cat: 'plastico', sub: 'potes-tampas' },

    // ── PLÁSTICOS – Embalagens p/ Bolo ────────────────────────────────────
    { termos: ['D32MM', 'D35MA', 'D50M', 'D56', 'D64', 'D70MB', 'D78', 'G32M', 'G37M', 'G56M',
               'G60M', 'G60MA', 'G63MM', 'G65M', 'G78M', 'G80MA', 'H60', 'H70', 'H70MM',
               'PF-56', 'PACKFORM', 'FORMINHAS', 'FORMINHA DE PAPEL', 'DISCO ISOPOR',
               'BASE BRANCA', 'BASE PRETA', 'FORMA P/BOLO', 'FORMA CESTO SILICONE',
               'ASSADEIRA DE ALUMINIO', 'BANDEJA DE ALUMINIO', 'FOLHA DE ALUMINIO',
               'FOLHA ALUMINIO', 'D10FS', 'D12', 'D12FS', 'D2 1L', 'D5 1', 'D6FS', 'D7 750',
               'D8 1,5', 'B120', 'G240', 'FORMA FRITADEIRA', 'PAPEL ANTIADERENTE', 'PAPEL MANTEIGA'],
      cat: 'plastico', sub: 'embalagens-bolo' },

    // ── FESTA – Copos e Pratos ────────────────────────────────────────────
    { termos: ['COPO DESCARTAVEL', 'COPO TERMICO', 'COPO ISOPOR', 'COPO E TAMPA', 'COPO 80ML',
               'COPO 300ML CRISTAL', 'COPO 200ML CRISTAL', 'COPO MINI', 'TAÇA', 'CAIXA COPO',
               'COPO PP DESCART'],
      cat: 'festa', sub: 'copos-pratos' },
    { termos: ['PRATO BRANCO', 'PRATO FUNDO', 'PRATO RASO', 'PRATO ISOPOR', 'PRATO QUADRADO',
               'BPR-23', 'BPR23'],
      cat: 'festa', sub: 'pratos' },

    // ── FESTA – Talheres ──────────────────────────────────────────────────
    { termos: ['GARFO', 'FACA SOFT', 'FACA MASTER', 'FACA REFEICAO', 'FACA REFEIÇÃO',
               'COLHER SOFT', 'COLHER MASTER', 'COLHER BRANCA', 'COLHER LITTLE', 'COLHER SOBREMESA',
               'COLHER DE SOPA', 'KIT GARFO E FACA', 'KIT GARFO', 'MEXEDOR', 'GUARDANAPO DE PAPEL',
               'GUARDANAPO TV', 'PALHINHA', 'CANUDO'],
      cat: 'festa', sub: 'talheres' },

    // ── FESTA – Itens gerais de festa ─────────────────────────────────────
    { termos: ['BEXIGA', 'VELA DE ANIVERSARIO', 'VELA DE ANIVERSÁRIO', 'VELA CHAMA',
               'KIT FESTA', 'BLISTER PARA DOCES', 'AMARRILHO', 'TOUCA DESCARTAVEL',
               'TOUCAS DESCARTAVEIS'],
      cat: 'festa' },

    // ── HIGIENE – Papel ───────────────────────────────────────────────────
    { termos: ['PAPEL HIGIENICO', 'PAPEL HIGIÊNICO', 'TOALHA INTERFOLHA', 'TOALHA DE PAPEL',
               'TOALHA BOBINA', 'PANO MULTIUSO AZUL C/600', 'PANO BRANCO MULTIUSO C/600',
               'PAPEL INTERFOLHADO', 'LENÇOL HOSPITALAR', 'DISPENSER DE PAPEL', 'DISPENSER PAPEL',
               'DISPNSER', 'DISPENSER INTERFOLHA', 'DISPENSER P/ COPO'],
      cat: 'higiene', sub: 'papel-higiene' },
    { termos: ['SABONETE LIQ', 'SABONETE LIQUIDO', 'SABONATEIRA', 'SABONETEIRA'],
      cat: 'higiene', sub: 'papel-higiene' },

    // ── HIGIENE – Aromas e Inseticidas ────────────────────────────────────
    { termos: ['AROMATIZADOR', 'ODORIZANTE', 'ODORIZADOR', 'INSETICIDA', 'MULTI-INSETICIDA',
               'REPELENTE', 'EVITA MOFO', 'DIFUSOR DE AROMAS', 'GLADE', 'NAFTALINA',
               'NEUTRALIZADOR DE ODORES'],
      cat: 'higiene', sub: 'aromas-inseticidas' },

    // ── LIMPEZA – EPI / Proteção ──────────────────────────────────────────
    { termos: ['LUVA LATEX', 'LUVA NITRILICA', 'LUVA NITRÍLICA', 'LUVA DE LATEX',
               'LUVA NUTRILICA', 'LUVA PLASTICA', 'LUVA DE VINIL', 'LUVAS NITRILICA'],
      cat: 'limpeza', sub: 'epi' },

    // ── LIMPEZA – Utensílios ──────────────────────────────────────────────
    { termos: ['RODO', 'VASSOURA', 'ESPONJA', 'FIBRA LIMP', 'PANO DE CHAO', 'PANO PARA PIA',
               'PANO PANOTEK', 'PANO MULTIUSO', 'ESCOVA SANITARIA', 'ESCOVA MULTIUSO',
               'ESCOVAO', 'SUPORTE LT', 'PASSA CERA', 'LIMPA TETO', 'REFIL RODO',
               'CABO DE MADEIRA', 'CABO DE ALUMINIO', 'CABO EXTENSOR', 'SUPER PÁ', 'KIT PA',
               'KIT ESCOVA', 'MOP', 'BACIA', 'BALDE', 'LIXEIRA', 'CESTO', 'BALAIO',
               'SACO P LAVAR ROUPA', 'SACO PARA LAVADORA', 'MAXXIMO SACO'],
      cat: 'limpeza', sub: 'utensilios-limpeza' },

    // ── LIMPEZA – Produtos Químicos ───────────────────────────────────────
    { termos: ['DESINFETANTE', 'DETERGENTE', 'SABAO EM PO', 'SABÃO EM PÓ', 'ALVEJANTE',
               'REMOVEDOR', 'AGUA SANITARIA', 'ÁGUA SANITÁRIA', 'DESENGORDURANTE', 'QUEROSENE',
               'LIMPA PEDRAS', 'LIMPA CERAMICAS', 'LIMPA PISOS', 'LIMPA VIDROS', 'LIMPA TENIS',
               'LIMPADOR', 'LIMPEZA PESADA', 'MAGICO REMOVEDOR', 'MAXIMOOM', 'MULTIUSO ORIGINAL',
               'TIRA FERRUGEM', 'TIRA LIMO', 'BRANQUINHO', 'AMACIANTE', 'LAVA ROUPAS',
               'CERA AUTO', 'BRILHA INOX', 'SILICONE SPRAY', 'LUSTRA MOVEIS', 'FLOTADOR',
               'SAPONACEO', 'SODA CAUSTICA', 'ALCOOL', 'ÁLCOOL', 'DESENTUPIDOR', 'PASTA DE BRILHO',
               'PEDRA SANITARIA', 'BLOCO P/CX ACOPLADA', 'DESORIZADOR', 'TUFF SEM PASSAR',
               'LIMPA AIR FRYER', 'ESPUMA DESENGORDURANTE', 'LIMPA ESTOFADOS', 'LIMPA TELAS',
               'LIMPA AZULEJO'],
      cat: 'limpeza', sub: 'produtos-limpeza' },

    // ── UTILIDADES – Pilhas e Baterias ────────────────────────────────────
    { termos: ['PILHA', 'BATERIA LITIO', 'BATERIA LITHIUM', 'BATERIA ALCALINA', 'BATERIA CARGA',
               'BATERIA MAX', 'BATERIA BOTAO'],
      cat: 'utilidades', sub: 'pilhas-baterias' },

    // ── UTILIDADES – Ferramentas ──────────────────────────────────────────
    { termos: ['ESTILETE', 'FITA ADESIVA', 'FITA CREPE', 'FITA DUPLA FACE', 'FITA ISOLANTE',
               'FITA REMOVIVEL', 'LAMINA P/ESTILETE', 'ABRACEDEIRA', 'COLA INSTANTANEA',
               'TEK BOND', 'EXTENSAO BIPOLAR', 'TRENA', 'JOGO DE CHAVE', 'KIT DE CHAVE',
               'CHAVE FENDE', 'LACRE SEGURANCA'],
      cat: 'utilidades', sub: 'ferramentas' },

    // ── UTILIDADES – Escritório ───────────────────────────────────────────
    { termos: ['PAPEL SULFITE', 'CANETA BIC', 'CANETA'],
      cat: 'utilidades', sub: 'escritorio' },

    // ── UTILIDADES – Ganchos e Fixadores ─────────────────────────────────
    { termos: ['GANCHO', 'GANCHOS', 'KIT GANCHOS', 'KIT GANCHO', 'GRANCHO'],
      cat: 'utilidades', sub: 'ganchos' },

    // ── UTILIDADES – Organização ──────────────────────────────────────────
    { termos: ['CAIXA ORGANIZADORA', 'ORGANIZADOR', 'VARAL'],
      cat: 'utilidades', sub: 'organiz-limpeza' },

    // ── UTILIDADES – Gerais ───────────────────────────────────────────────
    { termos: ['PRENDEDOR DE ROUPA', 'PRENDEDOR ROUPA', 'PRNDEDOR', 'PRENDEDORES',
               'TESOURA', 'GUARDA CHUVA', 'GARRAFA PLASTICO', 'BALANÇA', 'BALANCA',
               'RALO', 'TORNEIRA BEBEDOURA', 'ESPETO DE BAMBU', 'ESPETOS DE BAMBU',
               'PALITO DENTAL', 'AÇUCAR EM SACHE', 'ACUCAR EM SACHE', 'SAL EM SACHE',
               'FORRO DE PAPEL AIRFRYER', 'FORMA DESCARTAVEL', 'FORMA DE SILICONE',
               'KIT CONFEITEIRO', 'KIT VINHO', 'ACENDEDOR', 'MAÇARICO', 'ISQUEIRO BIC',
               'DESCASCADOR', 'ESPREMEDOR', 'CORTADOR', 'COLHER DE ARROZ', 'COLHER DE MADEIRA',
               'COLHER DE SILICONE', 'COLHER SILICONE', 'CONCHA', 'PEGADOR DE SALADA',
               'ESPATULA', 'PINCEL DE SILICONE', 'TABUA CARNE', 'SALADEIRA INOX',
               'PANEIRA', 'FORMA CESTO SILICONE', 'PROTETOT DE MOVEIS', 'PROTETOR RED',
               'PROTETOR DE FELTRO', 'PROTETOR DE SILICONE', 'ABRIDOR', 'RAQUETA FRESCOBOL',
               'RAQUETE ELETRICA', 'MULTI CORTADOR', 'AMACIADOR DE CARNE', 'PANEIRA DE INOX',
               'PANEIRA DE PLASTICO', 'FILTRO DE CAFE', 'SUPORTE FILTRO', 'FACA DE COZINHA',
               'FACA PEIXEIRA', 'CONJUNTOS P/CHURASCO', 'EXTENSOR P/TORNEIRAS',
               'PORTA DETERGENTE', 'PULVERIZADOR', 'BORRIFADOR', 'APULVERIZADOR',
               'VARAL DE PLASTICA', 'BACIA CANELADA', 'BACIA GRANDE', 'CESTA', 'CESTO MULTIUSO',
               'EXTENSAO', 'ALCA ADESIVA', 'VEDANTE', 'CALÇA P/PORTA', 'DESENTUPIDOR SANCHES'],
      cat: 'utilidades' },

    // ── ISOPOR – categoria própria (antes ficava escondida dentro de "Diversos") ──
    { termos: ['CAIXA TERMICA', 'MARMITEX DE ISOPOR', 'POTE ISOPOR', 'COPO ISOPOR', 'ISOPOR',
               'BANDEJA ISOPOR', 'ESTOJO ISOPOR', 'HAMBURGUEIRA'],
      cat: 'isopor', sub: 'isopor-geral' },

    // ── DIVERSOS – Embalagens Flexíveis ──────────────────────────────────
    { termos: ['PLASTICO BOLHA', 'FILME STRETCH', 'FILME PVC', 'FILME DE POLIESTER',
               'GUARUFILME', 'BOBINA PICOTADA', 'BOBINA PICOTADO', 'SACOS PLASTICO PEBD',
               'SACO PLASTICO PEBD', 'SACO HERMETICO', 'SACO ZIPBAG', 'SACO ZIP',
               'SACOS PARA TALHERES', 'SACO PARA GELADINHO', 'SACOS PARA GELADINHO',
               'SACO PLASTICO PE', 'SACO PLASTICO CRYSTAL'],
      cat: 'diversos', sub: 'emb-flexiveis' },

    // ── DIVERSOS – Embalagens Diversas ────────────────────────────────────
    { termos: ['GARRAFA PE', 'GARRAFA PET', 'BANDEJA BF', 'BANDEJA BR', 'BANDEJA B1',
               'BANDEJA B2', 'BANDEJA B3', 'MARMITA PRETA', 'ESTOJO BH', 'BH04', 'BH05',
               'BH-200', 'H101', 'CAIXA P/ COPINHO', 'PORTA P/2 COPOS',
               'SACO P/PRESENTE', 'SACO ZIP', 'PROTETOR DE FOGAO', 'EMPADA', 'HAMBURGUEIRA BH'],
      cat: 'diversos', sub: 'emb-diversas' },
  ];

  // ─── 3. MAPEAMENTO DE CATEGORIAS DO JSON → CATEGORIA DO SITE ───────────────
  // Fallback quando nenhuma regra de nome bater.

  const MAP_CATEGORIA = {
    'PRODUTO DE LIMPEZA': { cat: 'limpeza' },
    'SACO LIXO':          { cat: 'sacolas', sub: 'sacos-lixo' },
    'DESCARTAVEIS':       { cat: 'festa' },
    'PRODUTO DE HIGIENE': { cat: 'higiene' },
    'UTENSILIOS':         { cat: 'utilidades' },
    'PAPELARIA':          { cat: 'utilidades', sub: 'escritorio' },
    'Embalagem':          { cat: 'diversos' },
    'ALIMENTO/GENERO ALIMENTICIO': { cat: 'utilidades' },
    'Outras':             { cat: 'diversos', sub: 'outros' },
    'Subproduto':         { cat: 'diversos', sub: 'outros' },
    'Produção Interna':   { cat: 'diversos', sub: 'outros' },
  };

  // ─── 4. FUNÇÃO PRINCIPAL ────────────────────────────────────────────────────

  // ─── 0. REGRAS CUSTOMIZADAS (definidas pelo lojista no admin-foto.html) ────
  // Ficam em front-index/regras-menu.json. Têm prioridade sobre tudo abaixo,
  // porque são uma correção manual explícita pra um produto que caiu no
  // menu errado.
  let REGRAS_CUSTOM = [];

  async function carregarRegrasCustom() {
    try {
      const resp = await fetch('front-index/regras-menu.json?t=' + Date.now());
      if (resp.ok) {
        const dados = await resp.json();
        REGRAS_CUSTOM = Array.isArray(dados) ? dados : [];
      }
    } catch (e) {
      console.warn('regras-menu.json não encontrado — seguindo só com a organização automática.', e);
      REGRAS_CUSTOM = [];
    }
  }

  // Mesma lógica usada no admin-foto.html — se mudar aqui, replicar lá.
  function regraCustomBate(nomeUpper, regra) {
    const padrao = (regra.padrao || '').toUpperCase().trim();
    if (!padrao) return false;
    let idx;
    if (regra.tipo === 'contem') {
      idx = nomeUpper.indexOf(padrao);
      if (idx === -1) return false;
    } else {
      if (!nomeUpper.startsWith(padrao)) return false;
      idx = 0;
    }
    if (regra.seguidoNumero) {
      const prox = nomeUpper.charAt(idx + padrao.length);
      if (!/[0-9]/.test(prox)) return false;
    }
    return true;
  }

  /**
   * Recebe um objeto produto do JSON e retorna { cat, sub, marca }.
   * Ordem de prioridade: regra customizada do admin > regra de nome > JSON > fallback.
   */
  function mapearProduto(produto) {
    const nome = (produto.nome || '').toUpperCase();
    const catJson = produto.categoria || '';

    // 0. Regras customizadas do admin-foto.html têm prioridade máxima
    for (const r of REGRAS_CUSTOM) {
      if (regraCustomBate(nome, r)) {
        return { cat: r.cat, sub: r.sub || null, marca: r.marca || null };
      }
    }

    // 1. Verificar regras de nome
    for (const regra of REGRAS_NOME) {
      if (nomeContem(nome, ...regra.termos)) {
        return { cat: regra.cat, sub: regra.sub || null };
      }
    }

    // 2. Verificar categoria do JSON
    if (MAP_CATEGORIA[catJson]) {
      return {
        cat: MAP_CATEGORIA[catJson].cat,
        sub: MAP_CATEGORIA[catJson].sub || null,
      };
    }

    // 3. Fallback: diverse
    return { cat: 'diversos', sub: 'outros' };
  }

  // ─── 5. MARCA (FABRICANTE) ──────────────────────────────────────────────────
  // O produtos.json não tem campo de marca — o nome do fabricante vem
  // "grudado" no final do nome do produto (ex: "...C/24UN DANUBIO").
  // Lista curada com as marcas que aparecem nos produtos da loja.
  // Fácil de manter: só adicionar/remover nomes aqui quando um fornecedor
  // novo entrar (ou sair) do catálogo.
  const MARCAS_CONHECIDAS = [
    'BOM APETITE', 'COLOMBO/HELVIPACK', 'HELVIPACK', 'COLOMBO',
    'PRAFESTA', 'DANUBIO', 'WYDA', 'PLUMA', 'ARQPLAST', 'SANOL',
    'TALGE', 'ALKLIN', 'NIAGRA', 'TOTALPLAST', 'SANREMO', 'GALVONOTEK',
    'PLASUTIL', 'TRILHA', 'TINGS', 'MALUGER', 'FRATELLI', 'PLASNEW',
    'CLINK', 'ALFACELL', 'KEITA', 'MONALIZA', 'AZULIM', 'COPOBRAS',
    'COPABRAS', 'ISOTERM', 'ARMAZEM', 'COALA', 'SANCHES',
  ];
  // Ordena da mais longa pra mais curta, pra "BOM APETITE" ser testado
  // antes de um eventual "APETITE" sozinho, evitando bater errado.
  MARCAS_CONHECIDAS.sort(function(a, b) { return b.length - a.length; });

  /**
   * Recebe o nome do produto e devolve a marca conhecida no final dele,
   * ou '' se nenhuma marca da lista aparecer.
   */
  function extrairMarca(nome) {
    if (!nome) return '';
    const n = nome.toUpperCase().trim();
    for (const marca of MARCAS_CONHECIDAS) {
      if (n === marca || n.endsWith(' ' + marca)) return marca;
    }
    return '';
  }

  // Exporta globalmente para que os outros scripts possam usar
  global.mapearProduto        = mapearProduto;
  global.extrairMarca         = extrairMarca;
  global.carregarRegrasCustom = carregarRegrasCustom;

})(window);
