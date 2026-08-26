const express = require("express");
const { PORT, GENERATED_DIR } = require("./config");
const { closeBrowser } = require("./lib/browser");
const healthRoutes = require("./routes/health");
const comprovanteRoutes = require("./routes/comprovante");
const extratoRoutes = require("./routes/extrato");

const app = express();

app.set("trust proxy", true);

app.use(express.json({ limit: "5mb" }));

app.use(healthRoutes);
app.use(comprovanteRoutes);
app.use(extratoRoutes);

app.use("/arquivos", express.static(GENERATED_DIR));

const server = app.listen(PORT, () => {
  console.log(`Comprovante API (SIMULAÇÃO) rodando na porta ${PORT}`);
});

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
