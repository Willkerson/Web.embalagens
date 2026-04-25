/* ═══════════════════════════════════════════════════════
   INTEGRACAO_PLANILHA.JS
   Motor de categorização automática + correção do CSV
   ═══════════════════════════════════════════════════════ */

/* ── REGRAS DE CATEGORIZAÇÃO AUTOMÁTICA ──────────────────
   Ordem importa: mais específico primeiro.
   Cada regra: { palavras:[], categoria:'', subcategoria:'' }
   O nome do produto é testado em UPPERCASE contra cada palavra.
   ─────────────────────────────────────────────────────── */
var REGRAS_CATEGORIA = [

  /* ── CAIXAS / CORREIO ─────────────────── */
  { p:['CAIXA P/CORREIO','CAIXA CORREIO','CAIXA ONDULADA N0','CAIXA ONDULADA N1',
       'CAIXA ONDULADA N2','CAIXA ONDULADA N3','CAIXA ONDULADA N4','CAIXA ONDULADA N5',
       'CAIXA PAP','CAIXA PAPELAO','CAIXA PAPELÃO'], c:'caixas', s:'caixas-correio' },

  /* ── CAIXAS / ALIMENTOS ───────────────── */
  { p:['CAIXA P/BOLO','CAIXA BOLO','CAIXA P/ BOLO','CAIXA TORTA',
       'CAIXA P/PIZZA','CAIXA PIZZA','CAIXA REDONDA P/PIZZA',
       'CAIXA P/ESFIHA','CAIXA P /ESFIHA','CAIXA P/SFIHA',
       'CAIXA DE BOLO','CAIXA P/ 25 CUPCAKES','CAIXA P/ COPINHO',
       'CAIXA P/HAMBURGUER','CAIXA HOT DOG'], c:'caixas', s:'caixas-alimentos' },

  /* ── SACOS DE LIXO ────────────────────── */
  { p:['SACO P/ LIXO','SACO P/LIXO','SACOS PARA LIXO','SACOS P/LIXO',
       'SACO DE LIXO','TOP LIXO','PACK LIXO','SACO LIXO'], c:'limpeza', s:'sacos-lixo' },

  /* ── SACOLAS PAPEL ────────────────────── */
  { p:['SACO KRAFT','SACO ECO KRAFT','SACO BRANCO KRAFT',
       'SACOLA KRAFT','SACOLA SOS','SACO SOS',
       'SACOLA S3 LISA','SACOLA P/1 GARRAFA'], c:'sacolas', s:'sacolas-papel' },

  /* ── SACOLAS PLÁSTICAS ────────────────── */
  { p:['SACOLA BRANCA 1KG','SACOLA PRETA','SACOLA VERDE',
       'SACOLA PLASTICA','SACOLA PLASTICO','SACOLA UNIDADE'], c:'sacolas', s:'sacolas-plasticas' },

  /* ── PLÁSTICOS / EMBALAGENS BOLO ─────── */
  { p:['GALVONOTEK','GALVONOTECK','GALVANOTEK','HIVERPACK','PACKFORM',
       'DONA RITA','TORTA ALTA','TORTA MEDIA','TORTA MINI','TORTA RET',
       'BOLO ALTA','BOLO MEDIA','BOLO TORRE','BOLO GR','ROCAMBOLE',
       'COLOMBA','FATIA DE TORTA','FATIA TORTA','EMBALAGEM PARA FATIA',
       'MINI TORTA','G32','G34','G37','G50','G56','G60','G63','G64',
       'G65','G70','G80','GA20','H70','H78','D32','D35','D50','D64',
       'PF-56','G235','G240','G316','G317','G318','G319','G320','G321',
       'G322','G323','G324','G325','G326','G327','G328','G329','G330',
       'G331','G333','G334','G335','G336','G337','G338'], c:'plastico', s:'embalagens-bolo' },

  /* ── PLÁSTICOS / POTES E TAMPAS ──────── */
  { p:['POTE E TAMPA','POTE REDONDO','POTE OVAL','POTE QUADRADO',
       'POTE TERMICO','MARMITA PRETA','KIT POTE','BARCA G PRETA',
       'SALADEIRA G PRETA','G680','G681','G682','D645','D695',
       'GOUR MAX','DANUBIO','CUMBUCA C/TAMPA','POTE ISOPOR'], c:'plastico', s:'potes-tampas' },

  /* ── PLÁSTICOS / GERAL ────────────────── */
  { p:['BLISTER','GARRAFA PE','TAMPA P/ POTE TERMICO',
       'TAMPA PP 90MM','D405','G540','POTE 100ML'], c:'plastico', s:'potes-tampas' },

  /* ── FESTA / COPOS E PRATOS ───────────── */
  { p:['COPO DESCARTAVEL','COPO 200ML','COPO 300ML','COPO E TAMPA',
       'COPO ISOPOR','COPO TERMICO','TAÇA','TACA',
       'PRATO BRANCO','PRATO RASO','PRATO FUNDO','PRATO QUADRADO',
       'PRATO DE ISOPOR','PRATO ISOPOR','BPR-23',
       'KIT FESTA','PANO DE PRATO'], c:'festa', s:'copos-pratos' },

  /* ── FESTA / TALHERES ─────────────────── */
  { p:['GARFO ','FACA REFEICAO','FACA REFEIÇÃO','FACA MASTER',
       'FACA REFEICAO','COLHER DE SOPA','COLHER MASTER','COLHER BRANCA',
       'COLHER SOBREMESA','COLHER LITTLE','KIT GARFO','KIT GARFO E FACA',
       'MEXEDOR DRINK','MEXEDOR PARA CAFE','MEXEDOR CAFÉ',
       'CANUDO'], c:'festa', s:'talheres' },

  /* ── LIMPEZA / EPI ────────────────────── */
  { p:['LUVA LATEX','LUVA NITRILICA','LUVA NITRILICA','LUVA PLASTICA',
       'LUVA DE VINIL','LUVA NUTRILICA','LUVAS NITRILICA',
       'TOUCA DESCARTAVEL','TOUCAS DESCARTAVEIS',
       'AVENTAL','MASCARA DESCARTAVEL'], c:'limpeza', s:'epi' },

  /* ── LIMPEZA / UTENSÍLIOS ─────────────── */
  { p:['VASSOURA','RODO ','RODO ALUMINIO','REFIL RODO','MEGA RODO',
       'MOP ','ESPONJA ','ESPONJAS','FIBRA LIMP','FIBRA BRANCA',
       'PANO DE CHAO','PANO PARA PIA','PANO PANOTEK','PANO MULTIUSO',
       'ESCOVA SANITARIA','ESCOVA USO GERAL','ESCOVAO',
       'PANO BRANCO MULTIUSO','CABO DE ALUMINIO','CABO DE MADEIRA',
       'CABO EXTENSOR','REFIL RODO'], c:'limpeza', s:'utensilios-limpeza' },

  /* ── LIMPEZA / PRODUTOS QUÍMICOS ──────── */
  { p:['AGUA SANITARIA','ALCOOL 70','ALCOOL LIQUIDO','ALVEJANTE',
       'AMACIANTE','DESINFETANTE','DESENGORDURANTE','DETERGENTE',
       'LAVA ROUPAS','LIMPADOR CONCENTRADO','LIMPADOR PERF',
       'LIMPADOR GEL','LIMPA AZULEJO','LIMPA CERAMICAS',
       'LIMPA PEDRAS','LIMPA PISO','LIMPA PISOS','LIMPA VIDRO',
       'LIMPA VIDROS','LIMPA TELAS','LIMPA TETO','LIMPA AZULEJO',
       'MULTIUSO','NAFTALINA','QUEROSENE','REMOVEDOR',
       'SAPONACEO','TIRA FERRUGEM','TIRA LIMO','FLOTADOR',
       'DESENGORDURANTE','DESENTUPIDOR','LIMPEZA PESADA',
       'MAXIMOOM','MAGICO REMOVEDOR','CERA AUTO',
       'LUSTRA MOVEIS','BRILHO INOX','PEDRA SANITARIA',
       'PORTA DETERGENTE','PASS CERA','PASTA DE BRILHO',
       'LIMPA AZULEJO','LIMPA CERAMICA','ESCOVA MULTIUSO',
       'ESPONJA LIMPEZA','ESPONJA MULTIUSO','LIMPA PEDRA',
       'CESTO MULTIUSO ROUPAS'], c:'limpeza', s:'produtos-limpeza' },

  /* ── HIGIENE / PAPEL ──────────────────── */
  { p:['PAPEL HIGIENICO','PAPEL HIG','TOALHA INTERFOLHA',
       'TOALHA DE PAPEL','TOALHA BOBINA','GUARDANAPO',
       'PAPEL TOALHA','LENCOL HOSPITALAR','PAPEL INTERFOLHADO',
       'PAPEL SEMIKRAFT','PAPEL SULFITE',
       'SABONETE LIQ','SABAO EM PO','SABÃO EM PO',
       'DISPENSER ','DISPNSER'], c:'higiene', s:'papel-higiene' },

  /* ── UTILIDADES / PILHAS ──────────────── */
  { p:['PILHA ','BATERIA ALCALINA','BATERIA LITHIUM','BATERIA LITIO',
       'BATERIA CARGA','ALFACELL CARGA','ISQUEIRO'], c:'utilidades', s:'pilhas-baterias' },

  /* ── UTILIDADES / AROMAS/INSETICIDAS ─── */
  { p:['AROMATIZADOR','ODORIZADOR','ODORIZANTE','INSETICIDA',
       'MULTI-INSETICIDA','NEUTRALIZADOR DE ODORES',
       'REPELENTE','RAQUETE ELETRICA','MATA MASCA',
       'BARATAS E FORMIGAS'], c:'utilidades', s:'aromas-inseticidas' },

  /* ── UTILIDADES / ORGANIZAÇÃO ─────────── */
  { p:['BALDE ','BACIA ','LIXEIRA','CESTO PLASTICO',
       'RALO ','PRENDEDOR','VARAL','PRNDEDOR'], c:'utilidades', s:'organiz-limpeza' },

  /* ── UTILIDADES / FERRAMENTAS ─────────── */
  { p:['ESTILETE','LAMINA P/ESTILETE','CHAVE DE VENDA',
       'FITA ADESIVA','PAPELAO ONDULADO'], c:'utilidades', s:'ferramentas' },

  /* ── UTILIDADES / ESCRITÓRIO ──────────── */
  { p:['FITA ADESIVA','FITA REMOVIVEL','PAPEL DE PRESENTE',
       'CANETA BIC'], c:'utilidades', s:'escritorio' },

  /* ── UTILIDADES / GANCHOS ─────────────── */
  { p:['GANCHO ','GANCHOS ','KIT GANCHO','KIT GANCHOS',
       'KITA GANCHOS','PLASTIC COATED IRON HOOK'], c:'utilidades', s:'ganchos' },

  /* ── DIVERSOS / ISOPOR ────────────────── */
  { p:['MARMITEX DE ISOPOR','MARMITEX ISOPOR',
       'HAMBURGUEIRA BH','HAMBURGUEIRA H0','HAMBURGUEIRA H1','HAMBURGUEIRA H2',
       'HAMBURGUEIRA GA','ESTOJO ISOPOR',
       'BANDEJA B1','BANDEJA B3','BANDEJA BF','BANDEJA BR',
       'BANDEJA ISOPOR','BH-05','BH102',
       'CAIXA TERMICA ISOPOR','POTE ISOPOR',
       'DISCO ISOPOR'], c:'diversos', s:'isopor-geral' },

  /* ── DIVERSOS / EMBALAGENS FLEXÍVEIS ─── */
  { p:['BOBINA PICOTADA','FILME PVC','FILME STRETCH','GUARUFILME',
       'GUARUFILME','PLASTICO BOLHA','SACO PLASTICO PEBD','SACOS PLASTICO PEBD',
       'SACO HERMETICO','SACO PARA GELADINHO','SACO PLASTICO PE',
       'LACRE SEGURANCA','PAPEL ANTIADERENTE','PAPEL ACOPLADO',
       'PAPEL MANTEIGA','PROTETOR DE FOGAO','FOLHA DE ALUMINIO',
       'FOLHA ALUMINIO','D10FS','D12 ','D12FS','D5 ','D6 ',
       'D6FS','D7 ','D7FS','D8 ','D2 ','D166','DSMFS',
       'FILM PVC','SUPERALPFILM','GUARUFILME'], c:'diversos', s:'emb-flexiveis' },

  /* ── DIVERSOS / EMBALAGENS DIVERSAS ──── */
  { p:['ASSADEIRA DE ALUMINIO','COPO TERMICO',
       'EMPADA MEDIA','EMPADA PEQUENA',
       'ESPETO DE BAMBU','ESPETOS DE BAMBU',
       'BLISTER PARA DOCES','FORMINHA DE PAPEL',
       'GARRAFA PE','D305','D650','D181',
       'PORTA P/2 COPOS','TAMPA P/ COPO TERMICO',
       'TAMPA PP 90MM','FORMA DESCARTAVEL',
       'FORMA CESTO SILICONE','FORMA DE SILICONE',
       'FORRO DE PAPEL AIRFRYER','AMARRILHO'], c:'diversos', s:'emb-diversas' },
];

/* ── ENGINE DE CATEGORIZAÇÃO ─────────────────────────── */
function categorizarProduto(nome) {
  var u = (nome || '').toUpperCase();
  for (var i = 0; i < REGRAS_CATEGORIA.length; i++) {
    var r = REGRAS_CATEGORIA[i];
    for (var j = 0; j < r.p.length; j++) {
      if (u.indexOf(r.p[j]) !== -1) {
        return { categoria: r.c, subcategoria: r.s };
      }
    }
  }
  // fallback
  return { categoria: 'diversos', subcategoria: 'outros' };
}

/* ── CORRIGIR CATEGORIAS DOS PRODUTOS JÁ CARREGADOS ──── */
(function corrigirCategorias() {
  if (!window.listaProdutosPlanilha) return;
  window.listaProdutosPlanilha.forEach(function(p) {
    var cat = categorizarProduto(p.nome);
    p.categoria    = cat.categoria;
    p.subcategoria = cat.subcategoria;
  });
})();

/* ── CARREGA CSV E ATUALIZA PREÇOS / NOVOS PRODUTOS ───── */
async function carregarEAtualizarPrecos() {
  try {
    var url = 'precos.csv?v=' + Date.now();
    var resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error('CSV nao encontrado');
    var texto = await resp.text();

    var linhas = texto.trim().split('\n').slice(1);
    var precosCSV = {};
    linhas.forEach(function(linha) {
      var partes = linha.split('\t');
      if (partes.length < 2) partes = linha.split(',');
      if (partes.length < 2) return;
      var nome  = partes[0].replace(/"/g,'').trim().toUpperCase();
      var valor = partes[1].replace(/"/g,'').replace(',','.').trim();
      var preco = parseFloat(valor);
      if (nome && !isNaN(preco)) precosCSV[nome] = preco;
    });

    console.log('CSV: ' + Object.keys(precosCSV).length + ' precos carregados');

    if (typeof window.listaProdutosPlanilha !== 'undefined') {
      var atualizados = 0, adicionados = 0;
      var mapaExistentes = new Set(
        window.listaProdutosPlanilha.map(function(p){ return p.nome.toUpperCase(); })
      );

      /* 1. Atualiza preços existentes */
      window.listaProdutosPlanilha.forEach(function(p) {
        var chave = p.nome.toUpperCase();
        if (precosCSV[chave] !== undefined) {
          p.preco = precosCSV[chave];
          atualizados++;
        }
      });

      /* 2. Adiciona novos produtos do CSV com categorização automática */
      Object.keys(precosCSV).forEach(function(nomeCSV) {
        if (!mapaExistentes.has(nomeCSV)) {
          var novoId = 9000 + adicionados;
          var nomeFormatado = nomeCSV.charAt(0) + nomeCSV.slice(1).toLowerCase();
          var cat = categorizarProduto(nomeCSV); // ← categoriza automaticamente
          window.listaProdutosPlanilha.push({
            id:          novoId,
            nome:        nomeFormatado,
            categoria:   cat.categoria,
            subcategoria:cat.subcategoria,
            preco:       precosCSV[nomeCSV],
            unidade:     '/unidade'
          });
          adicionados++;
        }
      });

      /* 3. Re-categoriza TUDO (garante consistência mesmo nos antigos) */
      window.listaProdutosPlanilha.forEach(function(p) {
        var cat = categorizarProduto(p.nome);
        p.categoria    = cat.categoria;
        p.subcategoria = cat.subcategoria;
      });

      console.log(atualizados + ' atualizados | ' + adicionados + ' novos adicionados');
    }
  } catch(e) {
    console.warn('CSV nao lido:', e.message);
  }

  if (typeof window.renderizarProdutos === 'function') {
    window.renderizarProdutos();
  }
}

/* ── INIT ─────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
