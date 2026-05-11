import React from "react";

export default function ModuleComingSoon({ title, description, roadmap = [] }) {
  return (
    <section className="module-placeholder">
      <header className="module-placeholder-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="module-placeholder-body">
        <p className="module-placeholder-badge">Em desenvolvimento</p>
        {roadmap.length > 0 && (
          <ul className="module-roadmap">
            {roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
