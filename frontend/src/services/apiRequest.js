const API_BASE = import.meta.env.VITE_API_URL || "";

export function hasApi() {
  return Boolean(API_BASE);
}

export async function apiRequest(path = "", options = {}) {
  if (!API_BASE) throw new Error("NO_API");

  const url = API_BASE.replace(/\/$/, "") + path;
  const res = await fetch(url, options);

  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.json();
      msg = j.error || j.message || JSON.stringify(j);
    } catch {
      msg = await res.text();
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) return res.json();
  return res.text();
}
