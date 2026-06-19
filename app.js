console.log("APP OK");

let produtos = [];
let carrinho = [];
let atual = null;
let qtdAtual = 1;

// ── LOAD ──
fetch("front-index/produtos.json")
  .then(r => r.json())
  .then(data => {
    produtos = data;
    console.log("Produtos carregados:", produtos.length);
  })
  .catch(err => console.error("Erro ao carregar produtos.json:", err));

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

// ── BUSCA ──
document.getElementById("busca").addEventListener("input", function () {
  const t = this.value.toLowerCase().trim();
  const div = document.getElementById("resultados");

  if (t.length < 2) {
    div.innerHTML = "";
    return;
  }

  const res = produtos.filter(p =>
    (p.nome || "").toLowerCase().includes(t) ||
    String(p.codigo || "").includes(t)
  );

  if (!res.length) {
    div.innerHTML = '<div class="vazio">Nenhum produto encontrado.</div>';
    return;
  }

  div.innerHTML = res.slice(0, 10).map(p => {
    const est = estoqueNumero(p.estoque);
    const st  = statusEstoque(est);
    return `
    <div class="card-produto status-${st}" onclick="abrir('${p.codigo}')">
      <div class="card-produto-info">
        <div class="card-produto-nome">${p.nome}</div>
        <div class="card-produto-cat">${p.codigo}</div>
      </div>
      <div class="badge-estoque">
        <div class="badge-num">${est}</div>
        <div class="badge-label">${labelStatus(est)}</div>
      </div>
      <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>`;
  }).join('');
});

// ── ABRIR PAINEL ──
function abrir(codigo) {
  atual = produtos.find(p => String(p.codigo) === String(codigo));
  qtdAtual = 1;

  const est = estoqueNumero(atual.estoque);
  const cor = est === 0 ? 'var(--vermelho)' : est <= 5 ? 'var(--amarelo)' : 'var(--verde)';

  document.getElementById("nome").textContent        = atual.nome;
  document.getElementById("estoque-num").textContent = est;
  document.getElementById("estoque-num").style.color = cor;
  document.getElementById("qtd").textContent         = 1;

  document.getElementById("resultados").innerHTML = "";
  document.getElementById("busca").value = "";

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

// ── CARRINHO ──
function add(tipo) {
  carrinho.push({
    nome:    atual.nome,
    codigo:  atual.codigo,
    qtd:     qtdAtual,
    tipo,
    estoque: estoqueNumero(atual.estoque)
  });
  atualizarBadge();
  fechar();
}

function atualizarBadge() {
  const n   = carrinho.length;
  const btn = document.getElementById("btnCarrinho");
  document.getElementById("carrinhoCount").textContent = n;
  btn.style.display = n ? "flex" : "none";
}

document.getElementById("btnCarrinho").addEventListener("click", abrirCarrinho);

function abrirCarrinho() {
  const lista = document.getElementById("listaCarrinho");

  if (!carrinho.length) {
    lista.innerHTML = '<div class="carrinho-vazio">Nenhum item no carrinho.</div>';
  } else {
    lista.innerHTML = carrinho.map(it => `
      <div class="carrinho-item">
        <div>
          <div class="carrinho-item-nome">${it.nome}</div>
          <div class="carrinho-item-qtd">${it.qtd} unidade${it.qtd > 1 ? 's' : ''} · Cód. ${it.codigo}</div>
        </div>
        <span class="carrinho-badge badge-${it.tipo}">
          ${it.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}
        </span>
      </div>`).join('');
  }

  document.getElementById("carrinho-painel").classList.add("aberto");
}

function fecharCarrinho() {
  document.getElementById("carrinho-painel").classList.remove("aberto");
}

function enviar() {
  if (!carrinho.length) {
    alert("Carrinho vazio");
    return;
  }

  console.table(carrinho);
  alert("Enviado " + carrinho.length + " item(ns)");

  carrinho = [];
  atualizarBadge();
  fecharCarrinho();
}
