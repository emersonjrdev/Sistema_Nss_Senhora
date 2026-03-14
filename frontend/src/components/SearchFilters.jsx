import React from "react";

const FUNCOES = ["", "Acólito", "Filhas de Maria", "Cerimoniário", "Coroinha"];
const STATUS = ["", "Ativo", "Em formação", "Inativo"];

export default function SearchFilters({ filters, onChange, onClear }) {
  return (
    <div className="filters-panel">
      <div className="filters-main-search">
        <label htmlFor="filtroNome">Buscar servidor</label>
        <input
          id="filtroNome"
          value={filters.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Digite o nome do servidor"
          aria-label="Buscar servidor por nome"
        />
      </div>

      <div className="filters-grid">
        <label>
          Função
          <select
            value={filters.funcao}
            onChange={(e) => onChange("funcao", e.target.value)}
            aria-label="Filtrar por função"
          >
            {FUNCOES.map((funcao) => (
              <option key={funcao || "todas"} value={funcao}>
                {funcao || "Todas as funções"}
              </option>
            ))}
          </select>
        </label>

        <label>
          Comunidade/local
          <input
            value={filters.local}
            onChange={(e) => onChange("local", e.target.value)}
            placeholder="Ex: Matriz, Comunidade..."
            aria-label="Filtrar por local"
          />
        </label>

        <label>
          Status
          <select
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value)}
            aria-label="Filtrar por status"
          >
            {STATUS.map((status) => (
              <option key={status || "todos"} value={status}>
                {status || "Todos os status"}
              </option>
            ))}
          </select>
        </label>

        <label>
          Período de início
          <input
            type="month"
            value={filters.period}
            onChange={(e) => onChange("period", e.target.value)}
            aria-label="Filtrar por período"
          />
        </label>
      </div>

      <div className="filters-actions">
        <button type="button" className="btn secondary" onClick={onClear}>
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
