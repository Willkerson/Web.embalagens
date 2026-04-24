async function carregarEAtualizarPrecos() {
  try {
    // O ?v= com timestamp força o browser a sempre buscar o CSV mais recente
    // sem isso, o browser usa o cache e ignora mudanças no arquivo
    const url = 'precos.csv?v=' + Date.now();
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error('CSV nao encontrado');
    const texto = await resp.text();

    const linhas = texto.trim().split('\n').slice(1);
    const precosCSV = {};

    linhas.forEach(linha => {
      let partes = linha.split('\t');
      if (partes.length < 2) partes = linha.split(',');
      if (partes.length < 2) return;
      const nome  = partes[0].replace(/"/g, '').trim().toUpperCase();
      const valor = partes[1].replace(/"/g, '').replace(',', '.').trim();
      const preco = parseFloat(valor);
      if (nome && !isNaN(preco)) precosCSV[nome] = preco;
    });

    console.log('CSV:', Object.keys(precosCSV).length, 'precos carregados');

    if (typeof listaProdutosPlanilha !== 'undefined') {
      let n = 0;
      listaProdutosPlanilha.forEach(p => {
        const chave = p.nome.toUpperCase();
        if (precosCSV[chave] !== undefined) { p.preco = precosCSV[chave]; n++; }
      });
      console.log(n, 'precos atualizados do CSV');
    }
  } catch (e) {
    console.warn('CSV nao lido:', e.message);
  }

  if (typeof renderizarProdutos === 'function') renderizarProdutos();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
