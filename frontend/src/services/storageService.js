import { v4 as uuidv4 } from "uuid";
import { hasApi, apiRequest } from "./apiRequest";
import { calendarYearMonth } from "../utils/dateOnly";
import { verifyServidorIdentity } from "../utils/servidorSelfVerify";

const STORAGE_KEY = "usuarios_altar";

function userIndexById(users, id) {
  const sid = String(id);
  return users.findIndex((x) => String(x._id || x.id) === sid);
}

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

  /**
   * @param {string} id
   * @param {object} u
   * @param {{ selfEdit?: boolean, telefoneUltimos4?: string, verificacaoNascimento?: string }} [opts]
   */
  async updateUser(id, u, opts = {}) {
    const sid = String(id);
    const hasPhoneCode =
      opts?.telefoneUltimos4 != null &&
      String(opts.telefoneUltimos4).replace(/\D/g, "").length >= 4;
    const hasBirth = opts?.verificacaoNascimento != null && String(opts.verificacaoNascimento).trim() !== "";
    const selfPayload = Boolean(opts?.selfEdit && (hasPhoneCode || hasBirth));

    if (hasApi()) {
      if (selfPayload) {
        return await apiRequest(`/api/user/self-service/${encodeURIComponent(sid)}`, {
          method: "PUT",
          skipAuth: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...u,
            telefoneUltimos4: opts.telefoneUltimos4,
            verificacaoNascimento: opts.verificacaoNascimento,
          }),
        });
      }
      return await apiRequest(`/api/user/${encodeURIComponent(sid)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u),
      });
    }
    const users = await this.loadUsers();
    const idx = userIndexById(users, sid);
    if (idx === -1) throw new Error("Usuário não encontrado");
    if (opts?.selfEdit) {
      if (
        !verifyServidorIdentity(users[idx], {
          telefoneUltimos4: opts.telefoneUltimos4,
          verificacaoNascimento: opts.verificacaoNascimento,
        })
      ) {
        throw new Error("Telefone ou data de nascimento não conferem com o cadastro.");
      }
      const base = users[idx];
      const { name: _dropName, _id, id: _id2, ...rest } = u;
      users[idx] = { ...base, ...rest, name: base.name };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      return users[idx];
    }
    users[idx] = { ...users[idx], ...u };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return users[idx];
  },

  /** Confirma últimos 4 dígitos do telefone ou data de nascimento (sem token de editor). */
  async verifySelfUnlock(id, verification) {
    const sid = String(id);
    if (hasApi()) {
      await apiRequest(`/api/user/self-verify/${encodeURIComponent(sid)}`, {
        method: "POST",
        skipAuth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verification),
      });
      return true;
    }
    const users = await this.loadUsers();
    const idx = userIndexById(users, sid);
    if (idx === -1) throw new Error("Cadastro não encontrado.");
    if (!verifyServidorIdentity(users[idx], verification)) {
      throw new Error("Telefone ou data de nascimento não conferem com o cadastro.");
    }
    return true;
  },

  // Deletar usuário
  async deleteUser(id) {
    if (hasApi()) {
      return await apiRequest(`/api/user/${encodeURIComponent(sid)}`, { method: "DELETE" });
    } else {
      const users = await this.loadUsers();
      const sid = String(id);
      const filtered = users.filter((u) => String(u._id || u.id) !== sid);
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
