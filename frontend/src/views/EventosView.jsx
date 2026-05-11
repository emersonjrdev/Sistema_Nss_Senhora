import React, { useState, useCallback, useEffect } from "react";
import { eventosService } from "../services/eventosService";

const TIPOS = ["Missa", "Festa litúrgica", "Formação", "Reunião", "Outro"];

export default function EventosView({ toast }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({
    titulo: "",
    data: "",
    hora: "",
    local: "",
    tipo: "Missa",
    observacoes: "",
  });

  const reload = useCallback(async () => {
    const l = await eventosService.list();
    setLista(l);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await eventosService.create(form);
      toast?.success("Evento cadastrado.");
      setForm({ titulo: "", data: "", hora: "", local: "", tipo: "Missa", observacoes: "" });
      await reload();
    } catch (err) {
      toast?.error(err.message || "Não foi possível salvar");
    }
  }

  async function handleRemove(id) {
    if (!window.confirm("Remover este evento?")) return;
    try {
      await eventosService.remove(id);
      toast?.success("Evento removido.");
      await reload();
    } catch (err) {
      toast?.error(err.message || "Erro ao remover");
    }
  }

  return (
    <section className="module-eventos">
      <header className="module-section-header">
        <h2>Eventos e missas</h2>
        <p>Cadastre celebrações e atividades. Essas datas podem ser usadas na escala e na chamada de presença.</p>
      </header>

      <div className="module-two-col">
        <form className="card form-card-inner form" onSubmit={handleSubmit}>
          <h3 className="module-subtitle">Novo evento</h3>
          <label>
            Título *
            <input
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder="Ex: Missa dominical — 19h"
              required
            />
          </label>
          <div className="form-grid">
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
              Horário
              <input
                value={form.hora}
                onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                placeholder="19h00"
              />
            </label>
            <label>
              Tipo
              <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Local
              <input
                value={form.local}
                onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
                placeholder="Matriz, capela..."
              />
            </label>
          </div>
          <label className="full-width">
            Observações
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              rows={2}
              placeholder="Detalhes opcionais"
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Salvar evento
            </button>
          </div>
        </form>

        <div className="card list-card-inner">
          <h3 className="module-subtitle">Próximos e recentes</h3>
          {lista.length === 0 ? (
            <p className="empty-inline">Nenhum evento cadastrado.</p>
          ) : (
            <ul className="eventos-lista">
              {lista.map((ev) => (
                <li key={ev.id} className="eventos-item">
                  <div>
                    <strong>{ev.titulo}</strong>
                    <span className="funcao-badge">{ev.tipo}</span>
                    <p className="muted">
                      {ev.data
                        ? new Date(ev.data + "T12:00:00").toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                      {ev.hora ? ` · ${ev.hora}` : ""}
                      {ev.local ? ` · ${ev.local}` : ""}
                    </p>
                  </div>
                  <button type="button" className="btn small danger" onClick={() => handleRemove(ev.id)}>
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
