async function carregarEAtualizarPrecos() {
  try {
    // Força o browser a sempre buscar o CSV mais recente
    const url = 'precos.csv?v=' + Date.now();
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error('CSV nao encontrado');
    const texto = await resp.text();

    // Remove a primeira linha (cabeçalho) e processa
    const linhas = texto.trim().split('\n').slice(1);
    const precosCSV = {};

    linhas.forEach(linha => {
      // Tenta separar por tab ou vírgula
      let partes = linha.split('\t');
      if (partes.length < 2) partes = linha.split(',');
      if (partes.length < 2) return;

      const nome = partes[0].replace(/"/g, '').trim().toUpperCase();
      const valor = partes[1].replace(/"/g, '').replace(',', '.').trim();
      const preco = parseFloat(valor);

      if (nome && !isNaN(preco)) {
        precosCSV[nome] = preco;
      }
    });

    console.log('CSV:', Object.keys(precosCSV).length, 'precos carregados');

    if (typeof window.listaProdutosPlanilha !== 'undefined') {
      let atualizados = 0;
      let adicionados = 0;

      // Cria um mapa rápido dos produtos existentes para checagem
      const mapaProdutosExistentes = new Set(
        window.listaProdutosPlanilha.map(p => p.nome.toUpperCase())
      );

      // 1. Atualiza os preços dos itens que JÁ EXISTEM
      window.listaProdutosPlanilha.forEach(p => {
        const chave = p.nome.toUpperCase();
        if (precosCSV[chave] !== undefined) {
          p.preco = precosCSV[chave];
          atualizados++;
        }
      });

      // 2. Adiciona os itens NOVOS encontrados no CSV
      Object.keys(precosCSV).forEach(nomeCSV => {
        if (!mapaProdutosExistentes.has(nomeCSV)) {
          // Determina um ID provisório e informações genéricas para o novo item
          const novoId = 9000 + adicionados; 
          
          // Formata o nome para ficar mais bonito (Primeira letra maiúscula)
          const nomeFormatado = nomeCSV.charAt(0).toUpperCase() + nomeCSV.slice(1).toLowerCase();

          window.listaProdutosPlanilha.push({
            id: novoId,
            nome: nomeFormatado,
            categoria: 'diversos', // Categoria padrão para itens novos
            subcategoria: 'outros',
            preco: precosCSV[nomeCSV],
            unidade: '/unidade',
            marca: 'OUTRAS' // Mantendo o padrão do script anterior
          });
          adicionados++;
        }
      });

      console.log(`${atualizados} preços atualizados e ${adicionados} novos produtos adicionados do CSV.`);
    }
  } catch (e) {
    console.warn('CSV nao lido:', e.message);
  }

  // Re-renderiza a tela com os dados atualizados (e os novos itens)
  if (typeof window.renderizarProdutos === 'function') {
    window.renderizarProdutos();
  }
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
