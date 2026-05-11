import { v4 as uuidv4 } from "uuid";
import { readJson, writeJson } from "./localModuleStorage";
import { hasApi, apiRequest } from "./apiRequest";

const KEY = "altar_historico_v1";

export const historicoService = {
  getAll() {
    return readJson(KEY, {});
  },

  async listByServidor(servidorId) {
    if (hasApi()) {
      const arr =
        (await apiRequest(
          `/api/historico?servidorId=${encodeURIComponent(servidorId)}`
        )) || [];
      return [...arr].sort((a, b) => String(b.data).localeCompare(String(a.data)));
    }
    const all = readJson(KEY, {});
    const list = all[servidorId] || [];
    return [...list].sort((a, b) => String(b.data).localeCompare(String(a.data)));
  },

  async add(servidorId, texto, dataIso) {
    if (!servidorId) throw new Error("Servidor inválido");
    const t = String(texto || "").trim();
    if (!t) throw new Error("Texto obrigatório");
    const data = dataIso || new Date().toISOString().split("T")[0];

    if (hasApi()) {
      return await apiRequest("/api/historico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servidorId, data, texto: t }),
      });
    }

    const all = readJson(KEY, {});
    const row = {
      id: uuidv4(),
      data,
      texto: t,
      createdAt: new Date().toISOString(),
    };
    if (!all[servidorId]) all[servidorId] = [];
    all[servidorId].unshift(row);
    writeJson(KEY, all);
    return row;
  },

  async remove(servidorId, entryId) {
    if (hasApi()) {
      await apiRequest(`/api/historico/${encodeURIComponent(entryId)}`, {
        method: "DELETE",
      });
      return;
    }
    const all = readJson(KEY, {});
    if (!all[servidorId]) return;
    all[servidorId] = all[servidorId].filter((x) => x.id !== entryId);
    writeJson(KEY, all);
  },
};
