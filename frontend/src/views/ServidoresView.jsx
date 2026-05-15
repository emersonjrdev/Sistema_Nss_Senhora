import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import DashboardCards from "../components/DashboardCards";
import ServerForm from "../components/ServerForm";
import ServerList from "../components/ServerList";
import ServidorSelfUnlockModal from "../components/ServidorSelfUnlockModal";
import { useAuth } from "../context/AuthContext";
import { entityId } from "../utils/servidorSelfVerify";

export default function ServidoresView({
  servidores,
  editing,
  onEdit,
  onSaved,
  onCancelForm,
  refreshTrigger,
  toast,
}) {
  const { canEdit, editorAuthRequired } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [selfModalOpen, setSelfModalOpen] = useState(false);
  /** Sessão de edição própria: mantida após verificar até salvar ou "Sair". */
  const [selfEditCtx, setSelfEditCtx] = useState(null);
  const prevCanEditRef = useRef(null);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    onCancelForm?.();
  }, [onCancelForm]);

  /** Só limpa "meu cadastro" quando o utilizador passa a ter poder de editor (ex.: login), não quando canEdit já era true. */
  useEffect(() => {
    const prev = prevCanEditRef.current;
    prevCanEditRef.current = canEdit;
    if (prev !== null && editorAuthRequired && prev === false && canEdit === true) {
      setSelfEditCtx(null);
    }
  }, [canEdit, editorAuthRequired]);

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
    setSelfEditCtx(null);
    onSaved?.();
  }, [onSaved]);

  const handleEditServidor = useCallback(
    (s) => {
      if (canEdit) {
        onEdit(s);
        return;
      }
      if (selfEditCtx && String(selfEditCtx.servidorId) === entityId(s)) {
        onEdit(s);
        setFormOpen(true);
        return;
      }
      toast?.info('Para editar seu cadastro, use o botão "Atualizar meu cadastro" e confirme telefone ou data de nascimento.');
    },
    [canEdit, onEdit, selfEditCtx, toast]
  );

  const exitSelfEditMode = useCallback(() => {
    setSelfEditCtx(null);
    setFormOpen(false);
    onCancelForm?.();
  }, [onCancelForm]);

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

  const isSelfDrawer =
    Boolean(selfEditCtx) && editing && entityId(editing) === String(selfEditCtx.servidorId);

  const drawerTitle = isSelfDrawer ? "Meu cadastro" : editing ? "Editar servidor" : "Novo servidor";

  return (
    <>
      <DashboardCards servidores={servidores} />

      <div className="servidores-layout">
        <div className="card list-card servidores-list-card">
          <header className="servidores-list-head">
            <div className="servidores-list-head-text">
              <h3>Servidores do altar</h3>
              <p className="servidores-list-sub muted">
                {canEdit
                  ? "Consulte, filtre e abra detalhes. Use o botão ao lado para incluir ou alterar cadastros."
                  : "Consulte e filtre os cadastros. Para alterar o seu, use “Atualizar meu cadastro” e confirme com o telefone ou a data de nascimento já registrados."}
              </p>
            </div>
            <div className="servidores-list-head-actions">
              <span className="badge" aria-live="polite">
                {servidores.length} {servidores.length === 1 ? "servidor" : "servidores"}
              </span>
              {!canEdit && (
                <button
                  type="button"
                  className="btn secondary servidores-btn-self"
                  onClick={() => setSelfModalOpen(true)}
                >
                  Atualizar meu cadastro
                </button>
              )}
              {canEdit && (
              <button type="button" className="btn btn-primary servidores-btn-novo" onClick={openCreate}>
                Novo servidor
              </button>
              )}
            </div>
          </header>

          {!canEdit && selfEditCtx && (
            <div className="servidor-self-session-bar" role="status">
              <span>
                Edição do <strong>seu cadastro</strong> liberada neste aparelho. O nome não pode ser alterado; não é
                possível excluir o cadastro por aqui.
              </span>
              <button type="button" className="btn secondary small" onClick={exitSelfEditMode}>
                Sair do meu cadastro
              </button>
            </div>
          )}

          <ServerList
            onEdit={handleEditServidor}
            refreshTrigger={refreshTrigger}
            toast={toast}
            selfServidorId={selfEditCtx?.servidorId ?? null}
            onOpenSelfEditModal={() => setSelfModalOpen(true)}
          />
        </div>
      </div>

      <ServidorSelfUnlockModal
        open={selfModalOpen}
        onClose={() => setSelfModalOpen(false)}
        servidores={servidores}
        toast={toast}
        onUnlocked={(unlock) => {
          const srv = servidores.find((s) => entityId(s) === unlock.servidorId);
          if (!srv) return;
          setSelfEditCtx(unlock);
          onEdit(srv);
          setFormOpen(true);
          setSelfModalOpen(false);
        }}
      />

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
                    {isSelfDrawer
                      ? "Atualize seus dados e salve. A foto é opcional."
                      : editing
                        ? "Atualize os dados e salve."
                        : "Preencha os dados obrigatórios e cadastre."}
                  </p>
                </div>
                <button
                  type="button"
                  className="servidores-form-drawer-close"
                  onClick={closeForm}
                  aria-label="Fechar formulário"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="servidores-form-drawer-body">
                <ServerForm
                  editing={editing}
                  onSaved={handleSavedAndClose}
                  onCancel={closeForm}
                  toast={toast}
                  selfEditVerification={formOpen && selfEditCtx ? selfEditCtx : null}
                />
              </div>
            </aside>
          </>,
          document.body
        )}
    </>
  );
}
