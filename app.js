console.log("APP CARREGOU");

let produtos = [];
let produtoAtual = null;
let quantidade = 1;

// CARREGA PRODUTOS
fetch("front-index/produtos.json")
.then(r => r.json())
.then(data => {
produtos = data;
console.log("Produtos:", produtos.length);
});

// BUSCA
document.getElementById("busca").addEventListener("input", (e) => {

const termo = e.target.value.toLowerCase();

const div = document.getElementById("resultados");

if (termo.length < 2) {
div.innerHTML = "";
return;
}

const encontrados = produtos.filter(p =>
(p.nome || "").toLowerCase().includes(termo) ||
String(p.codigo).includes(termo)
);

div.innerHTML = "";

encontrados.slice(0, 10).forEach(p => {

div.innerHTML += `
<div class="card resultado"
onclick="abrirProduto('${p.codigo}')">

<b>${p.nome}</b><br>
Código: ${p.codigo}

</div>
`;

});

});

// ABRIR ESTILO IFOOD
function abrirProduto(codigo){

produtoAtual = produtos.find(p =>
String(p.codigo) === String(codigo)
);

if(!produtoAtual) return;

quantidade = 1;

document.getElementById("nomeProduto").innerText = produtoAtual.nome;
document.getElementById("estoqueProduto").innerText = produtoAtual.estoque || 0;
document.getElementById("qtd").innerText = quantidade;

document.getElementById("painelProduto").style.display = "block";

document.getElementById("resultados").innerHTML = "";
document.getElementById("busca").value = "";
}

function aumentar(){
quantidade++;
document.getElementById("qtd").innerText = quantidade;
}

function diminuir(){
if(quantidade > 1) quantidade--;
document.getElementById("qtd").innerText = quantidade;
}

function confirmar(tipo){

if(!produtoAtual) return;

alert(
`${tipo.toUpperCase()} enviado:\n${produtoAtual.nome}\nQtd: ${quantidade}`
);

// aqui depois você salva no backend

fecharPainel();
}

function fecharPainel(){
document.getElementById("painelProduto").style.display = "none";
produtoAtual = null;
quantidade = 1;
}
