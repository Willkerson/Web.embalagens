alert("APP CARREGOU");
console.log("APP OK");

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
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
    document.getElementById("senhaErro").style.display = "block";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (verificarSenha()) {
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    iniciar();
  }
});

// ─────────────────────────────
// ESTADO
// ─────────────────────────────
let produtos = [];
let carrinho = [];
let historico = JSON.parse(localStorage.getItem("hist") || "[]");
let atual = null;

// ─────────────────────────────
// INICIAR
// ─────────────────────────────
function iniciar() {
  fetch("front-index/produtos.json")
    .then(r => r.json())
    .then(data => {
      produtos = data || [];
      renderizar(produtos);
    })
    .catch(err => console.error(err));
}

// ─────────────────────────────
// RENDER LISTA
// ─────────────────────────────
function renderizar(lista) {
  const el = document.getElementById("resultados");

  if (!lista.length) {
    el.innerHTML = `<div class="vazio">Nenhum produto</div>`;
    return;
  }

  el.innerHTML = lista.map(p => `
    <div class="card-produto" onclick="abrirProduto('${p.codigo}')">
      <div class="card-info">
        <div class="card-nome">${p.nome}</div>
        <div class="card-meta">${p.codigo}</div>
      </div>

      <div class="badge-est status-ok">
        <div class="badge-num">${p.estoque ?? 0}</div>
        <div class="badge-label">est</div>
      </div>
    </div>
  `).join("");
}

// ─────────────────────────────
// ABRIR PRODUTO (PAINEL)
// ─────────────────────────────
window.abrirProduto = function (codigo) {
  atual = produtos.find(p =>
    String(p.codigo).trim() === String(codigo).trim()
  );

  if (!atual) {
    console.log("Produto não encontrado");
    return;
  }

  const painel = document.getElementById("painel");
  const overlay = document.getElementById("overlay");

  painel.style.display = "block";
  overlay.style.display = "block";

  requestAnimationFrame(() => {
    painel.classList.add("aberto");
  });

  document.getElementById("painel-nome").textContent = atual.nome;
  document.getElementById("painel-cod").textContent = atual.codigo;
  document.getElementById("painel-est").textContent = atual.estoque ?? 0;
  document.getElementById("qtd").value = 1;
};

// ─────────────────────────────
// FECHAR PAINEL
// ─────────────────────────────
window.fechar = function () {
  document.getElementById("painel").classList.remove("aberto");

  setTimeout(() => {
    document.getElementById("painel").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  }, 200);
};

// ─────────────────────────────
// CONTADOR
// ─────────────────────────────
window.mais = function () {
  document.getElementById("qtd").value++;
};

window.menos = function () {
  const el = document.getElementById("qtd");
  if (el.value > 1) el.value--;
};

// ─────────────────────────────
// CARRINHO
// ─────────────────────────────
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
  toast("Adicionado");
};

function atualizarCarrinho() {
  document.getElementById("carrinhoCount").textContent = carrinho.length;

  document.getElementById("btnCarrinho").style.display = "flex";

  const el = document.getElementById("listaCarrinho");

  el.innerHTML = carrinho.map(i => `
    <div class="c-item">
      <div>
        <div class="c-nome">${i.nome}</div>
        <div class="c-sub">${i.tipo} • ${i.qtd}</div>
      </div>
    </div>
  `).join("");
}

// ─────────────────────────────
// ABRIR / FECHAR CARRINHO
// ─────────────────────────────
window.abrirCarrinho = function () {
  document.getElementById("carrinho-painel").classList.add("aberto");
};

window.fecharCarrinho = function () {
  document.getElementById("carrinho-painel").classList.remove("aberto");
};

// ─────────────────────────────
// HISTÓRICO
// ─────────────────────────────
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

// ─────────────────────────────
// TOAST
// ─────────────────────────────
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");

  setTimeout(() => el.classList.remove("show"), 2000);
}
