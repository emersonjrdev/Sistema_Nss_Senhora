import { readJson, writeJson } from "./localModuleStorage";
import { hasApi, apiRequest } from "./apiRequest";

const KEY = "altar_presenca_v1";

export const presencaService = {
  /** Mapa: eventoId -> { [servidorId]: status } (apenas local) */
  getMap() {
    return readJson(KEY, {});
  },

  async getForEvento(eventoId) {
    if (hasApi()) {
      return (await apiRequest(`/api/presenca/evento/${encodeURIComponent(eventoId)}`)) || {};
    }
    const map = readJson(KEY, {});
    return map[eventoId] || {};
  },

  async setStatus(eventoId, servidorId, status) {
    if (hasApi()) {
      await apiRequest(`/api/presenca/evento/${encodeURIComponent(eventoId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servidorId, status: status || "" }),
      });
      return;
    }
    const map = readJson(KEY, {});
    if (!map[eventoId]) map[eventoId] = {};
    if (!status) {
      delete map[eventoId][servidorId];
    } else {
      map[eventoId][servidorId] = status;
    }
    writeJson(KEY, map);
  },

  clearEvento(eventoId) {
    const map = readJson(KEY, {});
    delete map[eventoId];
    writeJson(KEY, map);
  },
};
