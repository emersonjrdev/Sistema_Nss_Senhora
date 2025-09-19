import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'servidores_altar';
const API_BASE = import.meta.env.VITE_API_URL || '';

async function apiRequest(path='', options={}) {
  if (!API_BASE) throw new Error('NO_API');
  const res = await fetch(API_BASE.replace(/\/$/,'') + path, options);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'API error');
  }
  return res.json();
}

export const storageService = {
  // Salvar todos os servidores (fallback localStorage)
  async saveServers(servers) {
    if (API_BASE) {
      // send all to server: replace by deleting all and re-creating could be heavy.
      // we'll just return servers (client should call create/update/delete individually).
      return servers;
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
    }
  },

  // Carregar todos os servidores
  async loadServers() {
    if (API_BASE) {
      try {
        return await apiRequest('/api/servidores');
      } catch (err) {
        console.warn('API unavailable, falling back to localStorage:', err.message);
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      }
    } else {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async createServer(s) {
    if (API_BASE) {
      return await apiRequest('/api/servidores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
    } else {
      const servers = this.loadServers();
      const id = uuidv4();
      const newS = { id, ...s };
      const list = await Promise.resolve(servers).then(arr => { arr.unshift(newS); localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); return arr; });
      return newS;
    }
  },

  async updateServer(id, s) {
    if (API_BASE) {
      return await apiRequest(`/api/servidores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
    } else {
      const servers = await this.loadServers();
      const idx = servers.findIndex(x => x.id === id);
      if (idx !== -1) {
        servers[idx] = { ...servers[idx], ...s };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
        return servers[idx];
      }
      throw new Error('Not found');
    }
  },

  async deleteServer(id) {
    if (API_BASE) {
      return await apiRequest(`/api/servidores/${id}`, { method: 'DELETE' });
    } else {
      const servers = await this.loadServers();
      const filtered = servers.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return { message: 'deleted' };
    }
  },

  // Search (client-side filtering)
  async searchServers(filters = {}) {
    const servers = await this.loadServers();
    let result = servers;
    if (filters.nome) {
      result = result.filter(s => (s.nome || '').toLowerCase().includes(filters.nome.toLowerCase()));
    }
    if (filters.funcao) {
      result = result.filter(s => (s.funcao || '').toLowerCase().includes(filters.funcao.toLowerCase()));
    }
    return result;
  }
};
