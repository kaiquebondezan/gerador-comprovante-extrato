const path = require("path");

// Nome/cor do banco fictício exibido no comprovante. Fixos de propósito —
// veja o aviso de simulação no README antes de mudar isso.
const BANK_NAME = "ColmeIA Bank";
const BRAND_COLOR = "#4d4d4d";

const TEMPLATE_PATH = path.join(__dirname, "templates", "receipt.html");
const STATEMENT_TEMPLATE_PATH = path.join(__dirname, "templates", "statement.html");
const DEFAULT_LOGO_PATH = path.join(__dirname, "public", "default-logo.png");
const EXTRATOS_DATA_PATH = path.join(__dirname, "data", "extratos.json");

const PORT = process.env.PORT || 3000;

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
  PORT,
  CHROMIUM_PATH,
};
