function dateOnly(isoString) {
  return isoString.slice(0, 10);
}

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

function formatDiaBR(diaISO) {
  const [ano, mes, dia] = diaISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

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
