import React, { useState, useEffect } from "react";
import ToastContainer from "./components/ToastContainer";
import HeaderInstitucional from "./components/HeaderInstitucional";
import AppSidebar from "./components/AppSidebar";
import ServidoresView from "./views/ServidoresView";
import RelatoriosView from "./views/RelatoriosView";
import AniversariantesView from "./views/AniversariantesView";
import ComunidadesView from "./views/ComunidadesView";
import EventosView from "./views/EventosView";
import EscalasView from "./views/EscalasView";
import PresencaView from "./views/PresencaView";
import HistoricoView from "./views/HistoricoView";
import { getModuleById } from "./config/modules";
import { storageService } from "./services/storageService";
import { useToast } from "./hooks/useToast";

export default function App() {
  const [editing, setEditing] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [servidores, setServidores] = useState([]);
  const [activeModule, setActiveModule] = useState("servidores");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  function selectModule(id) {
    setActiveModule(id);
    setSidebarOpen(false);
    if (id !== "servidores") {
      setEditing(null);
    }
  }

  const mod = getModuleById(activeModule);

  function renderModuleContent() {
    switch (activeModule) {
      case "servidores":
        return (
          <ServidoresView
            servidores={servidores}
            editing={editing}
            onEdit={(srv) => setEditing(srv)}
            onSaved={handleSaved}
            refreshTrigger={refreshList}
            toast={toast}
          />
        );
      case "relatorios":
        return <RelatoriosView servidores={servidores} />;
      case "aniversariantes":
        return <AniversariantesView servidores={servidores} />;
      case "comunidades":
        return <ComunidadesView servidores={servidores} />;
      case "escalas":
        return <EscalasView servidores={servidores} toast={toast} />;
      case "presenca":
        return <PresencaView servidores={servidores} />;
      case "eventos":
        return <EventosView toast={toast} />;
      case "historico":
        return <HistoricoView servidores={servidores} toast={toast} />;
      default:
        return null;
    }
  }

  return (
    <div className="container app-root">
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      <HeaderInstitucional />

      <div className="app-shell">
        <AppSidebar
          activeModule={activeModule}
          onSelect={selectModule}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        <div className="app-main">
          <div className="app-main-toolbar">
            <button
              type="button"
              className="btn secondary mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar-nav"
            >
              Menu de módulos
            </button>
            <div className="app-main-breadcrumb">
              <span className="muted">Módulo atual</span>
              <strong>{mod.label}</strong>
            </div>
          </div>

          <div className="app-main-content">{renderModuleContent()}</div>
        </div>
      </div>

      <footer className="app-footer">
        <small>Paróquia Nossa Senhora das Graças — {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}
