import React, { useMemo } from "react";

function parseBirthDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysUntil(fromDate, toDate) {
  const t0 = startOfDay(fromDate).getTime();
  const t1 = startOfDay(toDate).getTime();
  return Math.round((t1 - t0) / (24 * 60 * 60 * 1000));
}

/** Próximo aniversário a partir de hoje (ano civil). */
function nextBirthdayDate(birthIso) {
  const birth = parseBirthDate(birthIso);
  if (!birth) return null;
  const today = new Date();
  const y = today.getFullYear();
  const m = birth.getMonth();
  const day = birth.getDate();
  let next = new Date(y, m, day);
  if (startOfDay(next) < startOfDay(today)) {
    next = new Date(y + 1, m, day);
  }
  return next;
}

export default function AniversariantesView({ servidores }) {
  const rows = useMemo(() => {
    const today = new Date();
    return servidores
      .filter((s) => s.nascimento)
      .map((s) => {
        const next = nextBirthdayDate(s.nascimento);
        if (!next) return null;
        const d = daysUntil(today, next);
        return {
          id: s._id || s.id,
          name: s.name,
          nascimento: s.nascimento,
          next,
          days: d,
          funcao: s.funcao,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.days - b.days);
  }, [servidores]);

  return (
    <section className="module-aniversariantes">
      <header className="module-section-header">
        <h2>Aniversariantes</h2>
        <p>Servidores com data de nascimento cadastrada, ordenados pelo próximo aniversário.</p>
      </header>

      {rows.length === 0 ? (
        <p className="empty-inline">Nenhum servidor com data de nascimento. Inclua o campo no cadastro.</p>
      ) : (
        <ul className="aniversariantes-list">
          {rows.map((r) => (
            <li key={r.id} className="aniversariantes-item">
              <div>
                <strong>{r.name}</strong>
                {r.funcao && <span className="funcao-badge">{r.funcao}</span>}
              </div>
              <div className="aniversariantes-meta">
                <span>
                  Próximo:{" "}
                  <b>{r.next.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</b>
                </span>
                <span className="muted">
                  {r.days === 0 ? "Hoje" : r.days === 1 ? "Amanhã" : `Em ${r.days} dias`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
