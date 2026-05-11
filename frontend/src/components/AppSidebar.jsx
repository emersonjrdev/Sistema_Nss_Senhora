import React from "react";
import { MODULES } from "../config/modules";

export default function AppSidebar({ activeModule, onSelect, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={onCloseMobile}
        />
      )}
      <aside className={`app-sidebar ${mobileOpen ? "app-sidebar--open" : ""}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-title">Módulos</span>
          <span className="sidebar-brand-sub">Gestão paroquial</span>
        </div>
        <nav id="app-sidebar-nav" className="sidebar-nav" aria-label="Módulos do sistema">
          {MODULES.map((m) => {
            const active = m.id === activeModule;
            const statusClass =
              m.status === "ativo"
                ? "nav-status nav-status--ativo"
                : m.status === "parcial"
                  ? "nav-status nav-status--parcial"
                  : "nav-status nav-status--breve";
            return (
              <button
                key={m.id}
                type="button"
                className={`sidebar-nav-item ${active ? "sidebar-nav-item--active" : ""}`}
                onClick={() => onSelect(m.id)}
              >
                <span className="sidebar-nav-label">{m.shortLabel}</span>
                <span className={statusClass} title={m.description}>
                  {m.status === "ativo" ? "Ativo" : m.status === "parcial" ? "Parcial" : "Em breve"}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
