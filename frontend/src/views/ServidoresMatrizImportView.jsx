import React, { useState, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import { stripAccents } from "../utils/coroinhaImport";
import {
  MATRIZ_LOCAL,
  MATRIZ_COMUNIDADE,
  extractNamesFromServidoresListText,
  extractNamesFromSpreadsheetRows,
  namesToImportRows,
  rowToMatrizUserPayload,
  loadMatrizDraft,
  saveMatrizDraft,
  clearMatrizDraft,
} from "../utils/servidoresMatrizImport";

const FUNCOES = ["Filhas de Maria", "Coroinha", "Acólito", "Cerimoniário"];

export default function ServidoresMatrizImportView({ servidores, toast, onImported }) {
  const { canEdit } = useAuth();
  const [rows, setRows] = useState([]);
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState({ source: "" });

  const existingNames = useMemo(() => {
    const s = new Set();
    (servidores || []).forEach((u) => s.add(stripAccents(u.name)));
    return s;
  }, [servidores]);

  const applyNames = useCallback((names, sourceLabel) => {
    if (!names.length) {
      toast?.error("Nenhum nome encontrado. Use uma linha por pessoa.");
      return;
    }
    setRows(namesToImportRows(names));
    setMeta({ source: sourceLabel });
    toast?.success(`${names.length} nome(s) na lista (Matriz — ${MATRIZ_COMUNIDADE}).`);
  }, [toast]);

  const processPaste = useCallback(() => {
    const names = extractNamesFromServidoresListText(pasteText);
    applyNames(names, "Texto colado");
  }, [pasteText, applyNames]);

  const processFile = useCallback(
    async (file) => {
      if (!file) {
        toast?.error("Selecione um arquivo Word, Excel ou texto.");
        return;
      }
      setBusy(true);
      try {
        const name = file.name.toLowerCase();
        if (name.endsWith(".docx")) {
          const ab = await file.arrayBuffer();
          const doc = await mammoth.extractRawText({ arrayBuffer: ab });
          applyNames(extractNamesFromServidoresListText(doc.value), file.name);
        } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
          const ab = await file.arrayBuffer();
          const wb = XLSX.read(ab, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          applyNames(extractNamesFromSpreadsheetRows(json), file.name);
        } else if (name.endsWith(".txt")) {
          const text = await file.text();
          applyNames(extractNamesFromServidoresListText(text), file.name);
        } else {
          toast?.error("Use .docx, .xlsx ou .txt");
        }
      } catch (e) {
        console.error(e);
        toast?.error(e.message || "Erro ao ler o arquivo.");
      } finally {
        setBusy(false);
      }
    },
    [applyNames, toast]
  );

  const handleLoadDraft = useCallback(() => {
    const d = loadMatrizDraft();
    if (!d?.rows?.length) {
      toast?.info("Não há rascunho salvo neste navegador.");
      return;
    }
    setRows(d.rows);
    setMeta({ source: "Rascunho do navegador" });
    toast?.success(`Rascunho carregado (${d.rows.length} pessoa(s)).`);
  }, [toast]);

  const handleSaveDraft = useCallback(() => {
    if (!rows.length) {
      toast?.error("Processe nomes antes de salvar o rascunho.");
      return;
    }
    saveMatrizDraft(rows);
    toast?.success("Rascunho salvo neste navegador.");
  }, [rows, toast]);

  const handleClearDraft = useCallback(() => {
    clearMatrizDraft();
    setRows([]);
    setPasteText("");
    setMeta({ source: "" });
    toast?.success("Rascunho apagado.");
  }, [toast]);

  const removeRow = useCallback((id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const setRowFuncao = useCallback((id, funcao) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, funcao } : r)));
  }, []);

  const addManualName = useCallback(() => {
    const nome = window.prompt("Nome completo do servidor:");
    if (!nome?.trim()) return;
    const trimmed = nome.trim();
    if (trimmed.length < 3) {
      toast?.error("Nome muito curto.");
      return;
    }
    setRows((prev) => [...prev, ...namesToImportRows([trimmed])]);
    toast?.success("Nome adicionado à lista.");
  }, [toast]);

  const cadastrar = useCallback(async () => {
    if (!canEdit) {
      toast?.error("Entre como editor para cadastrar na API.");
      return;
    }
    if (!rows.length) {
      toast?.error("Não há ninguém na lista.");
      return;
    }
    setBusy(true);
    let ok = 0;
    let skip = 0;
    let err = 0;
    const seen = new Set(existingNames);
    try {
      for (const row of rows) {
        const payload = rowToMatrizUserPayload(row);
        const nn = stripAccents(payload.name);
        if (seen.has(nn)) {
          skip += 1;
          continue;
        }
        try {
          await storageService.createUser(payload);
          seen.add(nn);
          ok += 1;
        } catch (e) {
          console.error(e);
          err += 1;
        }
      }
      toast?.success(`Cadastro: ${ok} novo(s). ${skip} já existiam. ${err} erro(s).`);
      if (ok > 0) onImported?.();
    } finally {
      setBusy(false);
    }
  }, [canEdit, rows, existingNames, toast, onImported]);

  return (
    <section className="module-coroinha-import module-matriz-import">
      <header className="module-section-header">
        <h2>Importar quem já serve na Matriz</h2>
        <p>
          Para servidores <strong>já em atividade</strong> na <strong>Matriz — {MATRIZ_COMUNIDADE}</strong>: envie um
          documento ou cole uma lista com <strong>um nome por linha</strong>. O sistema sugere a função pelo primeiro nome;
          telefone e foto podem ser preenchidos depois no cadastro.
        </p>
      </header>

      <div className="card coroinha-import-card">
        <h3 className="module-subtitle">Lista de nomes</h3>
        <p className="muted small-hint">
          Formatos: <strong>.docx</strong> (Word), <strong>.xlsx</strong> (primeira coluna ou coluna “Nome”),{" "}
          <strong>.txt</strong> ou texto colado abaixo.
        </p>

        <label className="coroinha-file-label matriz-file-label">
          <span>Arquivo (.docx, .xlsx ou .txt)</span>
          <input
            id="matriz-import-file"
            type="file"
            accept=".docx,.xlsx,.xls,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processFile(f);
              e.target.value = "";
            }}
          />
        </label>

        <label className="matriz-paste-label">
          <span>Ou cole os nomes (um por linha)</span>
          <textarea
            className="matriz-paste-area"
            rows={8}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={"João Pedro da Silva\nMaria Aparecida Santos\n..."}
            disabled={busy}
          />
        </label>

        <div className="coroinha-import-actions">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={processPaste}>
            {busy ? "Processando…" : "Ler nomes colados"}
          </button>
          <button type="button" className="btn secondary" disabled={busy} onClick={addManualName}>
            Adicionar um nome
          </button>
          <button type="button" className="btn secondary" onClick={handleLoadDraft} disabled={busy}>
            Carregar rascunho
          </button>
          <button type="button" className="btn secondary" onClick={handleSaveDraft} disabled={busy || !rows.length}>
            Salvar rascunho
          </button>
          <button type="button" className="btn secondary" onClick={handleClearDraft} disabled={busy}>
            Apagar rascunho
          </button>
        </div>
        {meta.source && (
          <p className="muted small-hint coroinha-meta">
            Origem: <strong>{meta.source}</strong> — local fixo: <strong>{MATRIZ_LOCAL}</strong>, comunidade:{" "}
            <strong>{MATRIZ_COMUNIDADE}</strong>, status: <strong>Ativo</strong>.
          </p>
        )}
      </div>

      {rows.length > 0 && (
        <div className="card coroinha-import-card">
          <div className="coroinha-import-list-head">
            <h3 className="module-subtitle">Lista para cadastro ({rows.length})</h3>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={cadastrar}>
              Cadastrar na lista de servidores
            </button>
          </div>
          <p className="muted small-hint">
            Quem já existir com o mesmo nome (ignorando acentos) será ignorado. Confira a função antes de cadastrar.
          </p>
          <div className="coroinha-table-wrap">
            <table className="table coroinha-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Função</th>
                  <th>Local</th>
                  <th>Comunidade</th>
                  <th aria-label="Remover" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="nome-cell">{r.nomeCompleto}</td>
                    <td>
                      <select
                        className="coroinha-funcao-select"
                        value={r.funcao}
                        onChange={(e) => setRowFuncao(r.id, e.target.value)}
                        aria-label={`Função de ${r.nomeCompleto}`}
                      >
                        {FUNCOES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{MATRIZ_LOCAL}</td>
                    <td>{MATRIZ_COMUNIDADE}</td>
                    <td>
                      <button type="button" className="btn small danger" onClick={() => removeRow(r.id)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
