import React from "react";

export default function DetailsModal({ server, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>👤 Detalhes do Servidor</h3>
        
        {server.photoURL && (
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <img 
              src={server.photoURL} 
              alt="Foto" 
              style={{
                width: 120,
                height: 120,
                objectFit: 'cover',
                borderRadius: '12px',
                border: '3px solid var(--primary)'
              }} 
            />
          </div>
        )}
        
        <div className="modal-content">
          <div className="detail-item">
            <strong>📛 Nome:</strong> {server.nome}
          </div>
          <div className="detail-item">
            <strong>🎯 Função:</strong> {server.funcao}
          </div>
          <div className="detail-item">
            <strong>📅 Início:</strong> {server.inicio ? new Date(server.inicio).toLocaleDateString('pt-BR') : "-"}
          </div>
          <div className="detail-item">
            <strong>📍 Local:</strong> {server.local || "-"}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}