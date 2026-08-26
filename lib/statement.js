// Helpers específicos do extrato: filtrar movimentações por período e somar
// entradas/saídas. As datas fictícias já vêm com o offset "-03:00" (o mesmo
// de America/Sao_Paulo, que não observa horário de verão atualmente), então
// os 10 primeiros caracteres do ISO ("AAAA-MM-DD") já são o dia local certo
// — não precisa converter fuso horário pra filtrar por dia.

function dateOnly(isoString) {
  return isoString.slice(0, 10);
}

// Recorta as movimentações para o intervalo [inicio, fim] (strings AAAA-MM-DD,
// inclusivas). Qualquer um dos dois pode ser omitido para não limitar aquele lado.
function filterByPeriod(movimentacoes, inicio, fim) {
  return movimentacoes.filter((mov) => {
    const dia = dateOnly(mov.data);
    if (inicio && dia < inicio) return false;
    if (fim && dia > fim) return false;
    return true;
  });
}

function computeTotals(movimentacoes) {
  let entradas = 0;
  let saidas = 0;
  for (const mov of movimentacoes) {
    if (mov.valor >= 0) entradas += mov.valor;
    else saidas += Math.abs(mov.valor);
  }
  return {
    entradas,
    saidas,
    saldoPeriodo: entradas - saidas,
  };
}

// Formata um dia "AAAA-MM-DD" como "DD/MM/AAAA".
function formatDiaBR(diaISO) {
  const [ano, mes, dia] = diaISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Formata a data+hora completa de uma movimentação como "DD/MM/AAAA HH:mm".
function formatDataHoraBR(isoString) {
  const dia = formatDiaBR(dateOnly(isoString));
  const hora = isoString.slice(11, 16);
  return `${dia} ${hora}`;
}

module.exports = {
  dateOnly,
  filterByPeriod,
  computeTotals,
  formatDiaBR,
  formatDataHoraBR,
};
