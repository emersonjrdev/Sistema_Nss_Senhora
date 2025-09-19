import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import DetailsModal from "./DetailsModal";

export default function ServerList({ onEdit, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroFuncao, setFiltroFuncao] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [refreshTrigger, filtroNome, filtroFuncao]);

  async function loadUsers() {
    const result = await storageService.searchUsers({
      name: filtroNome,
      funcao: filtroFuncao,
    });
    setUsers(result);
  }

  async function handleDelete(id) {
    if (!confirm("Deseja remover este usuário?")) return;
    try {
      await storageService.deleteUser(id);
      alert("Removido com sucesso!");
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover: " + err.message);
    }
  }

  return (
    <div>
      <div className="filters">
        <input
          placeholder="🔍 Pesquisar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <input
          placeholder="🔍 Pesquisar por função"
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
        />
      </div>

      <div className="table-container">
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
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div>📋 Nenhum usuário encontrado</div>
                  <small>Cadastre o primeiro usuário no formulário ao lado</small>
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id} className="server-row">
                <td>
                  {u.photo ? (
                    <img src={u.photo} alt="foto" className="thumb" />
                  ) : (
                    <div className="thumb-placeholder">👤</div>
                  )}
                </td>
                <td className="nome-cell">{u.name}</td>
                <td>
                  <span className="funcao-badge">{u.funcao}</span>
                </td>
                <td>
                  {u.inicio
                    ? new Date(u.inicio).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td>{u.local || "-"}</td>
                <td className="actions">
                  <button
                    onClick={() => setSelected(u)}
                    className="btn small info"
                  >
                    👀
                  </button>
                  <button
                    onClick={() => onEdit && onEdit(u)}
                    className="btn small"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="btn small danger"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <DetailsModal server={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
