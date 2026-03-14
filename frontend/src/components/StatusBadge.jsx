import React from "react";

const statusClass = {
  Ativo: "status-badge status-active",
  "Em formação": "status-badge status-training",
  Inativo: "status-badge status-inactive",
};

export default function StatusBadge({ status }) {
  const normalized = status || "Ativo";
  const classes = statusClass[normalized] || "status-badge";
  return <span className={classes}>{normalized}</span>;
}
