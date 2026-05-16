import { stripAccents, inferFuncaoImportacaoCoroinha } from "./coroinhaImport";

/** Local e comunidade padrão para quem já serve na Matriz. */
export const MATRIZ_LOCAL = "Matriz";
export const MATRIZ_COMUNIDADE = "Nossa Senhora das Graças";

export const MATRIZ_DRAFT_KEY = "servidores_matriz_import_draft_v1";

const HEADER_SKIP =
  /^(nome|nomes|lista|servidores?|coroinhas?|matriz|comunidade|total|pagina|página|#|observacoes|observações)$/i;

function cleanLine(raw) {
  let line = String(raw || "").trim();
  if (!line) return "";
  line = line.replace(/^\d+[\.\)]\s*/, "");
  line = line.replace(/^[-•*▪]\s*/, "");
  line = line.replace(/\s+/g, " ").trim();
  const dash = line.match(/^(.+?)\s+[—–\-]\s+(.+)$/);
  if (dash) {
    const rest = dash[2].trim();
    const name = dash[1].replace(/\.$/, "").trim();
    if (/\d{1,2}\/\d{1,2}/.test(rest) || name.length >= 3) return name;
  }
  return line;
}

function isLikelyName(line) {
  if (line.length < 3) return false;
  if (HEADER_SKIP.test(stripAccents(line))) return false;
  if (/^\d+$/.test(line)) return false;
  const letters = (line.match(/\p{L}/gu) || []).length;
  return letters >= 3 && letters / line.length >= 0.5;
}

/**
 * Extrai nomes de texto colado ou exportado do Word (um nome por linha).
 * @returns {string[]}
 */
export function extractNamesFromServidoresListText(text) {
  const lines = String(text || "").split(/\r?\n/);
  const seen = new Set();
  const names = [];

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!isLikelyName(line)) continue;
    const key = stripAccents(line);
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(line);
  }
  return names;
}

/**
 * Primeira coluna com nomes ou coluna cujo cabeçalho contém "nome".
 * @param {Record<string, unknown>[]} json sheet_to_json rows
 */
export function extractNamesFromSpreadsheetRows(json) {
  if (!json?.length) return [];
  const first = json[0];
  const keys = Object.keys(first);
  let key = keys.find((k) => stripAccents(k).includes("nome")) || keys[0];
  const seen = new Set();
  const names = [];
  for (const row of json) {
    const val = String(row[key] ?? "").trim();
    const line = cleanLine(val);
    if (!isLikelyName(line)) continue;
    const k = stripAccents(line);
    if (seen.has(k)) continue;
    seen.add(k);
    names.push(line);
  }
  return names;
}

export function namesToImportRows(names) {
  return names.map((nomeCompleto) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    nomeCompleto,
    funcao: inferFuncaoImportacaoCoroinha({ nomeCompleto }),
    local: MATRIZ_LOCAL,
    comunidadeNome: MATRIZ_COMUNIDADE,
    status: "Ativo",
  }));
}

export function rowToMatrizUserPayload(row) {
  return {
    name: row.nomeCompleto.trim(),
    funcao: row.funcao || inferFuncaoImportacaoCoroinha({ nomeCompleto: row.nomeCompleto }),
    telefone: null,
    local: MATRIZ_LOCAL,
    comunidade: MATRIZ_COMUNIDADE,
    observacoes: "Cadastro importado — já serve na Matriz (Nossa Senhora das Graças).",
    status: row.status || "Ativo",
    inicio: null,
    nascimento: null,
    photo: null,
  };
}

export function loadMatrizDraft() {
  try {
    const raw = localStorage.getItem(MATRIZ_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveMatrizDraft(rows) {
  localStorage.setItem(
    MATRIZ_DRAFT_KEY,
    JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), rows })
  );
}

export function clearMatrizDraft() {
  localStorage.removeItem(MATRIZ_DRAFT_KEY);
}
