import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { historicoService } from "../services/historicoService";

function serverId(s) {
  return String(s._id || s.id || "");
}

export default function HistoricoView({ servidores, toast }) {
  const { canEdit } = useAuth();
  const [servidorId, setServidorId] = useState("");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ data: new Date().toISOString().split("T")[0], texto: "" });

  const loadEntries = useCallback(async (sid) => {
    if (!sid) {
      setEntries([]);
      return;
    }
    const list = await historicoService.listByServidor(sid);
    setEntries(list);
  }, []);

  useEffect(() => {
    if (!servidores.length) return;
    const valid = servidorId && servidores.some((s) => serverId(s) === servidorId);
    if (!valid) setServidorId(serverId(servidores[0]));
  }, [servidores, servidorId]);

  useEffect(() => {
    loadEntries(servidorId);
  }, [servidorId, loadEntries]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!canEdit) {
      toast?.error("Faça login como editor para gravar no histórico.");
      return;
    }
    try {
      await historicoService.add(servidorId, form.texto, form.data);
      toast?.success("Registro adicionado ao histórico.");
      setForm((f) => ({ ...f, texto: "" }));
      await loadEntries(servidorId);
    } catch (err) {
      toast?.error(err.message || "Erro ao salvar");
    }
  }

  async function handleRemove(entryId) {
    if (!canEdit) {
      toast?.error("Faça login como editor para remover.");
      return;
    }
    if (!window.confirm("Remover este registro?")) return;
    try {
      await historicoService.remove(servidorId, entryId);
      toast?.success("Registro removido.");
      await loadEntries(servidorId);
    } catch (err) {
      toast?.error(err.message || "Erro ao remover");
    }
  }

  if (!servidores.length) {
    return (
      <section className="module-historico">
        <header className="module-section-header">
          <h2>Histórico do servidor</h2>
          <p>Cadastre servidores para registrar notas pastorais e acompanhamento.</p>
        </header>
        <p className="empty-inline">Nenhum servidor cadastrado.</p>
      </section>
    );
  }

  return (
    <section className="module-historico">
      <header className="module-section-header">
        <h2>Histórico do servidor</h2>
        <p>
          Anotações por servidor (formações, conversas, disponibilidade). Quando o app usa a mesma URL de API dos
          cadastros, estes registros vão para o MongoDB junto com os servidores.
        </p>
      </header>

      <div className="module-two-col">
        <form className="card form-card-inner form" onSubmit={handleAdd}>
          <h3 className="module-subtitle">Novo registro</h3>
          <label>
            Servidor
            <select value={servidorId} onChange={(e) => setServidorId(e.target.value)}>
              {servidores.map((s) => (
                <option key={serverId(s)} value={serverId(s)}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="module-fieldset" disabled={!canEdit}>
            <label>
              Data
              <input type="date" value={form.data} onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))} />
            </label>
            <label className="full-width">
              Texto *
              <textarea
                required
                rows={4}
                value={form.texto}
                onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))}
                placeholder="Ex: Participou da formação de acólitos; disponível aos domingos."
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Salvar no histórico
              </button>
            </div>
          </fieldset>
        </form>

        <div className="card list-card-inner">
          <h3 className="module-subtitle">Linha do tempo</h3>
          {entries.length === 0 ? (
            <p className="empty-inline">Nenhum registro para este servidor.</p>
          ) : (
            <ul className="historico-lista">
              {entries.map((row) => (
                <li key={row.id} className="historico-item">
                  <div className="historico-item-head">
                    <time dateTime={row.data}>
                      {row.data
                        ? new Date(row.data + "T12:00:00").toLocaleDateString("pt-BR")
                        : "-"}
                    </time>
                    <button
                      type="button"
                      className="btn-remove-link"
                      onClick={() => handleRemove(row.id)}
                      disabled={!canEdit}
                    >
                      Remover
                    </button>
                  </div>
                  <p>{row.texto}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
