const fs = require("fs");
const { Router } = require("express");
const { EXTRATOS_DATA_PATH } = require("../config");
const { renderStatementHtml } = require("../lib/render");
const { renderToBuffer } = require("../lib/browser");
const {
  dateOnly,
  filterByPeriod,
  computeTotals,
} = require("../lib/statement");

const router = Router();

const VALID_FORMATS = ["pdf", "png", "both"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Carregado uma vez na subida do processo — são só 4 contas fictícias fixas.
const CONTAS = JSON.parse(fs.readFileSync(EXTRATOS_DATA_PATH, "utf8"));

// Sem `inicio`/`fim` no request, o extrato cobre toda a história disponível
// da conta (da movimentação mais antiga à mais recente).
function periodoPadrao(movimentacoes) {
  const dias = movimentacoes.map((mov) => dateOnly(mov.data)).sort();
  return { inicio: dias[0], fim: dias[dias.length - 1] };
}

router.get("/extrato", async (req, res) => {
  try {
    const format = String(req.query.format || "pdf").toLowerCase();
    if (!VALID_FORMATS.includes(format)) {
      return res.status(400).json({
        error: `'format' deve ser um de: ${VALID_FORMATS.join(", ")}`,
      });
    }

    const { contaId, inicio, fim } = req.query;

    if (!contaId || !CONTAS[contaId]) {
      return res.status(404).json({
        error: `Conta '${contaId || ""}' não encontrada`,
      });
    }

    if (inicio && !DATE_RE.test(inicio)) {
      return res.status(400).json({ error: "'inicio' deve estar no formato AAAA-MM-DD" });
    }
    if (fim && !DATE_RE.test(fim)) {
      return res.status(400).json({ error: "'fim' deve estar no formato AAAA-MM-DD" });
    }
    if (inicio && fim && inicio > fim) {
      return res.status(400).json({ error: "'inicio' não pode ser depois de 'fim'" });
    }

    const conta = CONTAS[contaId];
    const padrao = periodoPadrao(conta.movimentacoes);
    const periodoInicio = inicio || padrao.inicio;
    const periodoFim = fim || padrao.fim;

    const movimentacoes = filterByPeriod(conta.movimentacoes, periodoInicio, periodoFim);
    const totais = computeTotals(movimentacoes);

    const html = renderStatementHtml(conta, {
      movimentacoes,
      totais,
      periodoInicio,
      periodoFim,
    });

    const renderOpts = { selector: ".sheet", viewportWidth: 640 };

    if (format === "both") {
      const [pdfBuf, pngBuf] = await Promise.all([
        renderToBuffer(html, "pdf", renderOpts),
        renderToBuffer(html, "png", renderOpts),
      ]);
      return res.json({
        pdf_base64: pdfBuf.toString("base64"),
        png_base64: pngBuf.toString("base64"),
      });
    }

    const buf = await renderToBuffer(html, format, renderOpts);
    res.setHeader(
      "Content-Type",
      format === "pdf" ? "application/pdf" : "image/png"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="extrato.${format}"`
    );
    return res.send(buf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Falha ao gerar extrato",
      detail: String(err.message || err),
    });
  }
});

module.exports = router;
