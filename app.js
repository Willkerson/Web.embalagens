
alert("APP.JS CARREGOU");
console.log("APP OK");

// ⚠️ IMPORTANTE: regenere esse token depois
const GH_TOKEN = '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';
const REPO = 'Willkerson/Automacao-ConnectPlug';
const PATH = 'fila/movimentacao.json';

// ── SENHA ──
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
    document.getElementById("senhaInput").value = "";
    setTimeout(() => err.style.display = "none", 2500);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (verificarSenha()) {
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    iniciar();
  }

  document.getElementById("senhaInput").addEventListener("keydown", e => {
    if (e.key === "Enter") login();
  });
});

// ── DADOS ──
let produtos = [];
let carrinho = [];
let historico = JSON.parse(localStorage.getItem("hist") || "[]");
let atual = null;
let qtdAtual = 1;
let categoriaAtiva = "todas";
let ordemAtiva = "nome";

// ── GITHUB ──
const githubHeaders = {
  "Authorization": "Bearer " + GH_TOKEN,
  "Accept": "application/vnd.github+json"
};

// ── UTIL ──
function estoqueNumero(valor) {
  return parseFloat(
    String(valor || "0")
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

// ── INICIAR ──
function iniciar() {
  fetch("front-index/produtos.json")
    .then(r => r.json())
    .then(data => {
      produtos = data;
      renderizar(produtos);
    })
    .catch(err => {
      console.error(err);
    });
}

// ── ENVIO GITHUB ──
async function enviar() {

  if (!carrinho.length) {
    toast("Carrinho vazio");
    return;
  }

  try {

const url =
  "https://api.github.com/repos/" +
  REPO +
  "/contents/" +
  PATH;

    // GET arquivo atual
    const getFile = await fetch(url, {
      headers: githubHeaders
    });

    const getText = await getFile.text();

    if (!getFile.ok) {
throw new Error(
  "GET falhou: " + getFile.status + " - " + getText
);
    }

    const file = JSON.parse(getText);

    let dados = { itens: [] };

    try {
      dados = JSON.parse(atob(file.content.replace(/\n/g, "")));
    } catch {}

    const sha = file.sha;

    carrinho.forEach(it => {
      dados.itens.push({
        codigo: String(it.codigo),
        qtd: Number(it.qtd),
        tipo: it.tipo
      });
    });

    // PUT atualizado
    const salvar = await fetch(url, {
      method: "PUT",
      headers: {
        ...githubHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "nova movimentacao",
        content: btoa(JSON.stringify(dados, null, 2)),
        sha
      })
    });

    const salvarText = await salvar.text();

    if (!salvar.ok) {
    throw new Error(
  "PUT falhou: " + salvar.status + " - " + salvarText
);
    }

    const agora = new Date().toLocaleString("pt-BR");

    carrinho.forEach(it =>
      historico.unshift({ ...it, data: agora })
    );

    localStorage.setItem("hist", JSON.stringify(historico));

    carrinho = [];

    toast("Enviado com sucesso", "#0057FF");

  } catch (err) {
    console.error("ERRO:", err);
    toast(err.message || "Erro ao enviar", "#E63946");
  }
}

// ── SERVICE WORKER ──
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("SW OK"))
      .catch(err => console.error("SW erro:", err));
  });
}

