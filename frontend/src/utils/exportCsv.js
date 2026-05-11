function escapeCell(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function servidoresToCsvRows(servidores) {
  const headers = [
    "nome",
    "funcao",
    "status",
    "telefone",
    "nascimento",
    "inicio",
    "local",
    "comunidade",
    "observacoes",
    "cadastrado_em",
  ];
  const lines = [headers.join(",")];
  for (const s of servidores) {
    const row = [
      s.name,
      s.funcao,
      s.status || "Ativo",
      s.telefone,
      s.nascimento,
      s.inicio,
      s.local,
      s.comunidade,
      s.observacoes,
      s.createdAt,
    ].map(escapeCell);
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

export function downloadTextFile(filename, text, mime = "text/csv;charset=utf-8") {
  const blob = new Blob(["\ufeff", text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
