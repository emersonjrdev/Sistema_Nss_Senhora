import React, { useState, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { useAuth } from "../context/AuthContext";
import { storageService } from "../services/storageService";
import { maskPhoneBR } from "../utils/phoneMask";
import {
  sheetRowToPerson,
  extractNamesFromFormationDocText,
  matchFormationNamesToExcel,
  loadDraft,
  saveDraft,
  clearDraft,
  stripAccents,
  inferFuncaoImportacaoCoroinha,
} from "../utils/coroinhaImport";

const FUNCOES_IMPORTACAO = ["Filhas de Maria", "Coroinha"];

function rowToUserPayload(row) {
  const tel = row.telefone ? maskPhoneBR(row.telefone) : "";
  const obs = [
    row.idade && `Idade informada: ${row.idade}`,
    row.responsavel && `Responsável: ${row.responsavel}`,
    row.telResponsavel && `Tel. responsável: ${maskPhoneBR(row.telResponsavel)}`,
    row.sacramentos && `Sacramentos: ${row.sacramentos}`,
    row.docName && row.docName !== row.nomeCompleto && `Nome na lista de formação: ${row.docName}`,
  ]
    .filter(Boolean)
    .join(" | ");

  const local = row.comunidadeNome?.trim() || row.comunidadeTipo?.trim() || null;
  const com =
    row.comunidadeTipo && row.comunidadeNome
      ? `${row.comunidadeTipo} — ${row.comunidadeNome}`.trim()
      : null;

  return {
    name: row.nomeCompleto.trim(),
    funcao: row.funcao || inferFuncaoImportacaoCoroinha(row),
    telefone: tel || null,
    local,
    comunidade: com,
    observacoes: obs || null,
    status: "Em formação",
    inicio: null,
    nascimento: null,
    photo: null,
  };
}

export default function CoroinhaImportView({ servidores, toast, onImported }) {
  const { canEdit } = useAuth();
  const [rows, setRows] = useState([]);
  const [unmatchedDocx, setUnmatchedDocx] = useState([]);
  const [remainingExcel, setRemainingExcel] = useState([]);
  const [meta, setMeta] = useState({ excelName: "", docxName: "" });
  const [busy, setBusy] = useState(false);
  const [manualPick, setManualPick] = useState("");

  const existingNames = useMemo(() => {
    const s = new Set();
    (servidores || []).forEach((u) => s.add(stripAccents(u.name)));
    return s;
  }, [servidores]);

  const handleLoadDraft = useCallback(() => {
    const d = loadDraft();
    if (!d?.rows?.length) {
      toast?.info("Não há rascunho salvo neste navegador.");
      return;
    }
    setRows(
      d.rows.map((r) => ({
        ...r,
        funcao: r.funcao || inferFuncaoImportacaoCoroinha(r),
      }))
    );
    setUnmatchedDocx([]);
    setRemainingExcel([]);
    setMeta((m) => ({ ...m, fromDraft: true }));
    toast?.success(`Rascunho carregado (${d.rows.length} pessoa(s)).`);
  }, [toast]);

  const handleSaveDraft = useCallback(() => {
    if (!rows.length) {
      toast?.error("Processe os arquivos ou carregue um rascunho antes de salvar.");
      return;
    }
    saveDraft(rows);
    toast?.success("Lista salva só neste navegador (rascunho). Você pode voltar depois.");
  }, [rows, toast]);

  const handleClearDraft = useCallback(() => {
    clearDraft();
    setRows([]);
    setUnmatchedDocx([]);
    setRemainingExcel([]);
    setMeta({ excelName: "", docxName: "" });
    toast?.success("Rascunho do navegador apagado.");
  }, [toast]);

  const processFiles = useCallback(
    async (excelFile, docxFile) => {
      if (!excelFile || !docxFile) {
        toast?.error("Selecione o arquivo Excel (.xlsx) e o Word (.docx) da formação.");
        return;
      }
      setBusy(true);
      try {
        const abX = await excelFile.arrayBuffer();
        const wb = XLSX.read(abX, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const people = json.map(sheetRowToPerson).filter((p) => p.nomeCompleto);

        const abD = await docxFile.arrayBuffer();
        const docResult = await mammoth.extractRawText({ arrayBuffer: abD });
        const names = extractNamesFromFormationDocText(docResult.value);

        if (!names.length) {
          toast?.error(
            "Não encontrei nomes no Word no formato “Nome — datas”. Confira se é o arquivo certo."
          );
          setBusy(false);
          return;
        }

        const { matched, unmatchedDocx: umd, remainingExcel: rem } = matchFormationNamesToExcel(names, people);

        setRows(
          matched.map((r) => ({
            ...r,
            id: r.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            funcao: inferFuncaoImportacaoCoroinha(r),
          }))
        );
        setUnmatchedDocx(umd);
        setRemainingExcel(rem);
        setMeta({ excelName: excelFile.name, docxName: docxFile.name });
        toast?.success(
          `Cruzamento pronto: ${matched.length} na lista. ${umd.length} nome(s) do Word sem par na planilha.`
        );
      } catch (e) {
        console.error(e);
        toast?.error(e.message || "Erro ao ler os arquivos.");
      } finally {
        setBusy(false);
      }
    },
    [toast]
  );

  const removeRow = useCallback((id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const setRowFuncao = useCallback((id, funcao) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, funcao } : r)));
  }, []);

  const addFromRemaining = useCallback(() => {
    if (manualPick === "") return;
    const idx = Number(manualPick);
    if (Number.isNaN(idx) || idx < 0) return;
    const p = remainingExcel[idx];
    if (!p) return;
    setRows((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        docName: "(inclusão manual)",
        ...p,
        funcao: inferFuncaoImportacaoCoroinha(p),
      },
    ]);
    setRemainingExcel((prev) => prev.filter((_, i) => i !== idx));
    setManualPick("");
    toast?.success("Pessoa adicionada à lista.");
  }, [manualPick, remainingExcel, toast]);

  const cadastrarSelecionados = useCallback(async () => {
    if (!canEdit) {
      toast?.error("Entre como editor para cadastrar na API.");
      return;
    }
    if (!rows.length) {
      toast?.error("Não há ninguém na lista para cadastrar.");
      return;
    }
    setBusy(true);
    let ok = 0;
    let skip = 0;
    let err = 0;
    const seen = new Set(existingNames);
    try {
      for (const row of rows) {
        const payload = rowToUserPayload(row);
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
    <section className="module-coroinha-import">
      <header className="module-section-header">
        <h2>Importar coroinhas (planilha + formação)</h2>
        <p>
          Envie o <strong>Excel das inscrições</strong> e o <strong>Word com a lista de presença nas formações</strong>.
          O sistema cruza os nomes, monta uma lista <strong>só no seu navegador</strong> (rascunho) e só grava no cadastro
          geral quando você clicar em cadastrar. Você pode remover linhas ou incluir alguém da planilha antes.
        </p>
      </header>

      <div className="card coroinha-import-card">
        <h3 className="module-subtitle">Arquivos</h3>
        <div className="coroinha-import-files">
          <label className="coroinha-file-label">
            <span>Excel (.xlsx) — inscrições</span>
            <input
              id="coroinha-xlsx"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
          </label>
          <label className="coroinha-file-label">
            <span>Word (.docx) — presenças na formação</span>
            <input
              id="coroinha-docx"
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </label>
        </div>
        <div className="coroinha-import-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => {
              const x = document.getElementById("coroinha-xlsx")?.files?.[0];
              const d = document.getElementById("coroinha-docx")?.files?.[0];
              processFiles(x, d);
            }}
          >
            {busy ? "Processando…" : "Processar e cruzar dados"}
          </button>
          <button type="button" className="btn secondary" onClick={handleLoadDraft} disabled={busy}>
            Carregar rascunho do navegador
          </button>
          <button type="button" className="btn secondary" onClick={handleSaveDraft} disabled={busy || !rows.length}>
            Salvar rascunho no navegador
          </button>
          <button type="button" className="btn secondary" onClick={handleClearDraft} disabled={busy}>
            Apagar rascunho
          </button>
        </div>
        {(meta.excelName || meta.docxName) && (
          <p className="muted small-hint coroinha-meta">
            Último processamento: <strong>{meta.excelName || "—"}</strong> + <strong>{meta.docxName || "—"}</strong>
          </p>
        )}
      </div>

      {rows.length > 0 && (
        <div className="card coroinha-import-card">
          <div className="coroinha-import-list-head">
            <h3 className="module-subtitle">Lista para cadastro ({rows.length})</h3>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={cadastrarSelecionados}>
              Cadastrar na lista de servidores
            </button>
          </div>
          <p className="muted small-hint">
            A <strong>função</strong> é sugerida pelo primeiro nome (meninas → Filhas de Maria; meninos → Coroinha).
            Se a planilha passar a ter coluna de sexo, ela terá prioridade. Confira telefone e comunidade; quem já
            existir com o mesmo nome (ignorando maiúsculas/acentos) será ignorado.
          </p>
          <div className="coroinha-table-wrap">
            <table className="table coroinha-table">
              <thead>
                <tr>
                  <th>Nome (planilha)</th>
                  <th>Como no Word</th>
                  <th>Função</th>
                  <th>Idade</th>
                  <th>Telefone</th>
                  <th>Comunidade</th>
                  <th aria-label="Remover" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="nome-cell">{r.nomeCompleto}</td>
                    <td>{r.docName}</td>
                    <td>
                      <select
                        className="coroinha-funcao-select"
                        value={r.funcao || inferFuncaoImportacaoCoroinha(r)}
                        onChange={(e) => setRowFuncao(r.id, e.target.value)}
                        aria-label={`Função de ${r.nomeCompleto}`}
                      >
                        {FUNCOES_IMPORTACAO.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{r.idade || "—"}</td>
                    <td>{r.telefone ? maskPhoneBR(r.telefone) : "—"}</td>
                    <td>{r.comunidadeNome || r.comunidadeTipo || "—"}</td>
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

          {remainingExcel.length > 0 && (
            <div className="coroinha-manual-add">
              <h4 className="module-subtitle">Incluir alguém da planilha que não entrou no Word</h4>
              <div className="coroinha-manual-row">
                <select value={manualPick} onChange={(e) => setManualPick(e.target.value)} aria-label="Pessoa na planilha">
                  <option value="">Selecione…</option>
                  {remainingExcel.map((p, i) => (
                    <option key={`${i}-${p.nomeCompleto}`} value={String(i)}>
                      {p.nomeCompleto}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn secondary" onClick={addFromRemaining} disabled={manualPick === ""}>
                  Adicionar à lista
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {unmatchedDocx.length > 0 && (
        <div className="card coroinha-import-card coroinha-warn-card">
          <h3 className="module-subtitle">Nomes no Word sem correspondência exata na planilha</h3>
          <p className="muted small-hint">
            Confira ortografia ou use “Incluir alguém da planilha”. Lista: {unmatchedDocx.join(" · ")}
          </p>
        </div>
      )}
    </section>
  );
}
