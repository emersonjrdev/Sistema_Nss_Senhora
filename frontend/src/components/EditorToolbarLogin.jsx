import React from "react";
import { useAuth } from "../context/AuthContext";

function hasApiUrl() {
  return Boolean(String(import.meta.env.VITE_API_URL || "").trim());
}

/**
 * Botão sempre visível na área do módulo quando há API configurada e edição pode exigir login.
 */
export default function EditorToolbarLogin() {
  const { authReady, editorAuthRequired, canEdit, openLogin, logout } = useAuth();

  if (!hasApiUrl()) return null;

  if (!authReady) {
    return (
      <div className="editor-toolbar-login muted" aria-live="polite">
        Verificando acesso…
      </div>
    );
  }

  if (!editorAuthRequired) return null;

  if (canEdit) {
    return (
      <button type="button" className="btn secondary small editor-toolbar-login-btn" onClick={logout}>
        Sair do modo edição
      </button>
    );
  }

  return (
    <button type="button" className="btn btn-primary small editor-toolbar-login-btn" onClick={openLogin}>
      Entrar como editor
    </button>
  );
}
