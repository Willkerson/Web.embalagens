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
