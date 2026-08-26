const express = require("express");
const { PORT } = require("./config");
const { closeBrowser } = require("./lib/browser");
const healthRoutes = require("./routes/health");
const comprovanteRoutes = require("./routes/comprovante");
const extratoRoutes = require("./routes/extrato");

const app = express();
app.use(express.json({ limit: "5mb" }));

app.use(healthRoutes);
app.use(comprovanteRoutes);
app.use(extratoRoutes);

const server = app.listen(PORT, () => {
  console.log(`Comprovante API (SIMULAÇÃO) rodando na porta ${PORT}`);
});

// Encerramento gracioso: fecha o servidor HTTP e o Chromium headless antes de
// sair, tanto em SIGTERM (ex.: `docker stop`) quanto em SIGINT (Ctrl+C,
// inclusive no Windows).
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\nRecebido ${signal}, encerrando...`);
  server.close();
  await closeBrowser();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;
