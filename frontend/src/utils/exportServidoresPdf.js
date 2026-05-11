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

function resolveHtml2Pdf(mod) {
  const d = mod?.default ?? mod;
  if (typeof d === "function") return d;
  if (d && typeof d.default === "function") return d.default;
  return null;
}

function waitFrames(n = 2) {
  return new Promise((resolve) => {
    function step() {
      if (n <= 0) resolve();
      else {
        n -= 1;
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  });
}

function loadIframeSrcdoc(iframe, html, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error("Tempo esgotado ao preparar o PDF."));
    }, timeoutMs);
    iframe.onload = () => {
      clearTimeout(t);
      resolve();
    };
    iframe.onerror = () => {
      clearTimeout(t);
      reject(new Error("Falha ao carregar o modelo do PDF."));
    };
    iframe.srcdoc = html;
  });
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => {
    if (a.parentNode) a.parentNode.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

/**
 * Gera PDF da lista de servidores.
 * Usa iframe fora da área visível para não cobrir a tela no celular (evita toques bloqueados)
 * e para o html2canvas medir o layout corretamente.
 */
export async function downloadServidoresPdf(servidores) {
  const mod = await import("html2pdf.js");
  const html2pdf = resolveHtml2Pdf(mod);
  if (!html2pdf) {
    throw new Error("Não foi possível carregar a biblioteca de PDF.");
  }

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

  const inner = `
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

  const srcdoc = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=1123"></head><body style="margin:0;background:#fff;">
<div id="pdf-root" style="box-sizing:border-box;width:1123px;min-height:400px;padding:16px 20px;font-family:Segoe UI,system-ui,-apple-system,sans-serif;font-size:9pt;color:#1e293b;line-height:1.35;background:#fff">${inner}</div></body></html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "geracao-pdf");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  iframe.style.cssText = [
    "position:fixed",
    "left:-12000px",
    "top:0",
    "width:1123px",
    "height:2000px",
    "border:0",
    "margin:0",
    "padding:0",
    "opacity:0",
    "pointer-events:none",
  ].join(";");

  const opt = {
    margin: [8, 8, 8, 8],
    filename,
    image: { type: "jpeg", quality: 0.92 },
    html2canvas: {
      scale: Math.min(2, (window.devicePixelRatio || 1) * 1.25),
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  document.body.appendChild(iframe);

  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText = [
    "position:fixed",
    "left:-12000px",
    "top:0",
    "width:1123px",
    "min-height:400px",
    "box-sizing:border-box",
    "padding:0",
    "margin:0",
    "background:#fff",
    "pointer-events:none",
    "opacity:0",
  ].join(";");

  try {
    await loadIframeSrcdoc(iframe, srcdoc);
    const idoc = iframe.contentDocument;
    const root = idoc && idoc.getElementById("pdf-root");
    if (!root) {
      throw new Error("Conteúdo do PDF não pôde ser montado.");
    }
    holder.appendChild(root.cloneNode(true));
    document.body.appendChild(holder);
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);

    await waitFrames(2);
    const blob = await html2pdf().set(opt).from(holder).outputPdf("blob");
    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error("O PDF gerado está vazio.");
    }
    triggerBlobDownload(blob, filename);
  } finally {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    if (holder.parentNode) holder.parentNode.removeChild(holder);
  }
}
