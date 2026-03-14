import React, { useEffect, useState, useCallback } from "react";
import { storageService } from "../services/storageService";
import DetailsModal from "./DetailsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import SearchFilters from "./SearchFilters";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";

const ITEMS_PER_PAGE = 6;

function getAvatarFallback(name) {
  const first = (name || "").split(" ").filter(Boolean);
  if (!first.length) return "SA";
  return ((first[0]?.[0] || "") + (first[1]?.[0] || first[0]?.[1] || "")).toUpperCase();
}

export default function ServerList({ onEdit, refreshTrigger, toast }) {
  const [servidores, setServidores] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    funcao: "",
    local: "",
    status: "",
    period: "",
  });
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadServers = useCallback(async () => {
    try {
      setLoading(true);
      const servers = await storageService.searchUsers(filters);
      setServidores(servers);
    } catch (err) {
      console.error("Erro ao carregar servidores:", err);
      toast?.error("Erro ao carregar servidores");
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadServers();
    }, 300);

    return () => clearTimeout(timer);
  }, [refreshTrigger, loadServers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(servidores.length / ITEMS_PER_PAGE));
  const paginatedServers = servidores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function clearFilters() {
    setFilters({
      name: "",
      funcao: "",
      local: "",
      status: "",
      period: "",
    });
  }

  return (
    <div className="server-list-root">
      <SearchFilters filters={filters} onChange={handleFilterChange} onClear={clearFilters} />

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando servidores...</p>
          </div>
        ) : servidores.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Função</th>
                <th>Status</th>
                <th>Início</th>
                <th>Local</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedServers.map((s) => (
                <tr key={s._id || s.id} className="server-row">
                  <td>
                    {s.photo ? (
                      <img src={s.photo} alt={s.name} className="thumb" />
                    ) : (
                      <div className="thumb-placeholder" aria-label="Sem foto">
                        {getAvatarFallback(s.name)}
                      </div>
                    )}
                  </td>
                  <td className="nome-cell">{s.name}</td>
                  <td><span className="funcao-badge">{s.funcao || "-"}</span></td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{s.inicio ? new Date(s.inicio).toLocaleDateString('pt-BR') : "-"}</td>
                  <td>{s.local || s.comunidade || "-"}</td>
                  <td className="actions">
                    <button 
                      onClick={() => setSelected(s)} 
                      className="btn small info" 
                      title="Visualizar detalhes do servidor"
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
                      title="Editar cadastro do servidor"
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

      {!loading && servidores.length > ITEMS_PER_PAGE && (
        <div className="table-pagination">
          <button
            className="btn secondary small"
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span>
            Pagina {currentPage} de {totalPages}
          </span>
          <button
            className="btn secondary small"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Proxima
          </button>
        </div>
      )}

      {selected && <DetailsModal server={selected} onClose={() => setSelected(null)} />}
      
      {deletingId && (
        <ConfirmDeleteModal
          serverName={deletingId.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
