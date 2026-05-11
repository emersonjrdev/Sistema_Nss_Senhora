import React, { useMemo, useState } from "react";
import { downloadServidoresPdf } from "../utils/exportServidoresPdf";

export default function RelatoriosView({ servidores, toast }) {
  const [exporting, setExporting] = useState(false);

  const stats = useMemo(() => {
    const total = servidores.length;
    const ativos = servidores.filter((s) => (s.status || "Ativo") === "Ativo").length;
    const porFuncao = servidores.reduce((acc, s) => {
      const k = s.funcao || "Sem função";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const topFuncoes = Object.entries(porFuncao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const comTelefone = servidores.filter((s) => s.telefone).length;
    const comNascimento = servidores.filter((s) => s.nascimento).length;
    return { total, ativos, topFuncoes, comTelefone, comNascimento };
  }, [servidores]);

  async function handleExportPdf() {
    if (!servidores.length) return;
    try {
      setExporting(true);
      await downloadServidoresPdf(servidores);
      toast?.success("PDF gerado e baixado.");
    } catch (err) {
      console.error(err);
      toast?.error(err.message || "Não foi possível gerar o PDF.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="module-relatorios">
      <header className="module-section-header">
        <h2>Relatórios</h2>
        <p>Resumo dos cadastros e exportação em PDF para impressão ou arquivo.</p>
      </header>

      <div className="relatorio-grid">
        <article className="relatorio-card">
          <span className="relatorio-label">Total cadastrado</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="relatorio-card">
          <span className="relatorio-label">Ativos</span>
          <strong>{stats.ativos}</strong>
        </article>
        <article className="relatorio-card">
          <span className="relatorio-label">Com telefone</span>
          <strong>{stats.comTelefone}</strong>
        </article>
        <article className="relatorio-card">
          <span className="relatorio-label">Com data de nascimento</span>
          <strong>{stats.comNascimento}</strong>
        </article>
      </div>

      <div className="relatorio-funcoes">
        <h3>Por função (top 5)</h3>
        <ul>
          {stats.topFuncoes.length === 0 ? (
            <li className="muted">Nenhum dado ainda.</li>
          ) : (
            stats.topFuncoes.map(([nome, qtd]) => (
              <li key={nome}>
                <span>{nome}</span>
                <b>{qtd}</b>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="relatorio-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleExportPdf}
          disabled={!servidores.length || exporting}
        >
          {exporting ? "Gerando PDF…" : "Exportar PDF"}
        </button>
        {!servidores.length && (
          <span className="muted">Cadastre servidores para habilitar a exportação.</span>
        )}
      </div>
    </section>
  );
}
