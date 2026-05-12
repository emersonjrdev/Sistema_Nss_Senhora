import React from "react";
import { formatDateOnlyPtBR } from "../utils/dateOnly";

function getAvatarFallback(name) {
  const parts = (name || "").split(" ").filter(Boolean);
  if (!parts.length) return "SA";
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase();
}

export default function DetailsModal({ server, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h3>Detalhes do Servidor</h3>

        <div className="modal-photo">
          {server.photo ? (
            <img src={server.photo} alt={server.name} />
          ) : (
            <div className="avatar-fallback modal-avatar">{getAvatarFallback(server.name)}</div>
          )}
        </div>

        <div className="modal-content modal-content--grouped">
          <details className="modal-details-group" open>
            <summary>Identificação e função</summary>
            <div className="detail-item">
              <strong>Nome</strong>
              <span>{server.name}</span>
            </div>
            <div className="detail-item">
              <strong>Função</strong>
              <span>{server.funcao || "-"}</span>
            </div>
            <div className="detail-item">
              <strong>Status</strong>
              <span>{server.status || "Ativo"}</span>
            </div>
          </details>

          <details className="modal-details-group" open>
            <summary>Contato e datas</summary>
            <div className="detail-item">
              <strong>Telefone</strong>
              <span>{server.telefone || "-"}</span>
            </div>
            <div className="detail-item">
              <strong>Nascimento</strong>
              <span>
                {server.nascimento ? formatDateOnlyPtBR(server.nascimento) : "-"}
              </span>
            </div>
            <div className="detail-item">
              <strong>Início no altar</strong>
              <span>
                {server.inicio ? formatDateOnlyPtBR(server.inicio) : "-"}
              </span>
            </div>
          </details>

          <details className="modal-details-group" open>
            <summary>Local e comunidade</summary>
            <div className="detail-item">
              <strong>Local de serviço</strong>
              <span>{server.local || "-"}</span>
            </div>
            <div className="detail-item">
              <strong>Comunidade</strong>
              <span>{server.comunidade || "-"}</span>
            </div>
          </details>

          <details className="modal-details-group">
            <summary>Observações</summary>
            <div className="detail-item detail-item--block">
              <span>{server.observacoes || "Nenhuma observação registrada."}</span>
            </div>
          </details>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
