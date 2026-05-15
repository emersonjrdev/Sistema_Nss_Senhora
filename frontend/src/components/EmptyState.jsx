import React from "react";

export default function EmptyState({ canEdit = true }) {
  return (
    <div className="empty-state-box">
      <div className="empty-icon">⛪</div>
      <h4>Nenhum servidor encontrado</h4>
      <p>
        {canEdit ? (
          <>
            Ajuste os filtros ou use o botão <strong>Novo servidor</strong> acima quando estiver autenticado como
            editor.
          </>
        ) : (
          <>
            Ajuste os filtros ou use <strong>Atualizar meu cadastro</strong> se o seu nome não aparecer (confirme com
            telefone ou data de nascimento já cadastrados).
          </>
        )}
      </p>
    </div>
  );
}
