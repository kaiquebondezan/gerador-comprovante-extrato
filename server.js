const express = require("express");
const { PORT, GENERATED_DIR } = require("./config");
const { closeBrowser } = require("./lib/browser");
const healthRoutes = require("./routes/health");
const comprovanteRoutes = require("./routes/comprovante");
const extratoRoutes = require("./routes/extrato");

const app = express();

// Necessário para que req.protocol reflita "https" corretamente atrás do
// proxy do Render (e de qualquer plataforma que termine TLS na frente da
// aplicação) — sem isso, as URLs montadas por `format=url` sairiam como
// "http://" mesmo estando a API atrás de HTTPS.
app.set("trust proxy", true);

app.use(express.json({ limit: "5mb" }));

app.use(healthRoutes);
app.use(comprovanteRoutes);
app.use(extratoRoutes);

// Serve os PDFs/PNGs gerados com `format=url`. Pasta sem persistência: some
// a cada sono/reinício da instância no plano free do Render.
app.use("/arquivos", express.static(GENERATED_DIR));

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
