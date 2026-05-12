import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { escalasService } from "../services/escalasService";
import { eventosService } from "../services/eventosService";

function serverId(s) {
  return String(s._id || s.id || "");
}

export default function EscalasView({ servidores, toast }) {
  const { canEdit } = useAuth();
  const [lista, setLista] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState({ eventoId: "", titulo: "", data: "", observacoes: "" });
  const [editingId, setEditingId] = useState(null);

  const reload = useCallback(async () => {
    const [l, ev] = await Promise.all([escalasService.list(), eventosService.list()]);
    setLista(l);
    setEventos(ev);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const escalaEdit = lista.find((e) => e.id === editingId);

  const eventosDisponiveis = useMemo(
    () => eventos.filter((ev) => !lista.some((es) => es.eventoId === ev.id)),
    [eventos, lista]
  );

  const eventoPorId = useMemo(() => {
    const m = new Map();
    eventos.forEach((ev) => m.set(ev.id, ev));
    return m;
  }, [eventos]);

  function onSelectEventoVinculo(evId) {
    if (!evId) {
      setForm((f) => ({ ...f, eventoId: "", titulo: "", data: "" }));
      return;
    }
    const ev = eventos.find((e) => e.id === evId);
    if (!ev) return;
    setForm((f) => ({
      ...f,
      eventoId: ev.id,
      titulo: ev.titulo,
      data: ev.data || "",
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!canEdit) {
      toast?.error("Faça login como editor para criar escalas.");
      return;
    }
    try {
      await escalasService.create({
        titulo: form.titulo,
        data: form.data,
        observacoes: form.observacoes,
        atribuicoes: [],
        eventoId: form.eventoId || undefined,
      });
      toast?.success("Escala criada. Selecione-a na lista para montar a equipe.");
      setForm({ eventoId: "", titulo: "", data: "", observacoes: "" });
      await reload();
    } catch (err) {
      toast?.error(err.message || "Erro ao salvar");
    }
  }

  async function toggleServidor(servidor, checked) {
    if (!canEdit) {
      toast?.error("Faça login como editor para alterar a equipe.");
      return;
    }
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
    if (!canEdit) {
      toast?.error("Faça login como editor para excluir.");
      return;
    }
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
        <p>
          Escolha um <strong>evento cadastrado</strong> para preencher data e título automaticamente (um evento só pode ter
          uma escala). A presença usa primeiro o vínculo com o evento e, se não houver, a mesma data.
        </p>
      </header>

      <div className="module-two-col">
        <form className="card form-card-inner form" onSubmit={handleCreate}>
          <fieldset className="module-fieldset" disabled={!canEdit}>
          <h3 className="module-subtitle">Nova escala</h3>
          {eventos.length > 0 && (
            <label>
              Vincular a evento
              <select
                value={form.eventoId}
                onChange={(e) => onSelectEventoVinculo(e.target.value)}
                aria-label="Selecionar evento para vincular à escala"
              >
                <option value="">Escala avulsa (preencher título e data manualmente)</option>
                {eventosDisponiveis.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.titulo}
                    {ev.data
                      ? ` — ${new Date(ev.data + "T12:00:00").toLocaleDateString("pt-BR")}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          {eventos.length === 0 && (
            <p className="muted small-hint" style={{ marginTop: 0 }}>
              Nenhum evento cadastrado. Crie eventos no módulo correspondente para vincular escalas com um clique, ou use
              escala avulsa abaixo.
            </p>
          )}
          <label>
            Título *
            <input
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Missa 19h — domingo"
              required
              readOnly={Boolean(form.eventoId)}
              className={form.eventoId ? "input-readonly-sync" : undefined}
            />
          </label>
          <label>
            Data *
            <input
              type="date"
              value={form.data}
              onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
              required
              readOnly={Boolean(form.eventoId)}
              className={form.eventoId ? "input-readonly-sync" : undefined}
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
          </fieldset>
        </form>

        <div className="card list-card-inner">
          <h3 className="module-subtitle">Escalas cadastradas</h3>
          {lista.length === 0 ? (
            <p className="empty-inline">Nenhuma escala ainda.</p>
          ) : (
            <ul className="escalas-lista">
              {lista.map((es) => {
                const evVinc = es.eventoId ? eventoPorId.get(es.eventoId) : null;
                return (
                  <li key={es.id} className={`escalas-item ${editingId === es.id ? "escalas-item--active" : ""}`}>
                    <div>
                      <strong>{es.titulo}</strong>
                      {evVinc && (
                        <span className="escala-evento-badge" title="Vinculada a um evento">
                          Evento: {evVinc.titulo}
                        </span>
                      )}
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
                      <button
                        type="button"
                        className="btn small danger"
                        onClick={() => handleRemoveEscala(es.id)}
                        disabled={!canEdit}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                );
              })}
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
                      disabled={!canEdit}
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
