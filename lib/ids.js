function randomDigits(n) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

const ALNUM_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function randomAlnum(n) {
  let s = "";
  for (let i = 0; i < n; i++) {
    s += ALNUM_CHARS[Math.floor(Math.random() * ALNUM_CHARS.length)];
  }
  return s;
}

function generateTransactionId(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map = {};
  for (const p of parts) map[p.type] = p.value;

  const dateStr = `${map.year}${map.month}${map.day}`;
  const timeStr = `${map.hour}${map.minute}`;
  return `E${randomDigits(8)}${dateStr}${timeStr}${randomAlnum(11)}`;
}

function generateProtocolo() {
  return randomDigits(15);
}

module.exports = { generateTransactionId, generateProtocolo };
