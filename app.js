alert("APP.JS CARREGOU");
console.log("APP OK");

// ── CONFIG ──
const GH_TOKEN = 'SEU_TOKEN_AQUI';
const REPO = 'Willkerson/Automacao-ConnectPlug';
const PATH = 'fila/movimentacao.json';

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

function verificarSenha() {
  return sessionStorage.getItem("auth") === "ok";
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
    const err = document.getElementById("senhaErro");
    err.style.display = "block";
    setTimeout(() => err.style.display = "none", 2000);
  }
};

// ── ESTADO ──
let produtos = [];
let atual = null;

// ── UTIL ──
function estoqueNumero(v) {
  return parseFloat(String(v || 0)) || 0;
}

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2000);
}

// ── INICIAR ──
function iniciar() {
  fetch("front-index/produtos.json")
    .then(r => r.json())
    .then(data => {
      produtos = data;
      renderizar(produtos);
    })
    .catch(err => console.error(err));
}

// ── RENDER ──
function renderizar(lista) {
  const el = document.getElementById("resultados");

  if (!lista || lista.length === 0) {
    el.innerHTML = `<div class="vazio">Nenhum produto</div>`;
    return;
  }

  el.innerHTML = lista.map(p => {
    const est = estoqueNumero(p.estoque);

    return `
      <div class="card-produto" onclick="abrirProduto('${p.codigo}')">
        <div class="card-info">
          <div class="card-nome">${p.nome}</div>
          <div class="card-meta">Cód: ${p.codigo}</div>
        </div>
        <div class="badge-est">${est}</div>
      </div>
    `;
  }).join("");
}

// ── ABRIR PRODUTO ──
window.abrirProduto = function (codigo) {
  atual = produtos.find(p => p.codigo == codigo);
  if (!atual) return;

  document.getElementById("painel-nome").textContent = atual.nome;
  document.getElementById("painel-cod").textContent = "Cód: " + atual.codigo;
  document.getElementById("painel-preco").textContent = atual.preco ?? "-";
  document.getElementById("painel-est").textContent = estoqueNumero(atual.estoque);

  document.getElementById("overlay").style.display = "block";
  document.getElementById("painel").classList.add("aberto");
};

// ── FECHAR PAINEL ──
window.fechar = function () {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("painel").classList.remove("aberto");
};

// ── SERVICE WORKER ──
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("SW OK"))
      .catch(err => console.error(err));
  });
}
