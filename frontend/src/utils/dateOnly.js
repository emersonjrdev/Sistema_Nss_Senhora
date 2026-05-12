/**
 * Datas “só calendário” (nascimento, início no altar) sem horário.
 * Evita deslocar o dia ao usar new Date("YYYY-MM-DD") (interpretado como UTC).
 */

export function toCalendarDateString(raw) {
  if (raw == null || raw === "") return "";
  const s = String(raw).trim();
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/** Formata para pt-BR usando ano/mês/dia do calendário (sem fuso na data-only). */
export function formatDateOnlyPtBR(raw) {
  const key = toCalendarDateString(raw);
  if (!key) return "-";
  const [y, mo, d] = key.split("-").map(Number);
  if (!y || !mo || !d) return "-";
  return new Date(y, mo - 1, d).toLocaleDateString("pt-BR");
}

/** Chave YYYY-MM-DD para ordenação lexicográfica. */
export function calendarDateSortKey(raw) {
  return toCalendarDateString(raw);
}

/** `YYYY-MM` derivado do calendário local (filtro por período). */
export function calendarYearMonth(raw) {
  const key = toCalendarDateString(raw);
  if (!key) return "";
  return key.slice(0, 7);
}
