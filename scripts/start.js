// Ponto de entrada usado por `npm start` / `npm run dev`: garante o Chromium
// instalado e só então sobe o servidor.
const { ensureChromium } = require("./ensure-chromium");

ensureChromium();
require("../server");
