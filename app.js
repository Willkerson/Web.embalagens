console.log("APP OK");

// 🔴 COLOQUE SEU TOKEN AQUI (NÃO EXPOR EM PRODUÇÃO)
const GH_TOKEN = "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";

const REPO = "Willkerson/Automacao-ConnectPlug";
const PATH = "fila/movimentacao.json";

const SENHA_HASH =
  "158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab";

// ─────────────────────────────
// AUTH GITHUB
// ─────────────────────────────
const githubHeaders = {
  Authorization: "token " + GH_TOKEN,
  Accept: "application/vnd.github+json"
};

// ─────────────────────────────
// LOGIN
// ─────────────────────────────
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
    const err = document.getElementById("senhaErro");
    err.style.display = "block";
    setTimeout(() => (err.style.display = "none"), 2500);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (verificarSenha()) {
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("appContent").style.display = "block";
    iniciar();
  }
});

// ─────────────────────────────
// DADOS
// ─────────────────────────────
let produtos = [];
let carrinho = [];
let historico = JSON.parse(localStorage.getItem("hist") || "[]");

// ─────────────────────────────
// INICIAR
// ─────────────────────────────
function iniciar() {
  fetch("front-index/produtos.json")
    .then(r => r.json())
    .then(data => {
      produtos = data;
      renderizar(produtos);
    })
    .catch(err => console.error("Erro produtos:", err));
}

// ─────────────────────────────
// ENVIO GITHUB (CORRIGIDO)
// ─────────────────────────────
async function enviar() {
  if (!carrinho.length) return alert("Carrinho vazio");

  try {
    const url = `https://api.github.com/repos/${REPO}/contents/${PATH}`;

    // GET
    const getFile = await fetch(url, {
      headers: githubHeaders
    });

    const getText = await getFile.text();

    console.log("GET STATUS:", getFile.status);
    console.log("GET BODY:", getText);

    let sha = null;
    let dados = { itens: [] };

    if (getFile.ok) {
      const file = JSON.parse(getText);

      sha = file.sha;

      try {
        dados = JSON.parse(
          atob(file.content.replace(/\s/g, ""))
        );
      } catch {}
    }

    // adiciona carrinho
    carrinho.forEach(it => {
      dados.itens.push({
        codigo: String(it.codigo),
        qtd: Number(it.qtd),
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
        message: "nova movimentacao",
        content: btoa(JSON.stringify(dados, null, 2)),
        ...(sha ? { sha } : {})
      })
    });

    const salvarText = await salvar.text();

    console.log("PUT STATUS:", salvar.status);
    console.log("PUT BODY:", salvarText);

    if (!salvar.ok) {
      throw new Error(`GitHub PUT ${salvar.status}`);
    }

    // histórico local
    const agora = new Date().toLocaleString("pt-BR");

    carrinho.forEach(it =>
      historico.unshift({ ...it, data: agora })
    );

    localStorage.setItem("hist", JSON.stringify(historico));

    carrinho = [];

    alert("Enviado com sucesso");

  } catch (err) {
    console.error("ERRO GERAL:", err);
    alert(err.message || "Erro ao enviar");
  }
}

// ─────────────────────────────
// SERVICE WORKER (CORRIGIDO)
// ─────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("SW OK"))
      .catch(err => console.error("SW erro:", err));
  });
}
