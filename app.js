let produtos = [];
let carrinho = [];

// CARREGA PRODUTOS
fetch("front-index/produtos.json")
.then(r => {
if (!r.ok) {
throw new Error("Não foi possível carregar produtos.json");
}
return r.json();
})
.then(data => {
produtos = data;
console.log("Produtos carregados:", produtos.length);
})
.catch(err => {
console.error(err);

```
document.getElementById("resultados").innerHTML =
  "<div class='card'>Erro ao carregar produtos.json</div>";
```

});

const busca = document.getElementById("busca");

// BUSCA COM SUGESTÕES
busca.addEventListener("input", () => {

const termo = busca.value.toLowerCase().trim();

const div = document.getElementById("resultados");

if (termo.length < 2) {
div.innerHTML = "";
return;
}

const encontrados = produtos.filter(produto => {

```
const nome = (produto.nome || "").toLowerCase();
const codigo = String(produto.codigo || "");

return (
  nome.includes(termo) ||
  codigo.includes(termo)
);
```

});

mostrarSugestoes(encontrados);

});

function mostrarSugestoes(lista) {

const div = document.getElementById("resultados");

div.innerHTML = "";

if (!lista.length) {

```
div.innerHTML = `
  <div class="card">
    Nenhum produto encontrado
  </div>
`;

return;
```

}

lista.slice(0, 10).forEach(produto => {

```
div.innerHTML += `
  <div
    class="card resultado"
    onclick="selecionarProduto('${produto.codigo}')"
  >
    <b>${produto.nome}</b>
    <br>
    Código: ${produto.codigo}
  </div>
`;
```

});

}

function selecionarProduto(codigo) {

const produto = produtos.find(
p => String(p.codigo) === String(codigo)
);

if (!produto) return;

document.getElementById("busca").value = produto.nome;

const div = document.getElementById("resultados");

div.innerHTML = ` <div class="card">

```
  <h3>${produto.nome}</h3>

  <p>
    Código: ${produto.codigo}
  </p>

  <p>
    Estoque atual: ${produto.estoque || 0}
  </p>

  <label>Quantidade</label>

  <input
    type="number"
    min="1"
    value="1"
    id="qtd_${produto.codigo}"
  >

  <label>Movimento</label>

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
```

`;
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

document.getElementById("busca").value = "";
document.getElementById("resultados").innerHTML = "";

renderCarrinho();
}

function renderCarrinho() {

const div = document.getElementById("carrinho");

div.innerHTML = "";

if (!carrinho.length) {

```
div.innerHTML = `
  <div class="card">
    Carrinho vazio
  </div>
`;

return;
```

}

carrinho.forEach((item, index) => {

```
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

    Estoque atual: ${atual}

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
```

});

}

function removerCarrinho(index) {

carrinho.splice(index, 1);

renderCarrinho();
}

async function enviarMovimentacao() {

if (!carrinho.length) {

```
alert("Carrinho vazio");

return;
```

}

console.table(carrinho);

alert(
`Movimentação pronta.\n\nProdutos: ${carrinho.length}`
);

// FUTURO:
// enviar para GitHub Action
// acionar Playwright
// registrar no ConnectPlug
}
