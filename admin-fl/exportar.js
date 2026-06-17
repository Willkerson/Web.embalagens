const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  console.log('================================');
  console.log('1. Faça login no ConnectPlug');
  console.log('2. Quando terminar, volte ao terminal');
  console.log('3. Aperte ENTER');
  console.log('================================');

  await page.goto('https://connectplug.com.br');

  await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', () => resolve());
  });

  const todosProdutos = [];

  for (let pagina = 1; pagina <= 35; pagina++) {
    console.log(`Capturando página ${pagina}...`);

    await page.goto(
      `https://connectplug.com.br/sistema/produtos?order_col=code&order=asc&index_service=0&page=${pagina}`,
      { waitUntil: 'networkidle' }
    );
     const produtos = await page.$$eval(
  'table tbody tr',
  rows =>
    rows.map(tr => {
      const cols = tr.querySelectorAll('td');

      const linkProduto = tr.querySelector('a[class^="product_"]');

      let id = '';

      if (linkProduto) {
        const match = linkProduto.href.match(/editar\/(\d+)/);

        if (match) {
          id = match[1];
        }
      }
      return {
        id,
        codigo: cols[1]?.innerText.trim() || '',
             nome: cols[2]?.innerText.trim() || '',
             categoria: cols[3]?.innerText.trim() || '',
             preco: cols[7]?.innerText.trim() || '',
             estoque: (cols[8]?.innerText || '')
             .replace(' un', '')
             .replace(',', '.')
             .trim()
      };
    })
);
    console.log(
      `Página ${pagina}: ${produtos.length} produtos`
    );

    todosProdutos.push(...produtos);
  }

  fs.writeFileSync(
    'produtos.json',
    JSON.stringify(todosProdutos, null, 2),
    'utf8'
  );

  console.log('================================');
  console.log(`Total capturado: ${todosProdutos.length}`);
  console.log('Arquivo salvo: produtos.json');
  console.log('================================');

  // Mantém navegador aberto
  await new Promise(() => {});
})();
