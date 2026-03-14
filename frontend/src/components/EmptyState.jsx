import React from "react";

export default function EmptyState() {
  return (
    <div className="empty-state-box">
      <div className="empty-icon">⛪</div>
      <h4>Nenhum servidor encontrado</h4>
      <p>
        Ajuste os filtros ou realize um novo cadastro para começar a gestão pastoral
        dos servidores do altar.
      </p>
    </div>
  );
}
