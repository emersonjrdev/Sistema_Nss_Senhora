import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { eventosService } from "../services/eventosService";
import { presencaService } from "../services/presencaService";

const TIPOS = ["Missa", "Festa litúrgica", "Formação", "Reunião", "Outro"];

const STATUS_LABEL = {
  presente: "Presente",
  ausente: "Ausente",
  justificado: "Justificado",
};

function serverId(s) {
  return String(s._id || s.id || "");
}

export default function EventosView({ toast, servidores = [] }) {
  const { canEdit } = useAuth();
  const [lista, setLista] = useState([]);
  const [presencaPorEvento, setPresencaPorEvento] = useState({});
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!lista.length) {
        if (!cancelled) setPresencaPorEvento({});
        return;
      }
      const pairs = await Promise.all(
        lista.map(async (ev) => {
          const m = await presencaService.getForEvento(ev.id);
          return [ev.id, m || {}];
        })
      );
      if (!cancelled) setPresencaPorEvento(Object.fromEntries(pairs));
    })();
    return () => {
      cancelled = true;
    };
  }, [lista]);

  const nomeServidor = useMemo(() => {
    const map = new Map();
    servidores.forEach((s) => map.set(serverId(s), s.name || "—"));
    return (id) => map.get(id) || "Servidor";
  }, [servidores]);

  function linhasPresenca(eventoId) {
    const map = presencaPorEvento[eventoId] || {};
    return Object.entries(map)
      .filter(([, st]) => Boolean(st))
      .map(([sid, st]) => ({
        sid,
        nome: nomeServidor(sid),
        st,
        label: STATUS_LABEL[st] || st,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canEdit) {
      toast?.error("Faça login como editor para cadastrar eventos.");
      return;
    }
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
    if (!canEdit) {
      toast?.error("Faça login como editor para excluir.");
      return;
    }
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
        <p>
          Cadastre celebrações e atividades. No módulo <strong>Escalas</strong> você pode vincular uma escala a cada
          evento; a <strong>presença</strong> confirmada aparece abaixo no respectivo evento.
        </p>
      </header>

      <div className="module-two-col">
        <form className="card form-card-inner form" onSubmit={handleSubmit}>
          <fieldset className="module-fieldset" disabled={!canEdit}>
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
          </fieldset>
        </form>

        <div className="card list-card-inner">
          <h3 className="module-subtitle">Próximos e recentes</h3>
          {lista.length === 0 ? (
            <p className="empty-inline">Nenhum evento cadastrado.</p>
          ) : (
            <ul className="eventos-lista">
              {lista.map((ev) => {
                const linhas = linhasPresenca(ev.id);
                return (
                  <li key={ev.id} className="eventos-item">
                    <div className="eventos-item-content">
                      <div className="eventos-item-head">
                        <strong>{ev.titulo}</strong>
                        <span className="funcao-badge">{ev.tipo}</span>
                      </div>
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
                      {linhas.length > 0 ? (
                        <div className="evento-presenca-bloco">
                          <span className="evento-presenca-titulo">Presença registrada neste evento</span>
                          <ul className="evento-presenca-lista">
                            {linhas.map((row) => (
                              <li key={row.sid} className="evento-presenca-linha">
                                <span className="evento-presenca-nome">{row.nome}</span>
                                <span className={`pres-pill pres-pill--${row.st}`}>{row.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="evento-presenca-vazia muted">Nenhuma presença confirmada ainda neste evento.</p>
                      )}
                    </div>
                    <div className="eventos-item-actions">
                      <button
                        type="button"
                        className="btn small danger"
                        onClick={() => handleRemove(ev.id)}
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
    </section>
  );
}
