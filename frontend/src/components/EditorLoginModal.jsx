import React, { useEffect, useState } from "react";
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
    }
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

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => !loading && closeLogin()}>
      <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="editor-login-title" onClick={(ev) => ev.stopPropagation()}>
        <h3 id="editor-login-title">Entrar como editor</h3>
        <p className="confirm-message">
          Informe a senha de administrador para criar, alterar ou excluir registros na API.
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
    </div>
  );
}
