console.log("APP OK");

let produtos = [];
let carrinho = [];
let atual = null;
let qtd = 1;

// LOAD
fetch("front-index/produtos.json")
.then(r => r.json())
.then(data => produtos = data);

// BUSCA
document.getElementById("busca").addEventListener("input", (e) => {

const t = e.target.value.toLowerCase();

const div = document.getElementById("resultados");

if(t.length < 2){
div.innerHTML = "";
return;
}

const res = produtos.filter(p =>
(p.nome || "").toLowerCase().includes(t) ||
String(p.codigo).includes(t)
);

div.innerHTML = "";

res.slice(0, 10).forEach(p => {

div.innerHTML += `
<div class="card resultado"
onclick="abrir('${p.codigo}')">

<b>${p.nome}</b><br>
<span class="small">${p.codigo}</span>

</div>
`;

});

});

// ABRIR PAINEL
function abrir(codigo){

atual = produtos.find(p => String(p.codigo) === String(codigo));

qtd = 1;

document.getElementById("nome").innerText = atual.nome;
document.getElementById("estoque").innerText = atual.estoque || 0;
document.getElementById("qtd").innerText = qtd;

document.getElementById("painel").style.display = "block";
document.getElementById("resultados").innerHTML = "";
document.getElementById("busca").value = "";
}

function mais(){
qtd++;
document.getElementById("qtd").innerText = qtd;
}

function menos(){
if(qtd > 1) qtd--;
document.getElementById("qtd").innerText = qtd;
}

// ADD CARRINHO
function add(tipo){

carrinho.push({
nome: atual.nome,
codigo: atual.codigo,
qtd,
tipo,
estoque: atual.estoque || 0
});

renderCarrinho();
fechar();
}

// CARRINHO
function renderCarrinho(){

const div = document.getElementById("listaCarrinho");

div.innerHTML = "";

carrinho.forEach((i, index) => {

div.innerHTML += `
<div class="item">
<b>${i.nome}</b><br>
${i.tipo.toUpperCase()} - ${i.qtd}
</div>
`;

});

}

// FECHAR PAINEL
function fechar(){
document.getElementById("painel").style.display = "none";
atual = null;
}

// ENVIAR
function enviar(){

if(!carrinho.length){
alert("Carrinho vazio");
return;
}

console.table(carrinho);

alert("Enviado " + carrinho.length + " itens");

carrinho = [];
renderCarrinho();
}
