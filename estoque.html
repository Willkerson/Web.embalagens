console.log("APP OK");

let produtos = [];
let carrinho = [];
let atual = null;
let qtdAtual = 1;

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

// ── RENDER ──
function renderizar(lista) {
  const div = document.getElementById("resultados");

  if (!lista.length) {
    div.innerHTML = '<div class="vazio">Nenhum produto encontrado.</div>';
    return;
  }

  div.innerHTML = lista.map(p => {
    const est = estoqueNumero(p.estoque);
    const st  = statusEstoque(est);
    return `
    <div class="card-produto status-${st}" onclick="abrir('${p.codigo}')">
      <div class="card-info">
        <div class="card-nome">${p.nome}</div>
        <div class="card-cod">Cód. ${p.codigo}</div>
      </div>
      <div class="badge-est status-${st}">
        <div class="badge-num">${est}</div>
        <div class="badge-label">${labelStatus(est)}</div>
      </div>
    </div>`;
  }).join('');
}

// ── LOAD ──
fetch("front-index/produtos.json")
  .then(r => r.json())
  .then(data => {
    produtos = data;
    renderizar(produtos);
  })
  .catch(err => {
    document.getElementById("resultados").innerHTML = '<div class="vazio">Erro ao carregar produtos.</div>';
    console.error(err);
  });

// ── BUSCA ──
document.getElementById("busca").addEventListener("input", function () {
  const t = this.value.toLowerCase().trim();

  if (!t) {
    renderizar(produtos);
    return;
  }

  const res = produtos.filter(p =>
    (p.nome || "").toLowerCase().includes(t) ||
    String(p.codigo || "").includes(t)
  );

  renderizar(res);
});

// ── ABRIR PAINEL ──
function abrir(codigo) {
  atual = produtos.find(p => String(p.codigo) === String(codigo));
  qtdAtual = 1;

  const est = estoqueNumero(atual.estoque);
  const cor = est === 0 ? 'var(--vermelho)' : est <= 5 ? 'var(--amarelo)' : 'var(--verde)';

  document.getElementById("painel-nome").textContent    = atual.nome;
  document.getElementById("painel-est").textContent     = est;
  document.getElementById("painel-est").style.color     = cor;
  document.getElementById("painel-cod").textContent     = "Cód. " + atual.codigo;
  document.getElementById("qtd").textContent            = 1;

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

function mais()  { qtdAtual++; document.getElementById("qtd").textContent = qtdAtual; }
function menos() { if (qtdAtual > 1) { qtdAtual--; document.getElementById("qtd").textContent = qtdAtual; } }

// ── ADD CARRINHO ──
function add(tipo) {
  carrinho.push({
    nome:   atual.nome,
    codigo: atual.codigo,
    qtd:    qtdAtual,
    tipo,
    estoque: estoqueNumero(atual.estoque)
  });
  atualizarBadge();
  fechar();
}

function atualizarBadge() {
  const n = carrinho.length;
  document.getElementById("carrinhoCount").textContent = n;
  document.getElementById("btnCarrinho").style.display = n ? "flex" : "none";
}

// ── CARRINHO ──
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

function enviar() {
  if (!carrinho.length) { alert("Carrinho vazio"); return; }
  console.table(carrinho);
  alert("Enviado " + carrinho.length + " item(ns)");
  carrinho = [];
  atualizarBadge();
  fecharCarrinho();
}
