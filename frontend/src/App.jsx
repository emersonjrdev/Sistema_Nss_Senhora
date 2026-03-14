import React, { useState, useEffect } from "react";
import ServerList from "./components/ServerList";
import ServerForm from "./components/ServerForm";
import ToastContainer from "./components/ToastContainer";
import HeaderInstitucional from "./components/HeaderInstitucional";
import DashboardCards from "./components/DashboardCards";
import { storageService } from "./services/storageService";
import { useToast } from "./hooks/useToast";

export default function App() {
  const [editing, setEditing] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [servidores, setServidores] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await storageService.loadUsers();
        setServidores(users);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };
    loadData();
  }, [refreshList]);

  const handleSaved = () => {
    setEditing(null);
    setRefreshList((prev) => prev + 1);
  };

  return (
    <div className="container">
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      <HeaderInstitucional />
      <DashboardCards servidores={servidores} />

      <main>
        <section className="future-modules-card">
          <h2>Visão de evolução da plataforma</h2>
          <p>
            Estrutura preparada para módulos de escala, presença, eventos, relatórios,
            aniversariantes e histórico pastoral dos servidores.
          </p>
          <div className="module-tags">
            <span>Escalas de serviço</span>
            <span>Controle de presença</span>
            <span>Eventos e missas</span>
            <span>Relatórios</span>
            <span>Aniversariantes</span>
            <span>Comunidades</span>
          </div>
        </section>

        <div className="grid">
          <div className="card form-card">
            <div className="card-title-group">
              <h3>{editing ? "Editar Servidor" : "Cadastrar Servidor"}</h3>
              <p>
                Cadastre com dados completos para uma gestão paroquial organizada e segura.
              </p>
            </div>
            <ServerForm editing={editing} onSaved={handleSaved} toast={toast} />
          </div>

          <div className="card list-card">
            <div className="card-header">
              <h3>Lista de Servidores</h3>
              <span className="badge">{servidores.length} servidores</span>
            </div>
            <ServerList 
              onEdit={(srv) => setEditing(srv)} 
              refreshTrigger={refreshList}
              toast={toast}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <small>Paróquia Nossa Senhora das Graças — {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}
