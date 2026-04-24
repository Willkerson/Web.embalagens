async function carregarEAtualizarPrecos() {
  try {
    const resp = await fetch('precos.csv');
    if (!resp.ok) throw new Error('CSV não encontrado');
    const texto = await resp.text();
    const linhas = texto.trim().split('\n').slice(1);

    const precosCSV = {};
    linhas.forEach(linha => {
      const partes = linha.match(/"([^"]+)"/g) || linha.split(',');
      if (!partes || partes.length < 2) return;
      const nome  = partes[0].replace(/"/g, '').trim().toUpperCase();
      const valor = partes[1].replace(/"/g, '').replace(',', '.').trim();
      precosCSV[nome] = parseFloat(valor) || 0;
    });

    // Procura na variável 1
    if (typeof listaProdutosPlanilha !== 'undefined') {
        listaProdutosPlanilha.forEach(p => {
          const nomeUpper = p.nome.toUpperCase();
          if (precosCSV[nomeUpper] !== undefined) p.preco = precosCSV[nomeUpper];
        });
    }
    
    // Procura na variável 2 (Garante que acha de qualquer jeito)
    if (typeof listaProdutos !== 'undefined') {
        listaProdutos.forEach(p => {
          const nomeUpper = p.nome.toUpperCase();
          if (precosCSV[nomeUpper] !== undefined) p.preco = precosCSV[nomeUpper];
        });
    }
    
    console.log("✓ Preços atualizados via CSV!");

  } catch (e) {
    console.warn('CSV não lido. Usando os preços originais do arquivo.', e);
  } finally {
    // Atualiza a tela independentemente de ter achado o CSV ou não
    if (typeof renderizarProdutos === 'function') renderizarProdutos();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
