async function carregarEAtualizarPrecos() {
  try {
    // For�a o browser a sempre buscar o CSV mais recente
    const url = 'precos.csv?v=' + Date.now();
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error('CSV nao encontrado');
    const texto = await resp.text();

    const linhas = texto.trim().split('\n').slice(1); // Pula o cabe�alho
    const precosCSV = {};
    const produtosOcultos = new Set(); // Guarda os produtos comentados com //

    linhas.forEach(linha => {
      const linhaLimpa = linha.trim();
      if (!linhaLimpa) return;

      // Verifica se voc� colocou // para ocultar o produto
      const isOculto = linhaLimpa.startsWith('//');

      // Se tiver //, tira s� para a gente saber o nome de quem vamos ocultar
      let linhaProcessar = isOculto ? linhaLimpa.substring(2) : linhaLimpa;

      let partes = linhaProcessar.split('\t');
      if (partes.length < 2) partes = linhaProcessar.split(',');
      if (partes.length < 2) return;

      const nome = partes[0].replace(/"/g, '').trim().toUpperCase();

      if (isOculto) {
        // Se a linha come�ar com //, joga na lista negra e n�o cadastra o pre�o
        if (nome) produtosOcultos.add(nome);
        return; 
      }

      const valor = partes[1].replace(/"/g, '').replace(',', '.').trim();
      const preco = parseFloat(valor);

      if (nome && !isNaN(preco)) {
        precosCSV[nome] = preco;
      }
    });

    console.log('CSV:', Object.keys(precosCSV).length, 'pre�os ativos carregados');

    if (typeof window.listaProdutosPlanilha !== 'undefined') {
      let atualizados = 0;
      let adicionados = 0;

      // 1. OCULTA OS PRODUTOS CANCELADOS (Comentados com // no CSV)
      window.listaProdutosPlanilha = window.listaProdutosPlanilha.filter(p => {
        return !produtosOcultos.has(p.nome.toUpperCase());
      });

      // Mapeia o que sobrou
      const mapaProdutosExistentes = new Set(
        window.listaProdutosPlanilha.map(p => p.nome.toUpperCase())
      );

      // 2. ATUALIZA OS PRE�OS DOS ITENS ATIVOS
      window.listaProdutosPlanilha.forEach(p => {
        const chave = p.nome.toUpperCase();
        if (precosCSV[chave] !== undefined) {
          p.preco = precosCSV[chave];
          atualizados++;
        }
      });

      // 3. ADICIONA NOVOS PRODUTOS (Que n�o est�o no JS, mas est�o no CSV)
      Object.keys(precosCSV).forEach(nomeCSV => {
        if (!mapaProdutosExistentes.has(nomeCSV)) {
          const novoId = 9000 + adicionados; 
          const nomeFormatado = nomeCSV.charAt(0).toUpperCase() + nomeCSV.slice(1).toLowerCase();

          window.listaProdutosPlanilha.push({
            id: novoId,
            nome: nomeFormatado,
            categoria: 'diversos',
            subcategoria: 'outros',
            preco: precosCSV[nomeCSV],
            unidade: '/unidade',
            marca: 'OUTRAS'
          });
          adicionados++;
        }
      });

      console.log(`Sucesso: ${atualizados} atualizados, ${adicionados} novos, ${produtosOcultos.size} ocultados.`);
    }
  } catch (e) {
    console.warn('Falha na integra��o do CSV:', e.message);
  }

  // Re-renderiza a tela
  if (typeof window.renderizarProdutos === 'function') {
    window.renderizarProdutos();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', carregarEAtualizarPrecos);
} else {
  carregarEAtualizarPrecos();
}
