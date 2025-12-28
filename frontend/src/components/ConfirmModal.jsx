import React from "react";

export default function ConfirmModal({ 
  title = "Confirmar ação", 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  onConfirm, 
  onCancel,
  type = "danger"
}) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button 
            className={`btn ${type}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button 
            className="btn secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

