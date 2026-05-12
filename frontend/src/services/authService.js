const TOKEN_KEY = "altar_editor_token";
const LOCAL_EDITOR_FLAG = "__local_editor__";

function apiBase() {
  return String(import.meta.env.VITE_API_URL || "")
    .trim()
    .replace(/\/$/, "");
}

function localAdminPassword() {
  return String(import.meta.env.VITE_ADMIN_PASSWORD || "").trim();
}

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export async function fetchAuthStatus() {
  const base = apiBase();
  if (!base) {
    return { editorAuthRequired: Boolean(localAdminPassword()), mode: "local" };
  }
  try {
    const res = await fetch(`${base}/api/auth/status`);
    if (!res.ok) return { editorAuthRequired: false, mode: "api" };
    const j = await res.json();
    return { editorAuthRequired: Boolean(j.editorAuthRequired), mode: "api" };
  } catch {
    return { editorAuthRequired: false, mode: "api" };
  }
}

export function getEditorToken() {
  return readToken();
}

function hasApiEditorToken() {
  const t = readToken();
  return Boolean(t && t !== LOCAL_EDITOR_FLAG);
}

function hasLocalEditorSession() {
  return readToken() === LOCAL_EDITOR_FLAG;
}

/**
 * Quando o servidor (ou build local) exige credencial para mutações.
 */
export function canEditNow(editorAuthRequired) {
  if (!editorAuthRequired) return true;
  if (!apiBase()) {
    const lp = localAdminPassword();
    if (!lp) return true;
    return hasLocalEditorSession();
  }
  return hasApiEditorToken();
}

export async function loginEditor(password) {
  const base = apiBase();
  if (!base) {
    const lp = localAdminPassword();
    if (!lp) return;
    if (password !== lp) {
      const err = new Error("Senha incorreta.");
      err.code = "BAD_PASSWORD";
      throw err;
    }
    sessionStorage.setItem(TOKEN_KEY, LOCAL_EDITOR_FLAG);
    return;
  }
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  let j = {};
  try {
    j = await res.json();
  } catch {
    // ignore
  }
  if (res.status === 503 && j.code === "AUTH_NOT_CONFIGURED") {
    return;
  }
  if (!res.ok) {
    const err = new Error(j.error || j.message || "Falha no login");
    err.code = res.status === 401 ? "BAD_PASSWORD" : "LOGIN_FAIL";
    throw err;
  }
  if (!j.token) {
    throw new Error("Resposta inválida do servidor");
  }
  sessionStorage.setItem(TOKEN_KEY, j.token);
}

export function logoutEditor() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function authHeaders() {
  const t = readToken();
  if (!t || t === LOCAL_EDITOR_FLAG) return {};
  return { Authorization: `Bearer ${t}` };
}
