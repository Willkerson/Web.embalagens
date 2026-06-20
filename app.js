console.log("APP OK");

/* ───────── LOGIN ───────── */
const SENHA_HASH = "158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab";

async function hashSenha(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );

  return [...new Uint8Array(buf)]
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
    setTimeout(() => {
      document.getElementById("senhaErro").style.display = "none";
    }, 2000);
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

  document.getElementById("senhaInput").addEventListener("keydown", e => {
    if (e.key === "Enter") login();
  });

  document.getElementById("busca").addEventListener("input", filtrar);
});

/* ───────── DADOS ───────── */
let produtos = [];
let carrinho = [];
let atual = null;

/* ───────── INIT ───────── */
function iniciar() {
  fetch("front-index/produtos.json")
    .then(r => r.json())
    .then(data => {
      produtos = data;
      renderizar(produtos);
    });
}

/* ───────── RENDER ───────── */
function renderizar(lista) {
  const el = document.getElementById("resultados");
  el.innerHTML = "";

  if (!lista.length) {
    el.innerHTML = "<div class='vazio'>Nenhum produto</div>";
    return;
  }

  lista.forEach(p => {
    const div = document.createElement("div");
    div.className = "card-produto";

    div.innerHTML = `
      <div class="card-info">
        <div class="card-nome">${p.nome}</div>
        <div class="card-meta">
          <span>${p.codigo}</span>
          <span>R$ ${p.preco || 0}</span>
        </div>
      </div>
      <div class="badge-est status-ok">
        <div class="badge-num">${p.estoque || 0}</div>
        <div class="badge-label">estoque</div>
      </div>
    `;

    div.onclick = () => abrirProduto(p.codigo);
    el.appendChild(div);
  });
}

/* ───────── ABRIR PRODUTO ───────── */
function abrirProduto(codigo) {
  atual = produtos.find(p => String(p.codigo) === String(codigo));

  if (!atual) return toast("Produto não encontrado");

  document.getElementById("painel-nome").textContent = atual.nome;
  document.getElementById("painel-cod").textContent = atual.codigo;
  document.getElementById("painel-preco").textContent = "R$ " + (atual.preco || 0);
  document.getElementById("painel-est").textContent = atual.estoque || 0;

  document.getElementById("painel").style.display = "block";
  document.getElementById("painel").classList.add("aberto");
}

/* ───────── FECHAR PAINEL ───────── */
function fechar() {
  document.getElementById("painel").classList.remove("aberto");
  setTimeout(() => {
    document.getElementById("painel").style.display = "none";
  }, 200);
}

/* ───────── CONTADOR ───────── */
function mais() {
  document.getElementById("qtd").value++;
}

function menos() {
  const v = document.getElementById("qtd");
  if (v.value > 1) v.value--;
}

/* ───────── ADD CARRINHO ───────── */
function add(tipo) {
  const qtd = Number(document.getElementById("qtd").value);

  carrinho.push({
    codigo: atual.codigo,
    nome: atual.nome,
    qtd,
    tipo
  });

  atualizarCarrinho();
  toast("Adicionado ao carrinho");
  fechar();
}

/* ───────── CARRINHO ───────── */
function atualizarCarrinho() {
  const el = document.getElementById("listaCarrinho");
  const count = document.getElementById("carrinhoCount");

  count.textContent = carrinho.length;

  el.innerHTML = carrinho.map(i => `
    <div class="c-item">
      <div>
        <div class="c-nome">${i.nome}</div>
        <div class="c-sub">${i.codigo} • ${i.qtd}</div>
      </div>
      <div class="c-badge ${i.tipo === "entrada" ? "badge-entrada" : "badge-saida"}">
        ${i.tipo}
      </div>
    </div>
  `).join("");
}

window.abrirCarrinho = function () {
  document.getElementById("carrinho-painel").classList.add("aberto");
};

window.fecharCarrinho = function () {
  document.getElementById("carrinho-painel").classList.remove("aberto");
};

/* ───────── BUSCA ───────── */
function filtrar() {
  const v = document.getElementById("busca").value.toLowerCase();

  const filtrado = produtos.filter(p =>
    p.nome.toLowerCase().includes(v) ||
    String(p.codigo).includes(v)
  );

  renderizar(filtrado);
}

/* ───────── TOAST ───────── */
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 2000);
}
