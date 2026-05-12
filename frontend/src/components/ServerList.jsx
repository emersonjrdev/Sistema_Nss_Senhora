import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import DetailsModal from "./DetailsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import SearchFilters from "./SearchFilters";
import { formatDateOnlyPtBR, calendarDateSortKey } from "../utils/dateOnly";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";

const ITEMS_PER_PAGE = 6;

function getAvatarFallback(name) {
  const first = (name || "").split(" ").filter(Boolean);
  if (!first.length) return "SA";
  return ((first[0]?.[0] || "") + (first[1]?.[0] || first[0]?.[1] || "")).toUpperCase();
}

export default function ServerList({ onEdit, refreshTrigger, toast }) {
  const { canEdit } = useAuth();
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
  const [sort, setSort] = useState({ key: "nome", dir: "asc" });

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
  }, [filters, sort]);

  const sortedServers = useMemo(() => {
    const list = [...servidores];
    const mult = sort.dir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sort.key === "nome") {
        return mult * String(a.name || "").localeCompare(String(b.name || ""), "pt-BR", {
          sensitivity: "base",
        });
      }
      if (sort.key === "funcao") {
        return mult * String(a.funcao || "").localeCompare(String(b.funcao || ""), "pt-BR", {
          sensitivity: "base",
        });
      }
      if (sort.key === "inicio") {
        const da = calendarDateSortKey(a.inicio);
        const db = calendarDateSortKey(b.inicio);
        return mult * da.localeCompare(db);
      }
      return 0;
    });
    return list;
  }, [servidores, sort]);

  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  }

  function sortIndicator(key) {
    if (sort.key !== key) return "";
    return sort.dir === "asc" ? " ▲" : " ▼";
  }

  const totalPages = Math.max(1, Math.ceil(sortedServers.length / ITEMS_PER_PAGE));
  const paginatedServers = sortedServers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleDeleteClick(id, name) {
    if (!canEdit) {
      toast?.error("Faça login como editor para excluir.");
      return;
    }
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
        ) : sortedServers.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Foto</th>
                <th scope="col" className="th-sort-cell">
                  <button type="button" className="th-sort" onClick={() => toggleSort("nome")}>
                    Nome{sortIndicator("nome")}
                  </button>
                </th>
                <th scope="col" className="th-sort-cell">
                  <button type="button" className="th-sort" onClick={() => toggleSort("funcao")}>
                    Função{sortIndicator("funcao")}
                  </button>
                </th>
                <th scope="col">Status</th>
                <th scope="col" className="th-sort-cell">
                  <button type="button" className="th-sort" onClick={() => toggleSort("inicio")}>
                    Início{sortIndicator("inicio")}
                  </button>
                </th>
                <th scope="col">Local</th>
                <th scope="col">Ações</th>
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
                  <td>{s.inicio ? formatDateOnlyPtBR(s.inicio) : "-"}</td>
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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

      {!loading && sortedServers.length > 0 && (
        <div className="mobile-cards-list">
          {paginatedServers.map((s) => (
            <article key={`mobile-${s._id || s.id}`} className="server-mobile-card">
              <div className="server-mobile-header">
                {s.photo ? (
                  <img src={s.photo} alt={s.name} className="thumb" />
                ) : (
                  <div className="thumb-placeholder" aria-label="Sem foto">
                    {getAvatarFallback(s.name)}
                  </div>
                )}
                <div className="server-mobile-identification">
                  <h4>{s.name}</h4>
                  <span className="funcao-badge">{s.funcao || "Sem função"}</span>
                </div>
              </div>

              <div className="server-mobile-meta">
                <div>
                  <small>Status</small>
                  <StatusBadge status={s.status} />
                </div>
                <div>
                  <small>Início</small>
                  <span>{s.inicio ? formatDateOnlyPtBR(s.inicio) : "-"}</span>
                </div>
                <div>
                  <small>Local</small>
                  <span>{s.local || s.comunidade || "-"}</span>
                </div>
              </div>

              <div className="actions mobile-actions">
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
                  Ver
                </button>
                <button
                  onClick={() => onEdit && onEdit(s)}
                  className="btn small"
                  title="Editar cadastro do servidor"
                  aria-label="Editar servidor"
                  disabled={!canEdit}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteClick(s._id || s.id, s.name)}
                  className="btn small danger"
                  title="Excluir servidor"
                  aria-label="Excluir servidor"
                  disabled={!canEdit}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && sortedServers.length > ITEMS_PER_PAGE && (
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
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="btn secondary small"
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
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
