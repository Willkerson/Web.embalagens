console.log("APP OK");

// ── CONFIGa ──
const GH_TOKEN = "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";
const REPO = "Willkerson/Automacao-ConnectPlug";
const PATH = "fila/movimentacao.json";

// ── LOGIN ──
const SENHA_HASH =
  "158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab";

async function hashSenha(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );

  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
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
    const err = document.getElementById("senhaErro");
    err.style.display = "block";
    setTimeout(() => (err.style.display = "none"), 2000);
  }
};

// ── ESTADO ──
let produtos = [];
let atual = null;
let qtdAtual = 1;
window.carrinho = [];

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
    .then((r) => r.json())
    .then((data) => {
      produtos = data;
      renderizar(produtos);
    })
    .catch(console.error);
}

// ── RENDER ──
function renderizar(lista) {
  const el = document.getElementById("resultados");

  if (!lista || lista.length === 0) {
    el.innerHTML = `<div class="vazio">Nenhum produto</div>`;
    return;
  }

  el.innerHTML = lista
    .map((p) => {
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
    })
    .join("");
}

// ── ABRIR PRODUTO ──
window.abrirProduto = function (codigo) {
  atual = produtos.find((p) => p.codigo == codigo);
  if (!atual) return;

  qtdAtual = 1;

  document.getElementById("painel-nome").textContent = atual.nome;
  document.getElementById("painel-cod").textContent = atual.codigo;
  document.getElementById("painel-preco").textContent =
    "R$ " + (atual.preco ?? "-");

  document.getElementById("painel-est").textContent = estoqueNumero(
    atual.estoque
  );

  document.getElementById("qtd").value = 1;

  document.getElementById("overlay").style.display = "block";
  const painel = document.getElementById("painel");
  painel.style.display = "block";
  painel.classList.add("aberto");
};

// ── FECHAR ──
window.fechar = function () {
  document.getElementById("overlay").style.display = "none";
  const painel = document.getElementById("painel");
  painel.classList.remove("aberto");
};

document.getElementById("overlay")?.addEventListener("click", window.fechar);

// ── CONTADOR ──
window.mais = function () {
  qtdAtual++;
  document.getElementById("qtd").value = qtdAtual;
};

window.menos = function () {
  if (qtdAtual > 1) qtdAtual--;
  document.getElementById("qtd").value = qtdAtual;
};

document.addEventListener("input", (e) => {
  if (e.target.id === "qtd") {
    qtdAtual = parseInt(e.target.value || 1);
  }
});

// ── ADD CARRINHO ──
window.add = function (tipo) {
  if (!atual) return;

  const qtd = parseInt(document.getElementById("qtd").value || 1);

  window.carrinho.push({
    codigo: atual.codigo,
    nome: atual.nome,
    qtd,
    tipo
  });

  atualizarCarrinho();
  toast(`Adicionado: ${tipo} (${qtd})`);
  window.fechar();
};

// ── CONTADOR UI ──
function atualizarCarrinho() {
  const el = document.getElementById("carrinhoCount");
  if (el) el.textContent = window.carrinho.length;
}

// ── BUSCA ──
const busca = document.getElementById("busca");

if (busca) {
  busca.addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();

    const filtrado = produtos.filter((p) =>
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo)
    );

    renderizar(filtrado);
  });
}

// ── ENVIAR GITHUB ──
window.enviar = async function () {
  if (!window.carrinho.length) {
    toast("Carrinho vazio");
    return;
  }

  try {
    const url =
      "https://api.github.com/repos/" +
      REPO +
      "/contents/" +
      PATH;

    const getFile = await fetch(url, {
      headers: {
        Authorization: "Bearer " + GH_TOKEN,
        Accept: "application/vnd.github+json"
      }
    });

    const file = await getFile.json();

    let dados = { itens: [] };

    try {
      dados = JSON.parse(atob(file.content));
    } catch {}

    const sha = file.sha;

    window.carrinho.forEach((it) => {
      dados.itens.push(it);
    });

    const salvar = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + GH_TOKEN,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "movimentacao estoque",
        content: btoa(JSON.stringify(dados, null, 2)),
        sha
      })
    });

    if (!salvar.ok) throw new Error("Erro ao enviar");

    window.carrinho = [];
    atualizarCarrinho();
    toast("Enviado com sucesso!");
  } catch (err) {
    console.error(err);
    toast("Erro ao enviar");
  }
};

// ── SERVICE WORKER ──
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("SW OK"))
      .catch(console.error);
  });
}
