const path = require("path");

// Nome/cor do banco fictício exibido no comprovante. Fixos de propósito —
// veja o aviso de simulação no README antes de mudar isso.
const BANK_NAME = "ColmeIA Bank";
const BRAND_COLOR = "#4d4d4d";

const TEMPLATE_PATH = path.join(__dirname, "templates", "receipt.html");
const STATEMENT_TEMPLATE_PATH = path.join(__dirname, "templates", "statement.html");
const DEFAULT_LOGO_PATH = path.join(__dirname, "public", "default-logo.png");
const EXTRATOS_DATA_PATH = path.join(__dirname, "data", "extratos.json");

// Onde os arquivos gerados com `format=url` ficam guardados pra serem
// servidos em /arquivos/<nome>. É uma pasta local, sem persistência: no
// plano free do Render (e em qualquer disco efêmero) ela é apagada a cada
// sono/reinício da instância — os links só duram enquanto ela estiver acordada.
const GENERATED_DIR = path.join(__dirname, "generated");

const PORT = process.env.PORT || 3000;

// URL pública em que a API está servindo (usada para montar o link
// devolvido por `format=url`). Se não definida, a API monta a URL a partir
// do host da própria requisição — o que já funciona sozinho no Render.
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || null;

// Caminho opcional para um executável de Chromium específico (por exemplo,
// em ambientes com um Chromium pré-instalado fora do cache padrão do
// Playwright). Se não for definido, o Playwright resolve o Chromium sozinho
// a partir do que foi instalado com `npx playwright install chromium`.
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || null;

module.exports = {
  BANK_NAME,
  BRAND_COLOR,
  TEMPLATE_PATH,
  STATEMENT_TEMPLATE_PATH,
  DEFAULT_LOGO_PATH,
  EXTRATOS_DATA_PATH,
  GENERATED_DIR,
  PORT,
  CHROMIUM_PATH,
  PUBLIC_BASE_URL,
};
