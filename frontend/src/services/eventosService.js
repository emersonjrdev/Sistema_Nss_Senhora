import { v4 as uuidv4 } from "uuid";
import { readJson, writeJson } from "./localModuleStorage";
import { hasApi, apiRequest } from "./apiRequest";

const KEY = "altar_eventos_v1";

function normItem(d) {
  if (!d) return d;
  return { ...d, id: d.id || String(d._id) };
}

export const eventosService = {
  async list() {
    if (hasApi()) {
      const arr = await apiRequest("/api/eventos");
      return [...(arr || []).map(normItem)].sort((a, b) =>
        String(a.data).localeCompare(String(b.data))
      );
    }
    const list = readJson(KEY, []);
    return [...list].sort((a, b) => String(a.data).localeCompare(String(b.data)));
  },

  async create(payload) {
    const body = {
      titulo: String(payload.titulo || "").trim(),
      data: payload.data || null,
      hora: (payload.hora && String(payload.hora).trim()) || null,
      local: (payload.local && String(payload.local).trim()) || null,
      tipo: payload.tipo || "Missa",
      observacoes: (payload.observacoes && String(payload.observacoes).trim()) || null,
    };
    if (!body.titulo || !body.data) throw new Error("Título e data são obrigatórios");

    if (hasApi()) {
      return normItem(
        await apiRequest("/api/eventos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
    }

    const list = readJson(KEY, []);
    const item = {
      id: uuidv4(),
      ...body,
      createdAt: new Date().toISOString(),
    };
    list.unshift(item);
    writeJson(KEY, list);
    return item;
  },

  async update(id, patch) {
    if (hasApi()) {
      return normItem(
        await apiRequest(`/api/eventos/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        })
      );
    }

    const list = readJson(KEY, []);
    const idx = list.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error("Evento não encontrado");
    list[idx] = { ...list[idx], ...patch, id };
    writeJson(KEY, list);
    return list[idx];
  },

  async remove(id) {
    if (hasApi()) {
      await apiRequest(`/api/eventos/${encodeURIComponent(id)}`, { method: "DELETE" });
      return;
    }
    const list = readJson(KEY, []).filter((x) => x.id !== id);
    writeJson(KEY, list);
  },
};
