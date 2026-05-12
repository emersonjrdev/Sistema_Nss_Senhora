import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function cell(v) {
  if (v == null) return "";
  return String(v).replace(/\r?\n/g, " ");
}

function fmtDate(v) {
  if (v == null || v === "") return "—";
  try {
    const raw = String(v);
    const d = raw.includes("T") ? new Date(raw) : new Date(raw.slice(0, 10) + "T12:00:00");
    if (Number.isNaN(d.getTime())) return cell(raw);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
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
 * PDF dos servidores via jsPDF + autoTable (vetorial, sem html2canvas).
 * Não insere iframes nem camadas na página — evita PDF em branco e toques bloqueados no celular.
 */
export function downloadServidoresPdf(servidores) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 26, "F");
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.4);
  doc.line(0, 26, W, 26);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("PASTORAL DO ALTAR", 10, 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Cadastro de servidores", 10, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const hojeStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Gerado em ${hojeStr}  |  ${servidores.length} registro(s)`, 10, 21);

  const head = [["Nome", "Função", "Status", "Telefone", "Nasc.", "Início", "Local", "Comunidade"]];
  const body =
    servidores.length > 0
      ? servidores.map((s) => [
          cell(s.name),
          cell(s.funcao),
          cell(s.status || "Ativo"),
          cell(s.telefone),
          fmtDate(s.nascimento),
          fmtDate(s.inicio),
          cell(s.local),
          cell(s.comunidade),
        ])
      : [["—", "—", "—", "—", "—", "—", "—", "Nenhum servidor cadastrado"]];

  autoTable(doc, {
    startY: 29,
    head,
    body,
    theme: "striped",
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.3,
      textColor: [30, 41, 59],
      valign: "middle",
      overflow: "linebreak",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 10, right: 10, bottom: 12 },
    tableLineColor: [203, 213, 225],
    tableLineWidth: 0.1,
    didDrawPage: () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Documento gerado pelo sistema — uso interno da paróquia", W / 2, H - 4, {
        align: "center",
      });
    },
  });

  const filename = `servidores-altar-${new Date().toISOString().slice(0, 10)}.pdf`;
  const blob = doc.output("blob");
  if (!(blob instanceof Blob) || blob.size < 80) {
    throw new Error("O PDF não foi gerado corretamente.");
  }
  triggerBlobDownload(blob, filename);
}
