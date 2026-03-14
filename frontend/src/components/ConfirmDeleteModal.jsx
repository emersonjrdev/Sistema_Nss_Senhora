import React from "react";
import ConfirmModal from "./ConfirmModal";

export default function ConfirmDeleteModal({ serverName, onConfirm, onCancel }) {
  return (
    <ConfirmModal
      title="Confirmar exclusão de servidor"
      message={`Deseja remover "${serverName}"? Esta ação excluirá o registro do servidor e não poderá ser desfeita.`}
      confirmText="Sim, excluir"
      cancelText="Voltar"
      type="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
