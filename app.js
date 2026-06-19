let produtos = [];
let carrinho = [];

// CARREGA PRODUTOS
fetch("front-index/produtos.json")
  .then(r => {
    console.log("STATUS:", r.status);

    if (!r.ok) {
      throw new Error("Não foi possível carregar produtos.json");
    }

    return r.json();
  })
  .then(data => {
    console.log("Produtos carregados:", data.length);
    console.log("Primeiro produto:", data[0]);

    produtos = data;
  })
  .catch(err => {
    console.error("Erro:", err);

    document.getElementById("resultados").innerHTML =
      "<div class='card'>Erro ao carregar produtos.json</div>";
  });

const busca = document.getElementById("busca");

busca.addEventListener("input", () => {

  if (!produtos.length) {
    return;
  }

  const termo = busca.value.toLowerCase().trim();

  if (termo.length < 2) {
    document.getElementById("resultados").innerHTML = "";
    return;
  }

  const encontrados = produtos.filter(produto =>
    produto.nome &&
    produto.nome.toLowerCase().includes(termo)
  );

  mostrarResultados(encontrados);
});

function mostrarResultados(lista) {

  const div = document.getElementById("resultados");

  div.innerHTML = "";

  if (!lista.length) {

    div.innerHTML = `
      <div class="card">
        Nenhum produto encontrado.
      </div>
    `;

    return;
  }

  lista.slice(0, 20).forEach(produto => {

    div.innerHTML += `
      <div class="card resultado">

        <b>${produto.nome}</b>

        <br>

        Código:
        ${produto.codigo}

        <br>

        Estoque:
        ${produto.estoque || "0"}

        <br><br>

        Quantidade:

        <input
          type="number"
          min="1"
          id="qtd_${produto.codigo}"
          value="1"
        >

        <select id="tipo_${produto.codigo}">
          <option value="entrada">
            Entrada
          </option>

          <option value="saida">
            Saída
          </option>
        </select>

        <button
          onclick="adicionarCarrinho('${produto.codigo}')"
        >
          Adicionar ao Carrinho
        </button>

      </div>
    `;
  });
}

function adicionarCarrinho(codigo) {

  const produto = produtos.find(
    p => String(p.codigo) === String(codigo)
  );

  if (!produto) {
    alert("Produto não encontrado");
    return;
  }

  const quantidade = Number(
    document.getElementById(`qtd_${codigo}`).value
  );

  const tipo = document.getElementById(
    `tipo_${codigo}`
  ).value;

  carrinho.push({
    codigo: produto.codigo,
    nome: produto.nome,
    estoque: produto.estoque || "0",
    quantidade,
    tipo
  });

  renderCarrinho();
}

function renderCarrinho() {

  const div = document.getElementById("carrinho");

  div.innerHTML = "";

  if (!carrinho.length) {

    div.innerHTML = `
      <div class="card">
        Carrinho vazio
      </div>
    `;

    return;
  }

  carrinho.forEach((item, index) => {

    const atual = parseFloat(
      String(item.estoque)
        .replace(" un", "")
        .replace(",", ".")
    ) || 0;

    const futuro =
      item.tipo === "entrada"
        ? atual + item.quantidade
        : atual - item.quantidade;

    div.innerHTML += `
      <div class="card carrinho">

        <b>${item.nome}</b>

        <br>

        Estoque atual:
        ${atual}

        <br>

        Movimento:
        ${item.tipo === "entrada" ? "+" : "-"}
        ${item.quantidade}

        <br>

        Estoque previsto:
        ${futuro}

        <br><br>

        <button
          class="remover"
          onclick="removerCarrinho(${index})"
        >
          Remover
        </button>

      </div>
    `;
  });
}

function removerCarrinho(index) {

  carrinho.splice(index, 1);

  renderCarrinho();
}

async function enviarMovimentacao() {

  if (!carrinho.length) {

    alert("Carrinho vazio");

    return;
  }

  console.log("Itens enviados:");

  console.table(carrinho);

  alert(
    `Movimentação pronta.\n\nProdutos: ${carrinho.length}`
  );

  // FUTURO:
  // enviar para GitHub Action
  // acionar Playwright
  // registrar no ConnectPlug
}
