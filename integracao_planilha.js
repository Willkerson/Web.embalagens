// integracao_planilha.js
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

    if (typeof listaProdutosPlanilha !== 'undefined') {
        listaProdutosPlanilha.forEach(p => {
          const nomeUpper = p.nome.toUpperCase();
          if (precosCSV[nomeUpper] !== undefined) {
            p.preco = precosCSV[nomeUpper];
          }
        });
    }
    
    // Atualiza a tela com os preços novos
    if (typeof renderizarProdutos === 'function') renderizarProdutos();
    console.log("✓ Preços atualizados via CSV!");

  } catch (e) {
    console.warn('Erro ao ler CSV, usando preços base da planilha.', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
