/*
  integracao_planilha.js â€” versÃ£o corrigida
  Carrega o precos.csv, atualiza os preÃ§os e garante que
  renderizarProdutos() seja chamado DEPOIS que tudo estÃ¡ pronto.
*/

async function carregarEAtualizarPrecos() {
  try {
    const resp = await fetch('precos.csv');
    if (!resp.ok) throw new Error('CSV nao encontrado');
    const texto = await resp.text();

    // O CSV tem separador TAB (nao virgula)
    const linhas = texto.trim().split('\n').slice(1);
    const precosCSV = {};

    linhas.forEach(linha => {
      // Tenta separar por TAB primeiro, depois por virgula
      let partes = linha.split('\t');
      if (partes.length < 2) partes = linha.split(',');
      if (partes.length < 2) return;

      const nome  = partes[0].replace(/"/g, '').trim().toUpperCase();
      const valor = partes[1].replace(/"/g, '').replace(',', '.').trim();
      const preco = parseFloat(valor);
      if (nome && !isNaN(preco)) precosCSV[nome] = preco;
    });

    console.log('CSV carregado:', Object.keys(precosCSV).length, 'precos');

    // Atualiza precos da listaProdutosPlanilha
    if (typeof window.listaProdutosPlanilha !== 'undefined') {
      let atualizados = 0;
      window.listaProdutosPlanilha.forEach(p => {
        const chave = p.nome.toUpperCase();
        if (precosCSV[chave] !== undefined) {
          p.preco = precosCSV[chave];
          atualizados++;
        }
      });
      console.log(atualizados, 'precos atualizados');
    }

  } catch (e) {
    console.warn('CSV nao lido, usando precos do JS:', e.message);
  }

  // Sempre renderiza
  if (typeof renderizarProdutos === 'function') {
    renderizarProdutos();
  }
}

// Aguarda DOM + scripts prontos
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
