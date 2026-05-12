import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";

export default function EditorLoginModal() {
  const { loginOpen, closeLogin, login } = useAuth();
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loginOpen) {
      setPwd("");
      setErr("");
      setLoading(false);
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [loginOpen]);

  if (!loginOpen) return null;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(pwd);
    } catch (ex) {
      setErr(ex.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div
      className="modal-backdrop editor-login-modal-backdrop"
      role="presentation"
      onClick={() => !loading && closeLogin()}
    >
      <div
        className="modal confirm-modal editor-login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-login-title"
        onClick={(ev) => ev.stopPropagation()}
      >
        <h3 id="editor-login-title">Acesso de edição</h3>
        <p className="confirm-message">
          Esta instância exige a <strong>senha de administrador</strong> para incluir ou alterar dados. Digite abaixo
          para continuar, ou use <strong>Cancelar</strong> para apenas consultar em modo leitura.
        </p>
        <form onSubmit={onSubmit} className="editor-login-form">
          <label className="full-width">
            Senha
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>
          {err ? <p className="editor-login-error">{err}</p> : null}
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
            <button type="button" className="btn secondary" onClick={closeLogin} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
