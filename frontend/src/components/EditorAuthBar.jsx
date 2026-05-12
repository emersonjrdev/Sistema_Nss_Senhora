import React from "react";
import { useAuth } from "../context/AuthContext";

export default function EditorAuthBar() {
  const { authReady, editorAuthRequired, canEdit, openLogin, logout } = useAuth();

  if (!authReady || !editorAuthRequired) return null;

  return (
    <div className="editor-auth-bar" role="region" aria-label="Autenticação para edição">
      <div className="editor-auth-bar-inner">
        {canEdit ? (
          <>
            <span>Modo edição ativo.</span>
            <button type="button" className="btn secondary small" onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <span>Modo somente leitura — faça login para alterar dados.</span>
            <button type="button" className="btn btn-primary small" onClick={openLogin}>
              Entrar como editor
            </button>
          </>
        )}
      </div>
    </div>
  );
}
