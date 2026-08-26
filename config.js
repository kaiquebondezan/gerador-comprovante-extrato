const path = require("path");

const BANK_NAME = "ColmeIA Bank";
const BRAND_COLOR = "#4d4d4d";

const TEMPLATE_PATH = path.join(__dirname, "templates", "receipt.html");
const STATEMENT_TEMPLATE_PATH = path.join(__dirname, "templates", "statement.html");
const DEFAULT_LOGO_PATH = path.join(__dirname, "public", "default-logo.png");
const EXTRATOS_DATA_PATH = path.join(__dirname, "data", "extratos.json");

const GENERATED_DIR = path.join(__dirname, "generated");

const PORT = process.env.PORT || 3000;

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || null;

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
