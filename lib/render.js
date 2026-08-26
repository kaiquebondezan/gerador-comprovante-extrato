const fs = require("fs");
const {
  BANK_NAME,
  BRAND_COLOR,
  TEMPLATE_PATH,
  STATEMENT_TEMPLATE_PATH,
  DEFAULT_LOGO_PATH,
} = require("../config");
const { escapeHtml, formatBRL, nowInSaoPaulo, maskDoc } = require("./format");
const { generateTransactionId, generateProtocolo } = require("./ids");
const { formatDiaBR, formatDataHoraBR } = require("./statement");

const TEMPLATE_HTML = fs.readFileSync(TEMPLATE_PATH, "utf8");
const STATEMENT_TEMPLATE_HTML = fs.readFileSync(STATEMENT_TEMPLATE_PATH, "utf8");

function buildLogoImgTag(logoBase64) {
  if (logoBase64) {
    let src = logoBase64.trim();
    if (!src.startsWith("data:")) {
      src = `data:image/png;base64,${src}`;
    }
    return `<img src="${src}" alt="logo" />`;
  }
  if (fs.existsSync(DEFAULT_LOGO_PATH)) {
    const b64 = fs.readFileSync(DEFAULT_LOGO_PATH).toString("base64");
    return `<img src="data:image/png;base64,${b64}" alt="logo" />`;
  }
  return "";
}

function applyTemplate(templateHtml, replacements) {
  let html = templateHtml;
  for (const [key, val] of Object.entries(replacements)) {
    html = html.split(key).join(val);
  }
  return html;
}

function renderHtml(body) {
  const {
    logo_base64 = null,
    titulo = "Transferência enviada",
    valor,
    protocolo,
    recebedor = {},
    pagador = {},
  } = body;

  const now = new Date();
  const generatedAt = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const { dataFormatada, horarioFormatado } = nowInSaoPaulo(now);
  const transactionId = generateTransactionId(now);
  const protocoloFinal = protocolo || generateProtocolo();

  const replacements = {
    "{{LOGO_IMG}}": buildLogoImgTag(logo_base64),
    "{{BANK_NAME}}": escapeHtml(BANK_NAME),
    "{{BRAND_COLOR}}": escapeHtml(BRAND_COLOR),
    "{{TRANSACTION_TITLE}}": escapeHtml(titulo),
    "{{AMOUNT}}": escapeHtml(formatBRL(valor)),
    "{{PAYMENT_DATE}}": escapeHtml(dataFormatada),
    "{{PAYMENT_TIME}}": escapeHtml(horarioFormatado),
    "{{PROTOCOLO}}": escapeHtml(protocoloFinal),
    "{{TRANSACTION_ID}}": escapeHtml(transactionId),
    "{{RECEIVER_NAME}}": escapeHtml(recebedor.nome || ""),
    "{{RECEIVER_DOC}}": escapeHtml(maskDoc(recebedor.cpf_cnpj) || ""),
    "{{RECEIVER_INSTITUTION}}": escapeHtml(recebedor.instituicao || ""),
    "{{PAYER_NAME}}": escapeHtml(pagador.nome || ""),
    "{{PAYER_DOC}}": escapeHtml(maskDoc(pagador.cpf_cnpj) || ""),
    "{{PAYER_INSTITUTION}}": escapeHtml(pagador.instituicao || ""),
    "{{GENERATED_AT}}": escapeHtml(generatedAt),
  };

  return applyTemplate(TEMPLATE_HTML, replacements);
}

function buildMovRow(mov) {
  const isPositivo = mov.valor >= 0;
  return `<tr>
    <td class="col-data">${escapeHtml(formatDataHoraBR(mov.data))}</td>
    <td>${escapeHtml(mov.descricao)}</td>
    <td class="col-tipo"><span class="tipo-tag">${escapeHtml(mov.tipo)}</span></td>
    <td class="col-valor ${isPositivo ? "pos" : "neg"}">${escapeHtml(formatBRL(mov.valor))}</td>
  </tr>`;
}

function renderStatementHtml(conta, { movimentacoes, totais, periodoInicio, periodoFim }) {
  const now = new Date();
  const generatedAt = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const linhas = movimentacoes.length > 0
    ? movimentacoes.map(buildMovRow).join("\n")
    : `<tr><td colspan="4" style="text-align:center;color:#8a8a8a;padding:18px 0;">Nenhuma movimentação no período selecionado.</td></tr>`;

  const replacements = {
    "{{LOGO_IMG}}": buildLogoImgTag(null),
    "{{BANK_NAME}}": escapeHtml(BANK_NAME),
    "{{BRAND_COLOR}}": escapeHtml(BRAND_COLOR),
    "{{TITULAR}}": escapeHtml(conta.titular || ""),
    "{{AGENCIA}}": escapeHtml(conta.agencia || ""),
    "{{CONTA}}": escapeHtml(conta.conta || ""),
    "{{PERIODO_INICIO}}": escapeHtml(formatDiaBR(periodoInicio)),
    "{{PERIODO_FIM}}": escapeHtml(formatDiaBR(periodoFim)),
    "{{SALDO_ATUAL}}": escapeHtml(formatBRL(conta.saldo)),
    "{{ENTRADAS}}": escapeHtml(formatBRL(totais.entradas)),
    "{{SAIDAS}}": escapeHtml(formatBRL(-totais.saidas)),
    "{{SALDO_PERIODO}}": escapeHtml(formatBRL(totais.saldoPeriodo)),
    "{{LINHAS_MOVIMENTACOES}}": linhas,
    "{{GENERATED_AT}}": escapeHtml(generatedAt),
  };

  return applyTemplate(STATEMENT_TEMPLATE_HTML, replacements);
}

module.exports = { renderHtml, renderStatementHtml };
