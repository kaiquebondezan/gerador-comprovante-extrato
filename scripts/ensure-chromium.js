const fs = require("fs");
const { execSync } = require("child_process");
const { chromium } = require("playwright");
const { CHROMIUM_PATH } = require("../config");

function isChromiumInstalled() {
  if (CHROMIUM_PATH) {
    return fs.existsSync(CHROMIUM_PATH);
  }
  try {
    return fs.existsSync(chromium.executablePath());
  } catch (err) {
    return false;
  }
}

function ensureChromium() {
  if (isChromiumInstalled()) return;

  console.log(
    "Chromium do Playwright não encontrado. Baixando (só acontece uma vez, pode levar um minuto)..."
  );
  execSync("npx playwright install chromium", { stdio: "inherit" });
}

module.exports = { ensureChromium, isChromiumInstalled };
