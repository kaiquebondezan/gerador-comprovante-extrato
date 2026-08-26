const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { GENERATED_DIR, PUBLIC_BASE_URL } = require("../config");

fs.mkdirSync(GENERATED_DIR, { recursive: true });

function saveGeneratedFile(buffer, ext) {
  const filename = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(GENERATED_DIR, filename), buffer);
  return filename;
}

function buildFileUrl(req, filename) {
  const base = PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base.replace(/\/+$/, "")}/arquivos/${filename}`;
}

module.exports = { saveGeneratedFile, buildFileUrl };
