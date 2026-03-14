import React from "react";

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
            <img 
              src={server.photo} 
              alt={server.name} 
            />
          ) : (
            <div className="avatar-fallback modal-avatar">{getAvatarFallback(server.name)}</div>
          )}
        </div>
        
        <div className="modal-content">
          <div className="detail-item">
            <strong>Nome:</strong>
            <span>{server.name}</span>
          </div>
          <div className="detail-item">
            <strong>Função:</strong>
            <span>{server.funcao || "-"}</span>
          </div>
          <div className="detail-item">
            <strong>Início:</strong>
            <span>{server.inicio ? new Date(server.inicio).toLocaleDateString('pt-BR') : "-"}</span>
          </div>
          <div className="detail-item">
            <strong>Nascimento:</strong>
            <span>{server.nascimento ? new Date(server.nascimento).toLocaleDateString('pt-BR') : "-"}</span>
          </div>
          <div className="detail-item">
            <strong>Telefone:</strong>
            <span>{server.telefone || "-"}</span>
          </div>
          <div className="detail-item">
            <strong>Status:</strong>
            <span>{server.status || "Ativo"}</span>
          </div>
          <div className="detail-item">
            <strong>Local:</strong>
            <span>{server.local || server.comunidade || "-"}</span>
          </div>
          <div className="detail-item">
            <strong>Comunidade:</strong>
            <span>{server.comunidade || "-"}</span>
          </div>
          <div className="detail-item">
            <strong>Observações:</strong>
            <span>{server.observacoes || "-"}</span>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
