import { v4 as uuidv4 } from "uuid";
import { hasApi, apiRequest } from "./apiRequest";
import { calendarYearMonth } from "../utils/dateOnly";

const STORAGE_KEY = "usuarios_altar";

export const storageService = {
  // Salvar todos (fallback localStorage)
  async saveUsers(users) {
    if (hasApi()) {
      return users;
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  },

  // Carregar todos os usuários
  async loadUsers() {
    if (hasApi()) {
      try {
        return await apiRequest("/api/user");
      } catch (err) {
        console.warn("API indisponível, usando localStorage:", err.message);
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      }
    } else {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  // Criar usuário
  async createUser(u) {
    if (hasApi()) {
      return await apiRequest("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...u,
          createdAt: u.createdAt || new Date().toISOString(),
          status: u.status || "Ativo",
        }),
      });
    } else {
      const users = await this.loadUsers();
      const id = uuidv4();
      const newU = {
        id,
        createdAt: u.createdAt || new Date().toISOString(),
        status: u.status || "Ativo",
        ...u,
      };
      users.unshift(newU);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      return newU;
    }
  },

  // Atualizar usuário
  async updateUser(id, u) {
    if (hasApi()) {
      return await apiRequest(`/api/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });
    } else {
      const users = await this.loadUsers();
      const idx = users.findIndex((x) => x.id === id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...u };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return users[idx];
      }
      throw new Error("Usuário não encontrado");
    }
  },

  // Deletar usuário
  async deleteUser(id) {
    if (hasApi()) {
      return await apiRequest(`/api/user/${id}`, { method: "DELETE" });
    } else {
      const users = await this.loadUsers();
      const filtered = users.filter((u) => u.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return { message: "deleted" };
    }
  },

  // Buscar usuários (nome, funcao, local, status e periodo)
  async searchUsers(filters = {}) {
    const users = await this.loadUsers();
    let result = users;

    if (filters.name) {
      result = result.filter((u) =>
        (u.name || "").toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.funcao) {
      result = result.filter((u) =>
        (u.funcao || "").toLowerCase().includes(filters.funcao.toLowerCase())
      );
    }

    if (filters.local) {
      result = result.filter((u) =>
        `${u.local || ""} ${u.comunidade || ""}`
          .toLowerCase()
          .includes(filters.local.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(
        (u) => (u.status || "Ativo").toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.period) {
      result = result.filter((u) => {
        if (!u.inicio) return false;
        return calendarYearMonth(u.inicio) === filters.period;
      });
    }

    return result;
  },
};
