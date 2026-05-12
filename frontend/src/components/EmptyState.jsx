import React from "react";

export default function EmptyState() {
  return (
    <div className="empty-state-box">
      <div className="empty-icon">⛪</div>
      <h4>Nenhum servidor encontrado</h4>
      <p>
        Ajuste os filtros ou use o botão <strong>Novo servidor</strong> acima quando estiver autenticado como editor.
      </p>
    </div>
  );
}
