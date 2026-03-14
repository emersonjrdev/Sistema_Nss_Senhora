import React, { useMemo } from "react";

function getCurrentMonthCount(servidores) {
  const now = new Date();
  return servidores.filter((servidor) => {
    if (!servidor.createdAt) return false;
    const created = new Date(servidor.createdAt);
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth()
    );
  }).length;
}

function getFunctionBreakdown(servidores) {
  const grouped = servidores.reduce((acc, item) => {
    const key = item.funcao || "Sem função";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3);
}

export default function DashboardCards({ servidores }) {
  const metrics = useMemo(() => {
    const total = servidores.length;
    const ativos = servidores.filter((s) => (s.status || "Ativo") === "Ativo").length;
    const novosNoMes = getCurrentMonthCount(servidores);
    const topFuncoes = getFunctionBreakdown(servidores);

    return { total, ativos, novosNoMes, topFuncoes };
  }, [servidores]);

  return (
    <section className="dashboard-grid">
      <article className="dashboard-card">
        <p className="dashboard-label">Total de servidores</p>
        <strong>{metrics.total}</strong>
        <span className="dashboard-helper">Registros gerais cadastrados</span>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-label">Servidores ativos</p>
        <strong>{metrics.ativos}</strong>
        <span className="dashboard-helper">Atualmente em atividade</span>
      </article>

      <article className="dashboard-card">
        <p className="dashboard-label">Novos no mês</p>
        <strong>{metrics.novosNoMes}</strong>
        <span className="dashboard-helper">Cadastros recentes</span>
      </article>

      <article className="dashboard-card dashboard-card-highlight">
        <p className="dashboard-label">Funções mais frequentes</p>
        <div className="function-breakdown">
          {metrics.topFuncoes.length > 0 ? (
            metrics.topFuncoes.map(([funcao, qtd]) => (
              <div key={funcao} className="function-row">
                <span>{funcao}</span>
                <b>{qtd}</b>
              </div>
            ))
          ) : (
            <span className="dashboard-helper">Sem dados de função ainda</span>
          )}
        </div>
      </article>
    </section>
  );
}
