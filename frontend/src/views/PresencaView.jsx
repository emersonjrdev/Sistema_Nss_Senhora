import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { eventosService } from "../services/eventosService";
import { escalasService } from "../services/escalasService";
import { presencaService } from "../services/presencaService";

function serverId(s) {
  return String(s._id || s.id || "");
}

function stripAccents(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

/** Grupos exibidos na chamada (ordem fixa). */
const GRUPOS_FUNCAO = [
  { id: "filhas", label: "Filhas de Maria" },
  { id: "coroinha", label: "Coroinha" },
  { id: "acolito", label: "Acólito" },
  { id: "outros", label: "Outros" },
];

function grupoPresenca(funcao) {
  const f = stripAccents(funcao);
  if (f.includes("filha")) return "filhas";
  if (f.includes("coroinha")) return "coroinha";
  if (f.includes("acolito")) return "acolito";
  return "outros";
}

function sortByNome(a, b) {
  return String(a.name || "").localeCompare(String(b.name || ""), "pt-BR", {
    sensitivity: "base",
  });
}

export default function PresencaView({ servidores }) {
  const { canEdit } = useAuth();
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

  const gruposPresenca = useMemo(() => {
    const buckets = Object.fromEntries(GRUPOS_FUNCAO.map((g) => [g.id, []]));
    for (const s of listaPresenca) {
      buckets[grupoPresenca(s.funcao)].push(s);
    }
    for (const id of Object.keys(buckets)) {
      buckets[id].sort(sortByNome);
    }
    return GRUPOS_FUNCAO.map((g) => ({
      ...g,
      servidores: buckets[g.id],
    })).filter((g) => g.servidores.length > 0);
  }, [listaPresenca]);

  async function setStatus(servidorId, status) {
    if (!canEdit) return;
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
          Escolha o evento e marque cada servidor. A lista aparece em <strong>ordem alfabética</strong>, separada por{" "}
          <strong>Filhas de Maria</strong>, <strong>Coroinha</strong> e <strong>Acólito</strong>. Se existir escala
          vinculada ao evento, ela tem prioridade; senão, usa-se escala na mesma data; caso contrário, listam-se todos os
          cadastrados.
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
        <div className="presenca-grupos">
          {gruposPresenca.map((grupo) => (
            <section key={grupo.id} className={`presenca-grupo presenca-grupo--${grupo.id} card`}>
              <h3 className="presenca-grupo-titulo">
                {grupo.label}
                <span className="presenca-grupo-contagem">{grupo.servidores.length}</span>
              </h3>
              <ul className="presenca-lista">
                {grupo.servidores.map((s) => {
                  const sid = serverId(s);
                  const st = mapa[sid];
                  return (
                    <li key={sid} className="presenca-linha">
                      <div className="presenca-linha-nome">
                        <strong>{s.name}</strong>
                        {s.funcao && grupo.id === "outros" && (
                          <span className="funcao-badge">{s.funcao}</span>
                        )}
                      </div>
                      <div className="presenca-botoes">
                        <button
                          type="button"
                          className={`btn small ${st === "presente" ? "" : "secondary"}`}
                          onClick={() => setStatus(sid, "presente")}
                          disabled={!canEdit}
                        >
                          Presente
                        </button>
                        <button
                          type="button"
                          className={`btn small ${st === "ausente" ? "danger" : "secondary"}`}
                          onClick={() => setStatus(sid, "ausente")}
                          disabled={!canEdit}
                        >
                          Ausente
                        </button>
                        <button
                          type="button"
                          className={`btn small ${st === "justificado" ? "info" : "secondary"}`}
                          onClick={() => setStatus(sid, "justificado")}
                          disabled={!canEdit}
                        >
                          Justificado
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
