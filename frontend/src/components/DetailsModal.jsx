import React from "react";

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
        
        {server.photo && (
          <div className="modal-photo">
            <img 
              src={server.photo} 
              alt={server.name} 
            />
          </div>
        )}
        
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
            <strong>Local:</strong>
            <span>{server.local || "-"}</span>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
