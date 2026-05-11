import React, { useState, useMemo, useCallback, useEffect } from "react";
import { eventosService } from "../services/eventosService";
import { escalasService } from "../services/escalasService";
import { presencaService } from "../services/presencaService";

function serverId(s) {
  return String(s._id || s.id || "");
}

export default function PresencaView({ servidores }) {
  const [eventos, setEventos] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [eventoId, setEventoId] = useState("");
  const [mapa, setMapa] = useState({});

  const loadBase = useCallback(async () => {
    const [ev, es] = await Promise.all([eventosService.list(), escalasService.list()]);
    setEventos(ev);
    setEscalas(es);
    setEventoId((prev) => (prev && ev.some((e) => e.id === prev) ? prev : ev[0]?.id || ""));
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    if (!eventoId) {
      setMapa({});
      return;
    }
    let cancelled = false;
    (async () => {
      const m = await presencaService.getForEvento(eventoId);
      if (!cancelled) setMapa(m || {});
    })();
    return () => {
      cancelled = true;
    };
  }, [eventoId]);

  const evento = eventos.find((e) => e.id === eventoId);
  const escalaVinculada = evento?.id ? escalas.find((e) => e.eventoId === evento.id) : null;
  const escalaDoDia =
    escalaVinculada || (evento?.data ? escalas.find((e) => e.data === evento.data) : null);

  const listaPresenca = useMemo(() => {
    const idsNaEscala = new Set((escalaDoDia?.atribuicoes || []).map((a) => a.servidorId));
    if (idsNaEscala.size > 0) {
      return servidores.filter((s) => idsNaEscala.has(serverId(s)));
    }
    return servidores;
  }, [servidores, escalaDoDia]);

  async function setStatus(servidorId, status) {
    if (!eventoId) return;
    const current = mapa[servidorId];
    const next = current === status ? "" : status;
    await presencaService.setStatus(eventoId, servidorId, next);
    setMapa(await presencaService.getForEvento(eventoId));
  }

  if (!eventos.length) {
    return (
      <section className="module-presenca">
        <header className="module-section-header">
          <h2>Controle de presença</h2>
          <p>Cadastre ao menos um evento no módulo “Eventos e missas” para registrar a chamada.</p>
        </header>
        <p className="empty-inline">Nenhum evento disponível.</p>
      </section>
    );
  }

  return (
    <section className="module-presenca">
      <header className="module-section-header">
        <h2>Controle de presença</h2>
        <p>
          Escolha o evento e marque cada servidor. Se existir escala <strong>vinculada ao evento</strong>, ela tem
          prioridade; senão, usa-se escala na mesma data; caso contrário, listam-se todos os cadastrados.
        </p>
      </header>

      <div className="card form-card-inner presenca-toolbar">
        <label>
          Evento
          <select value={eventoId} onChange={(e) => setEventoId(e.target.value)}>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.titulo} —{" "}
                {ev.data ? new Date(ev.data + "T12:00:00").toLocaleDateString("pt-BR") : ""}
              </option>
            ))}
          </select>
        </label>
        {escalaDoDia ? (
          <p className="muted presenca-hint">
            {escalaVinculada ? (
              <>
                Equipe da escala <strong>vinculada a este evento</strong>:{" "}
              </>
            ) : (
              <>Equipe da escala na <strong>mesma data</strong> (sem vínculo direto): </>
            )}
            <strong>{escalaDoDia.titulo}</strong> ({(escalaDoDia.atribuicoes || []).length} pessoas).
          </p>
        ) : (
          <p className="muted presenca-hint">
            Nenhuma escala vinculada nem na mesma data: listando todos os servidores cadastrados.
          </p>
        )}
      </div>

      {listaPresenca.length === 0 ? (
        <p className="empty-inline">Nenhum servidor na lista para este evento.</p>
      ) : (
        <ul className="presenca-lista">
          {listaPresenca.map((s) => {
            const sid = serverId(s);
            const st = mapa[sid];
            return (
              <li key={sid} className="presenca-linha">
                <div>
                  <strong>{s.name}</strong>
                  {s.funcao && <span className="funcao-badge">{s.funcao}</span>}
                </div>
                <div className="presenca-botoes">
                  <button
                    type="button"
                    className={`btn small ${st === "presente" ? "" : "secondary"}`}
                    onClick={() => setStatus(sid, "presente")}
                  >
                    Presente
                  </button>
                  <button
                    type="button"
                    className={`btn small ${st === "ausente" ? "danger" : "secondary"}`}
                    onClick={() => setStatus(sid, "ausente")}
                  >
                    Ausente
                  </button>
                  <button
                    type="button"
                    className={`btn small ${st === "justificado" ? "info" : "secondary"}`}
                    onClick={() => setStatus(sid, "justificado")}
                  >
                    Justificado
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
