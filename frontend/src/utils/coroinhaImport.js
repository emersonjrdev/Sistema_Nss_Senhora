/**
 * Cruza lista de presenças (texto do Word) com inscrições (planilha Excel).
 * Tudo roda no navegador; nomes são normalizados para comparar com/sem acento.
 */

export function stripAccents(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Chaves do Google Forms costumam vir com \\r\\n no cabeçalho. */
export function normalizeSheetKeys(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const nk = String(k).replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
    out[nk] = v;
  }
  return out;
}

const KEY_NOME = "Nome completo";
const KEY_IDADE = "IDADE";
const KEY_TEL = "NUMERO DE TELEFONE";
const KEY_RESP = "NOME DO PAI/MÃE OU RESPOSANVEL";
const KEY_TEL_RESP = "NUMERO DO PAI/MÃE OU RESPOSANVEL";
const KEY_COM_TIPO = "EM QUAL COMUNIDADE VOCÊ PARTICIPA";
const KEY_COM_NOME = "SE FOR COMUNIDADE,QUAL COMUNIDADE?";
const KEY_SAC = "SACRAMENTOS";

export function sheetRowToPerson(rawRow) {
  const r = normalizeSheetKeys(rawRow);
  return {
    nomeCompleto: String(r[KEY_NOME] ?? "").trim(),
    idade: String(r[KEY_IDADE] ?? "").trim(),
    telefone: r[KEY_TEL] != null && r[KEY_TEL] !== "" ? String(r[KEY_TEL]).replace(/\D/g, "") : "",
    responsavel: String(r[KEY_RESP] ?? "").trim(),
    telResponsavel:
      r[KEY_TEL_RESP] != null && r[KEY_TEL_RESP] !== "" ? String(r[KEY_TEL_RESP]).replace(/\D/g, "") : "",
    comunidadeTipo: String(r[KEY_COM_TIPO] ?? "").trim(),
    comunidadeNome: String(r[KEY_COM_NOME] ?? "").trim(),
    sacramentos: String(r[KEY_SAC] ?? "").trim(),
  };
}

/** Linhas do tipo "Nome — 15/02." ou "Nome – texto" (só datas no segundo trecho contam). */
export function extractNamesFromFormationDocText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const names = [];
  for (const line of lines) {
    const m = line.match(/^(.+?)\s+[—–\-]\s+(.+)$/);
    if (!m) continue;
    const rest = m[2].trim();
    if (!/\d{1,2}\/\d{1,2}/.test(rest)) continue;
    const name = m[1].replace(/\.$/, "").trim();
    if (name.length < 3) continue;
    names.push(name);
  }
  return [...new Set(names)];
}

function exactMatch(nameNorm, people) {
  return people.find((p) => stripAccents(p.nomeCompleto) === nameNorm) || null;
}

function tokenMatch(nameNorm, people) {
  const tokens = nameNorm.split(" ").filter((t) => t.length >= 3);
  if (tokens.length < 2) return null;
  const hits = people.filter((p) => {
    const n = stripAccents(p.nomeCompleto);
    return tokens.every((t) => n.includes(t));
  });
  if (hits.length === 1) return hits[0];
  return null;
}

/**
 * @param {string[]} docNames nomes extraídos do .docx
 * @param {ReturnType<sheetRowToPerson>[]} excelPeople linhas do Excel
 */
export function matchFormationNamesToExcel(docNames, excelPeople) {
  const matched = [];
  const unmatchedDocx = [];

  const pool = [...excelPeople];

  for (const raw of docNames) {
    const nn = stripAccents(raw);
    let row = exactMatch(nn, pool);
    if (!row) row = tokenMatch(nn, pool);
    if (row) {
      const idx = pool.indexOf(row);
      if (idx >= 0) pool.splice(idx, 1);
      matched.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        docName: raw,
        ...row,
      });
    } else {
      unmatchedDocx.push(raw);
    }
  }

  return { matched, unmatchedDocx, remainingExcel: pool };
}

export const DRAFT_STORAGE_KEY = "coroinha_import_draft_v1";

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(rows) {
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    rows,
  };
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}
