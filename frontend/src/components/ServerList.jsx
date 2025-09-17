import React, { useEffect, useState } from "react";
import { storageService } from "../services/storageService";
import DetailsModal from "./DetailsModal";

export default function ServerList({ onEdit, refreshTrigger }) {
  const [servidores, setServidores] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroFuncao, setFiltroFuncao] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadServers();
  }, [refreshTrigger, filtroNome, filtroFuncao]);

  function loadServers() {
    const servers = storageService.searchServers({
      nome: filtroNome,
      funcao: filtroFuncao
    });
    setServidores(servers);
  }

  function handleDelete(id) {
    if (!confirm("Deseja remover este servidor?")) return;
    try {
      storageService.deleteServer(id);
      alert("Removido com sucesso!");
      loadServers();
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
          onChange={e => setFiltroNome(e.target.value)} 
        />
        <input 
          placeholder="🔍 Pesquisar por função" 
          value={filtroFuncao} 
          onChange={e => setFiltroFuncao(e.target.value)} 
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
            {servidores.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div>📋 Nenhum servidor encontrado</div>
                  <small>Cadastre o primeiro servidor no formulário ao lado</small>
                </td>
              </tr>
            )}
            {servidores.map(s => (
              <tr key={s.id} className="server-row">
                <td>
                  {s.photoURL ? 
                    <img src={s.photoURL} alt="foto" className="thumb" /> : 
                    <div className="thumb-placeholder">👤</div>
                  }
                </td>
                <td className="nome-cell">{s.nome}</td>
                <td><span className="funcao-badge">{s.funcao}</span></td>
                <td>{s.inicio ? new Date(s.inicio).toLocaleDateString('pt-BR') : "-"}</td>
                <td>{s.local || "-"}</td>
                <td className="actions">
                  <button onClick={() => setSelected(s)} className="btn small info">👀</button>
                  <button onClick={() => onEdit && onEdit(s)} className="btn small">✏️</button>
                  <button onClick={() => handleDelete(s.id)} className="btn small danger">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <DetailsModal server={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}