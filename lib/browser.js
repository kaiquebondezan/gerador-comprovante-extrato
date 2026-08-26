const fs = require("fs");
const { chromium } = require("playwright");
const { CHROMIUM_PATH } = require("../config");

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    const launchOpts = { args: ["--no-sandbox"] };
    if (CHROMIUM_PATH && fs.existsSync(CHROMIUM_PATH)) {
      launchOpts.executablePath = CHROMIUM_PATH;
    }
    browserPromise = chromium.launch(launchOpts);
  }
  return browserPromise;
}

// `selector` é o elemento raiz do documento a ser recortado (o comprovante
// usa ".card", o extrato usa ".sheet" — cada template define o seu).
// `viewportWidth` deve bater com a largura definida no CSS do template.
async function renderToBuffer(html, format, options = {}) {
  const { selector = ".card", viewportWidth = 480 } = options;

  const browser = await getBrowser();
  const page = await browser.newPage({
    viewport: { width: viewportWidth, height: 900 },
  });
  try {
    await page.setContent(html, { waitUntil: "networkidle" });
    const root = await page.$(selector);
    const box = await root.boundingBox();

    if (format === "pdf") {
      return await page.pdf({
        width: `${Math.ceil(box.width)}px`,
        height: `${Math.ceil(box.height)}px`,
        printBackground: true,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
      });
    }
    // png
    return await root.screenshot({ type: "png" });
  } finally {
    await page.close();
  }
}

// Fecha o Chromium headless. Chamado no encerramento gracioso do processo
// (SIGINT/SIGTERM) para não deixar o processo do navegador órfão.
async function closeBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    browserPromise = null;
    await browser.close();
  }
}

module.exports = { renderToBuffer, closeBrowser };
