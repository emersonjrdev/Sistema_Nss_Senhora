import React from "react";
import DashboardCards from "../components/DashboardCards";
import ServerForm from "../components/ServerForm";
import ServerList from "../components/ServerList";

export default function ServidoresView({
  servidores,
  editing,
  onEdit,
  onSaved,
  refreshTrigger,
  toast,
}) {
  return (
    <>
      <DashboardCards servidores={servidores} />

      <div className="grid">
        <div className="card form-card">
          <div className="card-title-group">
            <h3>{editing ? "Editar Servidor" : "Cadastrar Servidor"}</h3>
            <p>
              Cadastre com dados completos para uma gestão paroquial organizada e segura.
            </p>
          </div>
          <ServerForm editing={editing} onSaved={onSaved} toast={toast} />
        </div>

        <div className="card list-card">
          <div className="card-header">
            <h3>Lista de Servidores</h3>
            <span className="badge">{servidores.length} servidores</span>
          </div>
          <ServerList onEdit={onEdit} refreshTrigger={refreshTrigger} toast={toast} />
        </div>
      </div>
    </>
  );
}
