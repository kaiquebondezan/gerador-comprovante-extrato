const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { GENERATED_DIR, PUBLIC_BASE_URL } = require("../config");

fs.mkdirSync(GENERATED_DIR, { recursive: true });

// Salva um buffer gerado (PDF ou PNG) com um nome único, pra ser servido
// depois em GET /arquivos/<nome>. Sem persistência: essa pasta é apagada a
// cada sono/reinício da instância no plano free do Render (ou em qualquer
// disco efêmero) — os arquivos só existem enquanto o processo estiver de pé.
function saveGeneratedFile(buffer, ext) {
  const filename = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(GENERATED_DIR, filename), buffer);
  return filename;
}

// Monta a URL pública completa para um arquivo salvo com saveGeneratedFile.
// Usa PUBLIC_BASE_URL se definida; senão, deduz do host da própria requisição
// (funciona sozinho no Render, desde que `trust proxy` esteja habilitado).
function buildFileUrl(req, filename) {
  const base = PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base.replace(/\/+$/, "")}/arquivos/${filename}`;
}

module.exports = { saveGeneratedFile, buildFileUrl };
