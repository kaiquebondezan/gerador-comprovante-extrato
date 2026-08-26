const { Router } = require("express");
const { renderHtml } = require("../lib/render");
const { renderToBuffer } = require("../lib/browser");

const router = Router();

const VALID_FORMATS = ["pdf", "png", "both"];

function validateBody(body) {
  const errors = [];

  if (body.valor === undefined || body.valor === null || body.valor === "") {
    errors.push("'valor' é obrigatório");
  } else if (Number.isNaN(Number(body.valor))) {
    errors.push("'valor' deve ser um número");
  }

  if (!body.recebedor || typeof body.recebedor !== "object") {
    errors.push("'recebedor' é obrigatório e deve ser um objeto");
  } else if (!body.recebedor.nome) {
    errors.push("'recebedor.nome' é obrigatório");
  }

  if (!body.pagador || typeof body.pagador !== "object") {
    errors.push("'pagador' é obrigatório e deve ser um objeto");
  } else if (!body.pagador.nome) {
    errors.push("'pagador.nome' é obrigatório");
  }

  return errors;
}

router.post("/comprovante", async (req, res) => {
  try {
    const format = String(req.query.format || "pdf").toLowerCase();
    if (!VALID_FORMATS.includes(format)) {
      return res.status(400).json({
        error: `'format' deve ser um de: ${VALID_FORMATS.join(", ")}`,
      });
    }

    const body = req.body || {};
    const validationErrors = validateBody(body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Dados inválidos no body da requisição",
        details: validationErrors,
      });
    }

    const html = renderHtml(body);

    if (format === "both") {
      const [pdfBuf, pngBuf] = await Promise.all([
        renderToBuffer(html, "pdf"),
        renderToBuffer(html, "png"),
      ]);
      return res.json({
        pdf_base64: pdfBuf.toString("base64"),
        png_base64: pngBuf.toString("base64"),
      });
    }

    const buf = await renderToBuffer(html, format);
    res.setHeader(
      "Content-Type",
      format === "pdf" ? "application/pdf" : "image/png"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="comprovante.${format}"`
    );
    return res.send(buf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Falha ao gerar comprovante",
      detail: String(err.message || err),
    });
  }
});

module.exports = router;
