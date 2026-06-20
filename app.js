console.log("APP OK");

// =========================
// CONFIG GITHUB
// =========================
const GH_TOKEN = "SEU_TOKEN_AQUI";
const REPO = "Willkerson/Automacao-ConnectPlug";
const PATH = "fila/movimentacao.json";

const githubHeaders = {
  Authorization: "token " + GH_TOKEN,
  Accept: "application/vnd.github+json"
};

// =========================
// SENHA
// =========================
const SENHA_HASH =
  "158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab";

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

async function login() {
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
}

// =========================
// ESTADO
// =========================
let produtos = [];
let carrinho = [];
let historico = JSON.parse(localStorage.getItem("hist") || "[]");

let categoriaAtiva = "todas";
let ordemAtiva = "nome";

// =========================
// UTIL
// =========================
function estoqueNumero(v) {
  return parseFloat(
    String(v || "0")
      .replace(/\s*un\.?/i, "")
      .replace(/\./g, "")
      .replace(",", ".")
  ) || 0;
}

function toast(msg, cor) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.background = cor || "#1a1a2e";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

// =========================
// RENDER PRINCIPAL
// =========================
function renderizar(lista) {
  const div = document.getElementById("resultados");

  if (!lista.length) {
    div.innerHTML = "<div class='vazio'>Nenhum produto encontrado.</div>";
    return;
  }

  div.innerHTML = lista.map(p => {
    const est = estoqueNumero(p.estoque);

    return `
      <div class="card-produto" onclick="abrir('${p.codigo}')">
        <div class="card-info">
          <div class="card-nome">${p.nome}</div>
          <div class="card-meta">Cód. ${p.codigo}</div>
        </div>
        <div class="badge-est">
          ${est}
        </div>
      </div>
    `;
  }).join("");
}

// =========================
// INICIAR APP
// =========================
function iniciar() {
  fetch("front-index/produtos.json")
    .then(r => r.json())
    .then(data => {
      produtos = data;
      renderizar(produtos);
      buildFiltros();
    })
    .catch(err => {
      console.error("Erro produtos:", err);
    });
}

// =========================
// FILTROS
// =========================
function aplicarFiltro() {
  const t = document.getElementById("busca").value.toLowerCase();

  let lista = produtos;

  if (categoriaAtiva !== "todas") {
    lista = lista.filter(p => p.categoria === categoriaAtiva);
  }

  if (t) {
    lista = lista.filter(p =>
      (p.nome || "").toLowerCase().includes(t) ||
      String(p.codigo || "").includes(t)
    );
  }

  renderizar(lista);
}

function buildFiltros() {
  const cats = ["todas", ...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  const wrap = document.getElementById("filtros");

  wrap.innerHTML = cats.map(c =>
    `<div class="chip ${c === "todas" ? "ativo" : ""}" data-cat="${c}">
      ${c}
    </div>`
  ).join("");

  wrap.querySelectorAll(".chip").forEach(el => {
    el.onclick = () => {
      categoriaAtiva = el.dataset.cat;
      aplicarFiltro();
    };
  });
}

// =========================
// CARRINHO
// =========================
function add(tipo) {
  carrinho.push({
    codigo: atual.codigo,
    nome: atual.nome,
    qtd: qtdAtual,
    tipo
  });

  toast("Adicionado ao carrinho", "#0057FF");
  fechar();
}

function atualizarBadge() {
  document.getElementById("carrinhoCount").textContent = carrinho.length;
}

// =========================
// GITHUB (ROBUSTO)
// =========================
async function enviar() {
  if (!carrinho.length) return toast("Carrinho vazio", "#E63946");

  try {
    const url = `https://api.github.com/repos/${REPO}/contents/${PATH}`;

    // GET
    const getFile = await fetch(url, {
      headers: githubHeaders
    });

    const getText = await getFile.text();

    let sha = null;
    let dados = { itens: [] };

    if (getFile.ok) {
      const file = JSON.parse(getText);
      sha = file.sha;

      try {
        dados = JSON.parse(atob(file.content.replace(/\s/g, "")));
      } catch {}
    }

    carrinho.forEach(it => {
      dados.itens.push({
        codigo: it.codigo,
        qtd: it.qtd,
        tipo: it.tipo
      });
    });

    // PUT
    const salvar = await fetch(url, {
      method: "PUT",
      headers: {
        ...githubHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "movimentacao estoque",
        content: btoa(JSON.stringify(dados, null, 2)),
        ...(sha ? { sha } : {})
      })
    });

    const txt = await salvar.text();

    if (!salvar.ok) {
      throw new Error(txt);
    }

    toast("Enviado com sucesso", "#00B37E");
    carrinho = [];
    atualizarBadge();

  } catch (err) {
    console.error(err);
    toast("Erro ao enviar", "#E63946");
  }
}

// =========================
// SERVICE WORKER
// =========================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("SW OK"))
      .catch(err => console.error("SW erro:", err));
  });
}
