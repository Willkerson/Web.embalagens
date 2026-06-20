console.log("APP OK");
const GH_TOKEN = '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';
const REPO = 'Willkerson/Automacao-ConnectPlug';
const PATH = 'fila/movimentacao.json';

// ── SENHA ──
const SENHA_HASH = "158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab";

async function hashSenha(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
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
    document.getElementById("senhaInput").value = "";
    document.getElementById("senhaInput").focus();
    setTimeout(() => err.style.display = "none", 2500);
  }
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
});

// ── DADOS ──
let produtos = [];
let carrinho = [];
let historico = JSON.parse(localStorage.getItem("hist") || "[]");
let atual = null;
let qtdAtual = 1;
let categoriaAtiva = "todas";
let ordemAtiva = "nome";

// ── UTILS ──
function estoqueNumero(valor) {
  return parseFloat(
    String(valor || "0")
      .replace(/\s*un\.?/i, "")
      .replace(/\./g, "")
      .replace(",", ".")
  ) || 0;
}

function statusEstoque(n) {
  if (n === 0) return 'zero';
  if (n <= 5)  return 'low';
  return 'ok';
}

function labelStatus(n) {
  if (n === 0) return 'Zerado';
  if (n <= 5)  return 'Baixo';
  return 'OK';
}

function formatPreco(p) {
  if (!p && p !== 0) return '';
  return 'R$ ' + Number(p).toFixed(2).replace('.', ',');
}

function ordenar(lista) {
  const l = [...lista];
  if (ordemAtiva === 'nome')         return l.sort((a,b) => (a.nome||'').localeCompare(b.nome||''));
  if (ordemAtiva === 'estoque-asc')  return l.sort((a,b) => estoqueNumero(a.estoque) - estoqueNumero(b.estoque));
  if (ordemAtiva === 'estoque-desc') return l.sort((a,b) => estoqueNumero(b.estoque) - estoqueNumero(a.estoque));
  if (ordemAtiva === 'preco-asc')    return l.sort((a,b) => (a.preco||0) - (b.preco||0));
  if (ordemAtiva === 'preco-desc')   return l.sort((a,b) => (b.preco||0) - (a.preco||0));
  return l;
}

// ── TOAST ──
function toast(msg, cor) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.background = cor || "#1a1a2e";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

// ── RENDER ──
function renderizar(lista) {
  const div = document.getElementById("resultados");
  const final = ordenar(lista);

  if (!final.length) {
    div.innerHTML = '<div class="vazio">Nenhum produto encontrado.</div>';
    return;
  }

  div.innerHTML = final.map(p => {
    const est = estoqueNumero(p.estoque);
    const st  = statusEstoque(est);
    const preco = p.preco ? formatPreco(p.preco) : '';
    return `
    <div class="card-produto" onclick="abrir('${p.codigo}')">
      <div class="card-info">
        <div class="card-nome">${p.nome}</div>
        <div class="card-meta">
          <span>Cód. ${p.codigo}</span>
          ${preco ? `<span class="card-preco">${preco}</span>` : ''}
        </div>
      </div>
      <div class="badge-est status-${st}">
        <div class="badge-num">${est}</div>
        <div class="badge-label">${labelStatus(est)}</div>
      </div>
    </div>`;
  }).join('');
}

function aplicarFiltro() {
  const t = document.getElementById("busca").value.toLowerCase().trim();
  let lista = produtos;

  if (categoriaAtiva !== "todas") {
    lista = lista.filter(p => (p.categoria || '') === categoriaAtiva);
  }

  if (t) {
    lista = lista.filter(p =>
      (p.nome || '').toLowerCase().includes(t) ||
      String(p.codigo || '').includes(t) ||
      String(p.preco || '').includes(t)
    );
  }

  renderizar(lista);
}

// ── CATEGORIAS ──
function buildFiltros() {
  const cats = ['todas', ...new Set(produtos.map(p => p.categoria).filter(Boolean).sort())];
  const wrap = document.getElementById("filtros");
  wrap.innerHTML = cats.map(c => `
    <div class="chip ${c === 'todas' ? 'ativo' : ''}" data-cat="${c}">
      ${c === 'todas' ? 'Todas' : c}
    </div>`).join('');

  wrap.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', function () {
      wrap.querySelectorAll('.chip').forEach(c => c.classList.remove('ativo'));
      this.classList.add('ativo');
      categoriaAtiva = this.dataset.cat;
      aplicarFiltro();
    });
  });
}

// ── BADGE ZERADOS ──
function atualizarZerados() {
  const n = produtos.filter(p => estoqueNumero(p.estoque) === 0).length;
  const el = document.getElementById("badgeZerados");
  document.getElementById("countZerados").textContent = n;
  el.style.display = n ? "flex" : "none";
}

document.getElementById("badgeZerados").addEventListener("click", () => {
  categoriaAtiva = "todas";
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('ativo'));
  document.querySelector('.chip[data-cat="todas"]')?.classList.add('ativo');
  document.getElementById("busca").value = "";
  ordemAtiva = "estoque-asc";
  document.querySelectorAll('.btn-ordem').forEach(b => b.classList.remove('ativo'));
  document.querySelector('[data-ordem="estoque-asc"]')?.classList.add('ativo');
  renderizar(produtos.filter(p => estoqueNumero(p.estoque) === 0));
});

// ── ORDENAÇÃO ──
document.querySelectorAll('.btn-ordem').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.btn-ordem').forEach(b => b.classList.remove('ativo'));
    this.classList.add('ativo');
    ordemAtiva = this.dataset.ordem;
    aplicarFiltro();
  });
});

// ── BUSCA ──
document.getElementById("busca").addEventListener("input", aplicarFiltro);

// ── INICIAR (após login) ──
function iniciar() {
  fetch("front-index/produtos.json")
    .then(r => r.json())
    .then(data => {
      produtos = data;
      buildFiltros();
      atualizarZerados();
      renderizar(produtos);
    })
    .catch(err => {
      document.getElementById("resultados").innerHTML = '<div class="vazio">Erro ao carregar produtos.</div>';
      console.error(err);
    });
}

// ── PAINEL ──
function abrir(codigo) {
  atual = produtos.find(p => String(p.codigo) === String(codigo));
  qtdAtual = 1;

  const est = estoqueNumero(atual.estoque);
  const cor = est === 0 ? 'var(--vermelho)' : est <= 5 ? 'var(--amarelo)' : 'var(--verde)';

  document.getElementById("painel-nome").textContent  = atual.nome;
  document.getElementById("painel-cod").textContent   = "Cód. " + atual.codigo;
  document.getElementById("painel-preco").textContent = atual.preco ? formatPreco(atual.preco) : '';
  document.getElementById("painel-est").textContent   = est;
  document.getElementById("painel-est").style.color   = cor;
  document.getElementById("qtd").value = 1;

  document.getElementById("overlay").style.display = "block";
  const painel = document.getElementById("painel");
  painel.style.display = "block";
  setTimeout(() => painel.classList.add("aberto"), 10);
}

function fechar() {
  const painel = document.getElementById("painel");
  painel.classList.remove("aberto");
  setTimeout(() => { painel.style.display = "none"; }, 280);
  document.getElementById("overlay").style.display = "none";
  atual = null;
}

document.getElementById("overlay").addEventListener("click", fechar);

function mais()  { qtdAtual++; document.getElementById("qtd").value = qtdAtual; }
function menos() { if (qtdAtual > 1) { qtdAtual--; document.getElementById("qtd").value = qtdAtual; } }

document.getElementById("qtd").addEventListener("input", function () {
  const v = parseInt(this.value) || 1;
  qtdAtual = v < 1 ? 1 : v;
  this.value = qtdAtual;
});

// ── CARRINHO ──
function add(tipo) {
  const inputVal = parseInt(document.getElementById("qtd").value) || 1;
  qtdAtual = inputVal < 1 ? 1 : inputVal;

  carrinho.push({
    nome:    atual.nome,
    codigo:  atual.codigo,
    qtd:     qtdAtual,
    tipo,
    estoque: estoqueNumero(atual.estoque)
  });

  const emoji = tipo === 'entrada' ? '↑' : '↓';
  toast(`${emoji} ${atual.nome.slice(0, 28)} — ${qtdAtual} un`, tipo === 'entrada' ? '#00B37E' : '#E63946');

  atualizarBadge();
  fechar();
}

function atualizarBadge() {
  const n = carrinho.length;
  document.getElementById("carrinhoCount").textContent = n;
  document.getElementById("btnCarrinho").style.display = n ? "flex" : "none";
}

document.getElementById("btnCarrinho").addEventListener("click", abrirCarrinho);

function abrirCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  lista.innerHTML = carrinho.length ? carrinho.map(it => `
    <div class="c-item">
      <div>
        <div class="c-nome">${it.nome}</div>
        <div class="c-sub">${it.qtd} un · Cód. ${it.codigo}</div>
      </div>
      <span class="c-badge badge-${it.tipo}">${it.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span>
    </div>`).join('')
  : '<div class="vazio">Carrinho vazio.</div>';
  document.getElementById("carrinho-painel").classList.add("aberto");
}

function fecharCarrinho() {
  document.getElementById("carrinho-painel").classList.remove("aberto");
}

async function enviar() {

  if (!carrinho.length) {
    toast("Carrinho vazio");
    return;
  }

  try {

    const url =
      `https://api.github.com/repos/${REPO}/contents/${PATH}`;

    // Lê fila atual
    const getFile = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const file = await getFile.json();

    const sha = file.sha;

    let dados = {
      itens: []
    };

    try {
      dados = JSON.parse(
        atob(file.content.replace(/\n/g, ''))
      );
    } catch {}

    // Adiciona itens do carrinho
    carrinho.forEach(it => {
      dados.itens.push({
        codigo: String(it.codigo),
        qtd: Number(it.qtd),
        tipo: it.tipo
      });
    });

    // Salva novamente
    const salvar = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'nova movimentacao',
        content: btoa(
          JSON.stringify(dados, null, 2)
        ),
        sha
      })
    });

    if (!salvar.ok) {
      throw new Error(
        `GitHub ${salvar.status}`
      );
    }

    const agora = new Date().toLocaleString('pt-BR');

    carrinho.forEach(it =>
      historico.unshift({
        ...it,
        data: agora
      })
    );

    localStorage.setItem(
      "hist",
      JSON.stringify(historico)
    );

    toast(
      `✓ ${carrinho.length} item(ns) enviado(s)`,
      '#0057FF'
    );

    carrinho = [];

    atualizarBadge();

    fecharCarrinho();

  } catch (err) {

    console.error(err);

    toast(
      'Erro ao enviar',
      '#E63946'
    );
  }
}
// ── HISTÓRICO ──
function abrirHist() {
  const lista = document.getElementById("listaHist");
  lista.innerHTML = historico.length ? historico.map(it => `
    <div class="hist-item">
      <div class="hist-nome">${it.nome}</div>
      <div class="hist-meta">
        <span class="c-badge badge-${it.tipo}" style="font-size:11px;padding:3px 10px">${it.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span>
        <span>${it.qtd} un · Cód. ${it.codigo}</span>
        <span style="margin-left:auto">${it.data}</span>
      </div>
    </div>`).join('')
  : '<div class="vazio">Nenhuma movimentação ainda.</div>';
  document.getElementById("hist-painel").classList.add("aberto");
}

function fecharHist() {
  document.getElementById("hist-painel").classList.remove("aberto");
}

function limparHist() {
  if (!confirm("Limpar todo o histórico?")) return;
  historico = [];
  localStorage.removeItem("hist");
  fecharHist();
  toast("Histórico limpo");
}

// ── PWA SERVICE WORKER ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Automacao-ConnectPlug/sw.js')
      .then(() => console.log("SW registrado"))
      .catch(err => console.error("SW erro:", err));
  });
}
