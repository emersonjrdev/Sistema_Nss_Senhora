/** Remove tudo que não for dígito */
export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Máscara simples (BR): (00) 00000-0000 ou (00) 0000-0000 */
export function maskPhoneBR(value) {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/** Valida comprimento típico de telefone BR (10 ou 11 dígitos) */
export function isValidBrPhoneMasked(masked) {
  const n = digitsOnly(masked).length;
  return n === 0 || n === 10 || n === 11;
}
