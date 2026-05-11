import React, { useMemo } from "react";

export default function ComunidadesView({ servidores }) {
  const grupos = useMemo(() => {
    const map = {};
    for (const s of servidores) {
      const key = (s.comunidade || "").trim() || "Sem comunidade informada";
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return Object.entries(map)
      .map(([nome, lista]) => ({ nome, lista, count: lista.length }))
      .sort((a, b) => b.count - a.count);
  }, [servidores]);

  return (
    <section className="module-comunidades">
      <header className="module-section-header">
        <h2>Comunidades</h2>
        <p>Agrupamento pelo campo “Comunidade/Paróquia” do cadastro. Útil para organizar equipes por capela ou grupo.</p>
      </header>

      {servidores.length === 0 ? (
        <p className="empty-inline">Nenhum servidor cadastrado.</p>
      ) : (
        <div className="comunidades-grid">
          {grupos.map((g) => (
            <article key={g.nome} className="comunidade-card">
              <h3>{g.nome}</h3>
              <p className="comunidade-count">{g.count} servidor(es)</p>
              <ul className="comunidade-nomes">
                {g.lista.slice(0, 8).map((s) => (
                  <li key={s._id || s.id}>{s.name}</li>
                ))}
                {g.lista.length > 8 && <li className="muted">… e mais {g.lista.length - 8}</li>}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
