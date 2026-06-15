// ─────────────────────────────────────────────────────────────
// CARREGA produtos.json
// ─────────────────────────────────────────────────────────────

window.produtos = [];

async function carregarProdutos() {
  try {

    const resposta = await fetch('./produtos.json');

    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP ${resposta.status}`
      );
    }

    window.produtos = await resposta.json();

    console.log(
      `${window.produtos.length} produtos carregados`
    );

    document.dispatchEvent(
      new CustomEvent('planilhaCarregada')
    );

  } catch (erro) {

    console.error(
      'Erro ao carregar produtos.json',
      erro
    );

  }
}

// Inicia carregamento
carregarProdutos();


// ─────────────────────────────────────────────────────────────
// APP.JS — Inicialização da página
// ─────────────────────────────────────────────────────────────

function inicializarLoja() {
  restaurarCarrinho();
  lerHash();

  if (estado.cat !== 'todos') {

    var fb = document.querySelector(
      '.ftab[data-cat="' + estado.cat + '"]'
    );

    if (fb) {

      document
        .querySelectorAll('.ftab')
        .forEach(function(b) {
          b.classList.remove('on');
        });

      fb.classList.add('on');

      var subEl =
        document.getElementById(
          'sub-' + estado.cat
        );

      if (subEl) {

        document
          .querySelectorAll('.subtabs')
          .forEach(function(b) {
            b.classList.remove('on');
          });

        subEl.classList.add('on');
      }
    }
  }

  updateBadge();
  renderizar();
}

document.addEventListener(
  'planilhaCarregada',
  function () {

    if (
      document.readyState === 'loading'
    ) {

      document.addEventListener(
        'DOMContentLoaded',
        inicializarLoja
      );

    } else {

      inicializarLoja();

    }
  },
  { once: true }
);
