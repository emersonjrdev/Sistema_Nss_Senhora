import { authHeaders } from "./authService";
import { emitEditorAuthRequired } from "./authEvents";

const API_BASE = import.meta.env.VITE_API_URL || "";

export function hasApi() {
  return Boolean(API_BASE);
}

export async function apiRequest(path = "", options = {}) {
  if (!API_BASE) throw new Error("NO_API");

  const url = API_BASE.replace(/\/$/, "") + path;
  const mergedHeaders = { ...authHeaders(), ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers: mergedHeaders });

  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.json();
      msg = j.error || j.message || JSON.stringify(j);
    } catch {
      msg = await res.text();
    }
    const combined = `${msg} ${res.status}`;
    if (
      res.status === 401 &&
      /autentica|sess[aã]o|token|editor|login|inv[aá]lid/i.test(combined)
    ) {
      emitEditorAuthRequired();
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) return res.json();
  return res.text();
}
