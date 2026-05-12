import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import DashboardCards from "../components/DashboardCards";
import ServerForm from "../components/ServerForm";
import ServerList from "../components/ServerList";
import { useAuth } from "../context/AuthContext";

export default function ServidoresView({
  servidores,
  editing,
  onEdit,
  onSaved,
  onCancelForm,
  refreshTrigger,
  toast,
}) {
  const { canEdit } = useAuth();
  const [formOpen, setFormOpen] = useState(false);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    onCancelForm?.();
  }, [onCancelForm]);

  const openCreate = useCallback(() => {
    if (!canEdit) {
      toast?.error("Faça login como editor para cadastrar.");
      return;
    }
    setFormOpen(true);
    onEdit(null);
  }, [canEdit, onEdit, toast]);

  const handleSavedAndClose = useCallback(() => {
    setFormOpen(false);
    onSaved?.();
  }, [onSaved]);

  useEffect(() => {
    if (editing) setFormOpen(true);
  }, [editing]);

  useEffect(() => {
    if (!formOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [formOpen]);

  useEffect(() => {
    if (!formOpen) return undefined;
    function onKey(e) {
      if (e.key === "Escape") closeForm();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [formOpen, closeForm]);

  const drawerTitle = editing ? "Editar servidor" : "Novo servidor";

  return (
    <>
      <DashboardCards servidores={servidores} />

      <div className="servidores-layout">
        <div className="card list-card servidores-list-card">
          <header className="servidores-list-head">
            <div className="servidores-list-head-text">
              <h3>Servidores do altar</h3>
              <p className="servidores-list-sub muted">
                Consulte, filtre e abra detalhes. Use o botão ao lado para incluir ou alterar cadastros.
              </p>
            </div>
            <div className="servidores-list-head-actions">
              <span className="badge" aria-live="polite">
                {servidores.length} {servidores.length === 1 ? "servidor" : "servidores"}
              </span>
              <button type="button" className="btn btn-primary servidores-btn-novo" onClick={openCreate}>
                Novo servidor
              </button>
            </div>
          </header>

          <ServerList onEdit={onEdit} refreshTrigger={refreshTrigger} toast={toast} />
        </div>
      </div>

      {formOpen &&
        createPortal(
          <>
            <div
              className="servidores-form-backdrop"
              role="presentation"
              aria-hidden="true"
              onClick={closeForm}
            />
            <aside
              className="servidores-form-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="servidores-form-drawer-title"
            >
              <div className="servidores-form-drawer-head">
                <div>
                  <h3 id="servidores-form-drawer-title">{drawerTitle}</h3>
                  <p className="muted servidores-form-drawer-sub">
                    {editing ? "Atualize os dados e salve." : "Preencha os dados obrigatórios e cadastre."}
                  </p>
                </div>
                <button type="button" className="servidores-form-drawer-close" onClick={closeForm} aria-label="Fechar formulário">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="servidores-form-drawer-body">
                <ServerForm editing={editing} onSaved={handleSavedAndClose} onCancel={closeForm} toast={toast} />
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}
