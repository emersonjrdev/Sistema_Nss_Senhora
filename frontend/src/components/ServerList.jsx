import React, { useEffect, useState, useCallback } from "react";
import { storageService } from "../services/storageService";
import DetailsModal from "./DetailsModal";
import ConfirmModal from "./ConfirmModal";

export default function ServerList({ onEdit, refreshTrigger, toast }) {
  const [servidores, setServidores] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroFuncao, setFiltroFuncao] = useState("");
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadServers = useCallback(async () => {
    try {
      setLoading(true);
      const servers = await storageService.searchUsers({
        name: filtroNome,
        funcao: filtroFuncao
      });
      setServidores(servers);
    } catch (err) {
      console.error("Erro ao carregar servidores:", err);
      toast?.error("Erro ao carregar servidores");
    } finally {
      setLoading(false);
    }
  }, [filtroNome, filtroFuncao, toast]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      loadServers();
    }, 300);

    return () => clearTimeout(timer);
  }, [refreshTrigger, loadServers]);

  function handleDeleteClick(id, name) {
    setDeletingId({ id, name });
  }

  async function confirmDelete() {
    if (!deletingId) return;
    
    try {
      await storageService.deleteUser(deletingId.id);
      toast?.success("Servidor removido com sucesso!");
      setDeletingId(null);
      await loadServers();
    } catch (err) {
      console.error("Erro ao remover:", err);
      toast?.error("Erro ao remover servidor: " + (err.message || "Tente novamente"));
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="filters">
        <input 
          placeholder="Pesquisar por nome" 
          value={filtroNome} 
          onChange={e => setFiltroNome(e.target.value)}
          aria-label="Pesquisar por nome"
        />
        <input 
          placeholder="Pesquisar por função" 
          value={filtroFuncao} 
          onChange={e => setFiltroFuncao(e.target.value)}
          aria-label="Pesquisar por função"
        />
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando servidores...</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Função</th>
                <th>Início</th>
                <th>Local</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servidores.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div>Nenhum servidor encontrado</div>
                    <small>Cadastre o primeiro servidor no formulário ao lado</small>
                  </td>
                </tr>
              )}
              {servidores.map(s => (
                <tr key={s._id || s.id} className="server-row">
                  <td>
                    {s.photo ? 
                      <img src={s.photo} alt={s.name} className="thumb" /> : 
                      <div className="thumb-placeholder" aria-label="Sem foto">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    }
                  </td>
                  <td className="nome-cell">{s.name}</td>
                  <td><span className="funcao-badge">{s.funcao || "-"}</span></td>
                  <td>{s.inicio ? new Date(s.inicio).toLocaleDateString('pt-BR') : "-"}</td>
                  <td>{s.local || "-"}</td>
                  <td className="actions">
                    <button 
                      onClick={() => setSelected(s)} 
                      className="btn small info" 
                      title="Visualizar detalhes"
                      aria-label="Visualizar detalhes"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button 
                      onClick={() => onEdit && onEdit(s)} 
                      className="btn small" 
                      title="Editar servidor"
                      aria-label="Editar servidor"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(s._id || s.id, s.name)} 
                      className="btn small danger" 
                      title="Excluir servidor"
                      aria-label="Excluir servidor"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && <DetailsModal server={selected} onClose={() => setSelected(null)} />}
      
      {deletingId && (
        <ConfirmModal
          title="Confirmar exclusão"
          message={`Tem certeza que deseja remover o servidor "${deletingId.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
