import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'servidores_altar';

export const storageService = {
  // Salvar todos os servidores
  saveServers(servers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
  },

  // Carregar todos os servidores
  loadServers() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Adicionar/atualizar servidor
  saveServer(server) {
    const servers = this.loadServers();
    
    if (server.id) {
      // Atualizar existente
      const index = servers.findIndex(s => s.id === server.id);
      if (index !== -1) {
        servers[index] = { ...servers[index], ...server, updatedAt: new Date().toISOString() };
      }
    } else {
      // Adicionar novo
      servers.push({
        ...server,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    this.saveServers(servers);
    return server;
  },

  // Remover servidor
  deleteServer(id) {
    const servers = this.loadServers();
    const filtered = servers.filter(s => s.id !== id);
    this.saveServers(filtered);
    return true;
  },

  // Buscar servidores com filtro
  searchServers(filters = {}) {
    let servers = this.loadServers();
    
    if (filters.nome) {
      servers = servers.filter(s => 
        s.nome.toLowerCase().includes(filters.nome.toLowerCase())
      );
    }
    
    if (filters.funcao) {
      servers = servers.filter(s => 
        s.funcao.toLowerCase().includes(filters.funcao.toLowerCase())
      );
    }
    
    return servers.sort((a, b) => a.nome.localeCompare(b.nome));
  }
};