import React, { useState, useCallback, useEffect } from "react";
import { escalasService } from "../services/escalasService";

function serverId(s) {
  return String(s._id || s.id || "");
}

export default function EscalasView({ servidores, toast }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ titulo: "", data: "", observacoes: "" });
  const [editingId, setEditingId] = useState(null);

  const reload = useCallback(async () => {
    const l = await escalasService.list();
    setLista(l);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const escalaEdit = lista.find((e) => e.id === editingId);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await escalasService.create({ ...form, atribuicoes: [] });
      toast?.success("Escala criada. Selecione-a na lista para montar a equipe.");
      setForm({ titulo: "", data: "", observacoes: "" });
      await reload();
    } catch (err) {
      toast?.error(err.message || "Erro ao salvar");
    }
  }

  async function toggleServidor(servidor, checked) {
    if (!editingId) return;
    const escala = lista.find((x) => x.id === editingId);
    if (!escala) return;
    const sid = serverId(servidor);
    let next = [...(escala.atribuicoes || [])];
    if (checked) {
      if (!next.some((a) => a.servidorId === sid)) {
        next.push({
          servidorId: sid,
          nome: servidor.name,
          funcao: servidor.funcao || "",
        });
      }
    } else {
      next = next.filter((a) => a.servidorId !== sid);
    }
    try {
      await escalasService.update(editingId, { atribuicoes: next });
      await reload();
    } catch (err) {
      toast?.error(err.message || "Erro ao atualizar equipe");
    }
  }

  function isOnEscala(servidor) {
    const sid = serverId(servidor);
    return (escalaEdit?.atribuicoes || []).some((a) => a.servidorId === sid);
  }

  async function handleRemoveEscala(id) {
    if (!window.confirm("Excluir esta escala?")) return;
    try {
      await escalasService.remove(id);
      if (editingId === id) setEditingId(null);
      toast?.success("Escala removida.");
      await reload();
    } catch (err) {
      toast?.error(err.message || "Erro ao excluir");
    }
  }

  return (
    <section className="module-escalas">
      <header className="module-section-header">
        <h2>Escalas de serviço</h2>
        <p>Crie uma escala por data e marque quem está convocado. A lista de presença pode usar a mesma data do evento.</p>
      </header>

      <div className="module-two-col">
        <form className="card form-card-inner form" onSubmit={handleCreate}>
          <h3 className="module-subtitle">Nova escala</h3>
          <label>
            Título *
            <input
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Missa 19h — domingo"
              required
            />
          </label>
          <label>
            Data *
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
              required
            />
          </label>
          <label>
            Observações
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              rows={2}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Criar escala
            </button>
          </div>
        </form>

        <div className="card list-card-inner">
          <h3 className="module-subtitle">Escalas cadastradas</h3>
          {lista.length === 0 ? (
            <p className="empty-inline">Nenhuma escala ainda.</p>
          ) : (
            <ul className="escalas-lista">
              {lista.map((es) => (
                <li key={es.id} className={`escalas-item ${editingId === es.id ? "escalas-item--active" : ""}`}>
                  <div>
                    <strong>{es.titulo}</strong>
                    <p className="muted">
                      {es.data
                        ? new Date(es.data + "T12:00:00").toLocaleDateString("pt-BR")
                        : "-"}{" "}
                      · {(es.atribuicoes || []).length} na equipe
                    </p>
                  </div>
                  <div className="escalas-acoes">
                    <button type="button" className="btn small" onClick={() => setEditingId(es.id === editingId ? null : es.id)}>
                      {editingId === es.id ? "Fechar" : "Montar equipe"}
                    </button>
                    <button type="button" className="btn small danger" onClick={() => handleRemoveEscala(es.id)}>
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editingId && escalaEdit && (
        <div className="card escala-equipe-card">
          <h3 className="module-subtitle">Equipe: {escalaEdit.titulo}</h3>
          {servidores.length === 0 ? (
            <p className="empty-inline">Cadastre servidores no módulo principal.</p>
          ) : (
            <ul className="escala-check-list">
              {servidores.map((s) => (
                <li key={serverId(s)}>
                  <label className="escala-check-label">
                    <input
                      type="checkbox"
                      checked={isOnEscala(s)}
                      onChange={(e) => toggleServidor(s, e.target.checked)}
                    />
                    <span>{s.name}</span>
                    {s.funcao && <span className="funcao-badge">{s.funcao}</span>}
                  </label>
                </li>
              ))}
            </ul>
          )}
          <p className="muted small-hint">As alterações são salvas automaticamente ao marcar ou desmarcar.</p>
        </div>
      )}
    </section>
  );
}
