import React, { useState, useEffect } from "react";
import ServerList from "./components/ServerList";
import ServerForm from "./components/ServerForm";
import ToastContainer from "./components/ToastContainer";
import { storageService } from "./services/storageService";
import { useToast } from "./hooks/useToast";
import LogoParoquia from "./assets/logo-paroquia.jpeg";

export default function App() {
  const [editing, setEditing] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [totalServidores, setTotalServidores] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const loadTotal = async () => {
      try {
        const users = await storageService.loadUsers();
        setTotalServidores(users.length);
      } catch (err) {
        console.error("Erro ao carregar total:", err);
      }
    };
    loadTotal();
  }, [refreshList]);

  const handleSaved = () => {
    setEditing(null);
    setRefreshList((prev) => prev + 1);
  };

  return (
    <div className="container">
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <img
              src={LogoParoquia}
              alt="Logo Paróquia Nossa Senhora das Graças"
              className="logo"
            />
          </div>
          <div className="header-text">
            <h1>Servidores do Altar</h1>
            <p>Paróquia Nossa Senhora das Graças</p>
            <p className="subtitle">Sistema para cadastrar e gerenciar servidores</p>
          </div>
        </div>
      </header>

      <main>
        <div className="grid">
          <div className="card form-card">
            <h3>{editing ? "Editar Servidor" : "Cadastrar Servidor"}</h3>
            <ServerForm editing={editing} onSaved={handleSaved} toast={toast} />
          </div>

          <div className="card list-card">
            <div className="card-header">
              <h3>Lista de Servidores</h3>
              <span className="badge">{totalServidores} servidores</span>
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
