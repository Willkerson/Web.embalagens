// scripts/snapshot-estoque.js
// Lê front-index/produtos.json (já sincronizado com o ConnectPlug) e salva
// uma "foto" do estoque de cada produto no dia de hoje, em
// front-index/historico-estoque.json. Mantém só os últimos 90 dias.
const fs = require('fs');
const path = require('path');

const PRODUTOS_PATH = path.join(__dirname, '..', 'front-index', 'produtos.json');
const HIST_PATH      = path.join(__dirname, '..', 'front-index', 'historico-estoque.json');
const DIAS_MANTIDOS  = 90;

function parseEstoque(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v).replace(/[^\d,.\-]/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

if (!fs.existsSync(PRODUTOS_PATH)) {
  console.error('produtos.json não encontrado em', PRODUTOS_PATH);
  process.exit(1);
}

const produtos = JSON.parse(fs.readFileSync(PRODUTOS_PATH, 'utf8'));
const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const snapshot = {};
produtos.forEach(function (p) {
  if (!p.codigo) return;
  snapshot[p.codigo] = parseEstoque(p.estoque);
});

let historico = {};
if (fs.existsSync(HIST_PATH)) {
  try {
    historico = JSON.parse(fs.readFileSync(HIST_PATH, 'utf8'));
  } catch (e) {
    console.warn('historico-estoque.json inválido, recomeçando do zero.', e.message);
    historico = {};
  }
}

historico[hoje] = snapshot;

// Poda: mantém só os últimos N dias, pra não crescer sem limite
const datas = Object.keys(historico).sort();
if (datas.length > DIAS_MANTIDOS) {
  datas.slice(0, datas.length - DIAS_MANTIDOS).forEach(function (d) {
    delete historico[d];
  });
}

fs.writeFileSync(HIST_PATH, JSON.stringify(historico, null, 2));
console.log('Snapshot salvo para ' + hoje + ': ' + Object.keys(snapshot).length + ' produtos.');
