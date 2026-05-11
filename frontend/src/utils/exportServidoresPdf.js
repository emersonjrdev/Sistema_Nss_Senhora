function escHtml(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}

function formatDatePt(v) {
  if (v == null || v === "") return "—";
  try {
    const raw = String(v);
    const dt = raw.includes("T") ? new Date(raw) : new Date(raw.slice(0, 10) + "T12:00:00");
    if (Number.isNaN(dt.getTime())) return escHtml(raw);
    return dt.toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

/**
 * Gera PDF institucional da lista de servidores (UTF-8, layout para impressão).
 */
export async function downloadServidoresPdf(servidores) {
  const { default: html2pdf } = await import("html2pdf.js");

  const hoje = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const filename = `servidores-altar-${new Date().toISOString().slice(0, 10)}.pdf`;

  const rows = servidores
    .map(
      (s, i) => `
    <tr style="background:${i % 2 ? "#f8fafc" : "#fff"}">
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escHtml(s.name)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escHtml(s.funcao)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escHtml(s.status || "Ativo")}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escHtml(s.telefone)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${formatDatePt(s.nascimento)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${formatDatePt(s.inicio)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escHtml(s.local)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escHtml(s.comunidade)}</td>
    </tr>`
    )
    .join("");

  const wrap = document.createElement("div");
  wrap.setAttribute("data-pdf-root", "1");
  wrap.style.cssText =
    "position:absolute;left:-9999px;top:0;width:190mm;box-sizing:border-box;padding:0;background:#fff;color:#1e293b;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;font-size:9pt;line-height:1.35;";
  wrap.innerHTML = `
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1e40af 100%);color:#fff;padding:18px 22px;border-radius:0 0 14px 14px;margin-bottom:14px;">
      <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">Pastoral do Altar</div>
      <h1 style="margin:6px 0 0;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Cadastro de servidores</h1>
      <p style="margin:8px 0 0;font-size:10.5pt;opacity:0.9;">Relatório gerado em ${escHtml(hoje)} · ${servidores.length} registro(s)</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:8.5pt;">
      <thead>
        <tr style="background:#f1f5f9;color:#0f172a;">
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;">Nome</th>
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;">Função</th>
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;">Status</th>
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;">Telefone</th>
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;">Nasc.</th>
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;">Início</th>
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;">Local</th>
          <th style="text-align:left;padding:8px 6px;border-bottom:2px solid #cbd5e1;">Comunidade</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="8" style="padding:16px;text-align:center;color:#64748b;">Nenhum servidor.</td></tr>`}
      </tbody>
    </table>
    <p style="margin-top:14px;font-size:8pt;color:#94a3b8;text-align:center;">Documento gerado pelo sistema · uso interno da paróquia</p>
  `;

  document.body.appendChild(wrap);

  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: "jpeg", quality: 0.96 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await html2pdf().set(opt).from(wrap).save();
  } finally {
    document.body.removeChild(wrap);
  }
}
