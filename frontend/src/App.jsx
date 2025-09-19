import React, { useState, useEffect } from "react";
import ServerList from "./components/ServerList";
import ServerForm from "./components/ServerForm";
import { storageService } from "../src/services/storageService";
import LogoParoquia from "./assets/logo-paroquia.jpeg";

export default function App() {
  const [editing, setEditing] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [count, setCount] = useState(0);

  const handleSaved = () => {
    setEditing(null);
    setRefreshList(prev => prev + 1);
  };

  // Atualiza contador de usuários
  useEffect(() => {
    async function fetchCount() {
      try {
        const users = await storageService.loadUsers();
        setCount(users.length);
      } catch (err) {
        console.error("Erro ao carregar usuários:", err);
        setCount(0);
      }
    }
    fetchCount();
  }, [refreshList]);

  return (
    <div className="container">
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
            <h1>⛪ Servidores do Altar</h1>
            <p>Paróquia Nossa Senhora das Graças</p>
            <p className="subtitle">
              Sistema para cadastrar e gerenciar servidores
            </p>
          </div>
        </div>
      </header>

      <main>
        <div className="grid">
          <div className="card form-card">
            <h3>{editing ? "✏️ Editar Servidor" : "➕ Cadastrar Servidor"}</h3>
            <ServerForm editing={editing} onSaved={handleSaved} />
          </div>

          <div className="card list-card">
            <div className="card-header">
              <h3>📋 Lista de Servidores</h3>
              <span className="badge">{count} servidores</span>
            </div>
            <ServerList
              onEdit={(srv) => setEditing(srv)}
              refreshTrigger={refreshList}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <small>
          Paróquia Nossa Senhora das Graças — {new Date().getFullYear()}
        </small>
      </footer>
    </div>
  );
}
