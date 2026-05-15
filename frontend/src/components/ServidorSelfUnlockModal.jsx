import React, { useState, useEffect, useMemo } from "react";
import { storageService } from "../services/storageService";
import { canVerifyServidor, entityId } from "../utils/servidorSelfVerify";

export default function ServidorSelfUnlockModal({ open, onClose, servidores, onUnlocked, toast }) {
  const [servidorId, setServidorId] = useState("");
  const [telefoneUltimos4, setTelefoneUltimos4] = useState("");
  const [verificacaoNascimento, setVerificacaoNascimento] = useState("");
  const [busy, setBusy] = useState(false);

  const ordenados = useMemo(() => {
    return [...(servidores || [])].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), "pt-BR", { sensitivity: "base" })
    );
  }, [servidores]);

  useEffect(() => {
    if (!open) {
      setServidorId("");
      setTelefoneUltimos4("");
      setVerificacaoNascimento("");
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const selected = ordenados.find((s) => entityId(s) === servidorId);
  const podeVerificar = selected ? canVerifyServidor(selected) : false;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!servidorId) {
      toast?.error("Selecione seu nome na lista.");
      return;
    }
    if (!podeVerificar) {
      toast?.error("Seu cadastro ainda não tem telefone nem data de nascimento. Peça a um editor para completar.");
      return;
    }
    const t4 = telefoneUltimos4.replace(/\D/g, "").slice(-4);
    const birth = verificacaoNascimento.trim();
    if (t4.length < 4 && !birth) {
      toast?.error("Informe os últimos 4 dígitos do telefone cadastrado ou a data de nascimento.");
      return;
    }
    setBusy(true);
    try {
      await storageService.verifySelfUnlock(servidorId, {
        telefoneUltimos4: t4.length >= 4 ? t4 : "",
        verificacaoNascimento: birth,
      });
      onUnlocked?.({
        servidorId,
        telefoneUltimos4: t4.length >= 4 ? t4 : "",
        verificacaoNascimento: birth,
      });
      onClose?.();
      toast?.success("Identidade confirmada. Você pode atualizar seus dados.");
    } catch (err) {
      console.error(err);
      toast?.error(err.message || "Não foi possível confirmar. Confira telefone ou data de nascimento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => !busy && onClose?.()}>
      <div
        className="modal confirm-modal servidor-self-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="servidor-self-title"
        onClick={(ev) => ev.stopPropagation()}
      >
        <button type="button" className="modal-close-btn" onClick={() => !busy && onClose?.()} aria-label="Fechar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h3 id="servidor-self-title">Atualizar meu cadastro</h3>
        <p className="muted small-hint">
          Escolha <strong>seu nome</strong> como está no cadastro e confirme com os <strong>últimos 4 dígitos do
          telefone</strong> que constam aí (sem DDD) ou com a <strong>data de nascimento</strong> cadastrada. O nome
          completo não poderá ser alterado por aqui; a exclusão do cadastro só é feita por um editor.
        </p>
        <form onSubmit={handleSubmit} className="servidor-self-form">
          <label>
            Seu nome no cadastro
            <select
              value={servidorId}
              onChange={(e) => setServidorId(e.target.value)}
              required
              aria-label="Selecionar cadastro pelo nome"
            >
              <option value="">Selecione…</option>
              {ordenados.map((s) => {
                const id = entityId(s);
                const ok = canVerifyServidor(s);
                return (
                  <option key={id} value={id} disabled={!ok}>
                    {s.name || "(sem nome)"}
                    {!ok ? " — precisa telefone ou nascimento" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            Últimos 4 dígitos do telefone cadastrado
            <input
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              placeholder="Ex.: 0490"
              value={telefoneUltimos4}
              onChange={(e) => setTelefoneUltimos4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </label>
          <label>
            Ou data de nascimento (cadastro)
            <input
              type="date"
              value={verificacaoNascimento}
              onChange={(e) => setVerificacaoNascimento(e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn secondary" disabled={busy} onClick={() => onClose?.()}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy || !servidorId}>
              {busy ? "Verificando…" : "Continuar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
