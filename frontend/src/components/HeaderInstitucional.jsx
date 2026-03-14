import React from "react";
import LogoParoquia from "../assets/logo-paroquia.jpeg";

export default function HeaderInstitucional() {
  return (
    <header className="app-header">
      <div className="header-overlay" />
      <div className="header-content">
        <div className="logo-container">
          <img
            src={LogoParoquia}
            alt="Logo Paróquia Nossa Senhora das Graças"
            className="logo"
          />
        </div>
        <div className="header-text">
          <span className="header-chip">Paróquia Nossa Senhora das Graças</span>
          <h1>Gestão de Servidores do Altar</h1>
          <p className="subtitle">
            Plataforma institucional para cadastro, organização e acompanhamento pastoral.
          </p>
          <p className="header-slogan">
            "Servir ao altar com zelo, ordem e unidade."
          </p>
        </div>
      </div>
    </header>
  );
}
