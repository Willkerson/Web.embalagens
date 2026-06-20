alert("APP CARREGOU");
console.log("APP OK");

// ── LOGIN ──
const SENHA_HASH = "158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab";

async function hashSenha(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );

  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

window.login = async function () {
  const input = document.getElementById("senhaInput").value;
  const hash = await hashSenha(input);

  if (hash === SENHA_HASH) {
    sessionStorage.setItem("auth", "ok");
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    iniciar();
  } else {
    document.getElementById("senhaErro").style.display = "block";
  }
};

function verificarSenha() {
  return sessionStorage.getItem("auth") === "ok";
}

document.addEventListener("DOMContentLoaded", () => {
  if (verificarSenha()) {
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    iniciar();
  }
});

// ── DADOS ──
let produtos = [];
let carrinho = [];
let historico = JSON.parse(localStorage.getItem("hist") || "[]");

let atual = null;
let qtdAtual = 1;

// ── INICIAR ──
function iniciar() {
  fetch("front-index/produtos.json")
    .then(r => r.json())
    .then(data => {
      produtos = data;
      renderizar(produtos);
    });
}

// ── RENDER LISTA ──
function renderizar(lista) {
  const el = document.getElementById("resultados");

  if (!lista.length) {
    el.innerHTML = `<div class="vazio">Nada encontrado</div>`;
    return;
  }

  el.innerHTML = lista.map(p => `
    <div class="card-produto" onclick="abrirProduto('${p.codigo}')">
      <div class="card-info">
        <div class="card-nome">${p.nome}</div>
        <div class="card-meta">${p.codigo}</div>
      </div>
      <div class="badge-est status-ok">
        <div class="badge-num">${p.estoque}</div>
        <div class="badge-label">est</div>
      </div>
    </div>
  `).join("");
}

// ── ABRIR PRODUTO ──
window.abrirProduto = function (codigo) {
  atual = produtos.find(p => String(p.codigo) === String(codigo));

  if (!atual) {
    toast("Produto não encontrado");
    return;
  }

  qtdAtual = 1;

  document.getElementById("painel-nome").textContent = atual.nome || "";
  document.getElementById("painel-cod").textContent = atual.codigo || "";
  document.getElementById("painel-est").textContent = atual.estoque ?? 0;
  document.getElementById("qtd").value = 1;

  document.getElementById("overlay").style.display = "block";
  document.getElementById("painel").classList.add("aberto");
};
// ── FECHAR ──
window.fechar = function () {
  document.getElementById("painel").classList.remove("aberto");
  document.getElementById("overlay").style.display = "none";
};

// ── CONTADOR ──
window.mais = () => document.getElementById("qtd").value++;
window.menos = () => {
  const v = document.getElementById("qtd");
  if (v.value > 1) v.value--;
};

// ── ADD CARRINHO ──
window.add = function (tipo) {
  const qtd = Number(document.getElementById("qtd").value);

  carrinho.push({
    codigo: atual.codigo,
    nome: atual.nome,
    qtd,
    tipo
  });

  atualizarCarrinho();
  fechar();
  toast("Adicionado ao carrinho");
};

// ── CARRINHO ──
function atualizarCarrinho() {
  document.getElementById("carrinhoCount").textContent = carrinho.length;

  const el = document.getElementById("listaCarrinho");

  el.innerHTML = carrinho.map(i => `
    <div class="c-item">
      <div>
        <div class="c-nome">${i.nome}</div>
        <div class="c-sub">${i.tipo} • ${i.qtd}</div>
      </div>
    </div>
  `).join("");

  document.getElementById("btnCarrinho").style.display = "flex";
}

// ── ABRIR CARRINHO ──
window.abrirCarrinho = function () {
  document.getElementById("carrinho-painel").classList.add("aberto");
};

window.fecharCarrinho = function () {
  document.getElementById("carrinho-painel").classList.remove("aberto");
};

// ── HISTÓRICO ──
window.abrirHist = function () {
  document.getElementById("hist-painel").classList.add("aberto");

  const el = document.getElementById("listaHist");

  el.innerHTML = historico.map(i => `
    <div class="hist-item">
      <div class="hist-nome">${i.nome}</div>
      <div class="hist-meta">${i.tipo} • ${i.qtd} • ${i.data}</div>
    </div>
  `).join("");
};

window.fecharHist = function () {
  document.getElementById("hist-painel").classList.remove("aberto");
};

window.limparHist = function () {
  historico = [];
  localStorage.setItem("hist", "[]");
  abrirHist();
};

// ── TOAST ──
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");

  setTimeout(() => el.classList.remove("show"), 2000);
}
