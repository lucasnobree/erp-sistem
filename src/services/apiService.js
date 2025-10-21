import { config } from '../config/environment';

// Configuração base da API
const API_BASE_URL = config.API_URL;

// Classe para gerenciar chamadas da API
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método privado para fazer requisições HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Adicionar token de autorização se disponível
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Se o token expirou, tentar renovar
      if (response.status === 401 && token) {
        try {
          const newToken = await this.refreshToken();
          if (newToken) {
            // Refazer a requisição com o novo token
            config.headers.Authorization = `Bearer ${newToken}`;
            return await fetch(url, config);
          }
        } catch (refreshError) {
          console.error('Erro ao renovar token:', refreshError);
          // Redirecionar para login se não conseguir renovar
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/';
        }
      }

      return response;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // Método para renovar token
  async refreshToken() {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) {
      throw new Error('Refresh token não encontrado');
    }

    const response = await fetch(`${this.baseURL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshTokenValue,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      throw new Error('Erro ao renovar token');
    }
  }

  // ===== AUTENTICAÇÃO =====
  
  async login(credentials) {
    return this.request('/token/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken(token) {
    return fetch(`${this.baseURL}/token/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
  }

  async getCurrentUser(token) {
    return fetch(`${this.baseURL}/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ===== CLIENTES =====
  
  async getClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/clientes/?${queryString}` : '/clientes/';
    return this.request(endpoint);
  }

  async getClient(id) {
    return this.request(`/clientes/${id}/`);
  }

  async createClient(clientData) {
    return this.request('/clientes/', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id, clientData) {
    return this.request(`/clientes/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async partialUpdateClient(id, clientData) {
    return this.request(`/clientes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id) {
    return this.request(`/clientes/${id}/`, {
      method: 'DELETE',
    });
  }

  // ===== KANBAN COLUNAS =====
  
  async getKanbanColumns() {
    return this.request('/kanban/colunas/');
  }

  async getKanbanColumn(id) {
    return this.request(`/kanban/colunas/${id}/`);
  }

  async createKanbanColumn(columnData) {
    return this.request('/kanban/colunas/', {
      method: 'POST',
      body: JSON.stringify(columnData),
    });
  }

  async updateKanbanColumn(id, columnData) {
    return this.request(`/kanban/colunas/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(columnData),
    });
  }

  async partialUpdateKanbanColumn(id, columnData) {
    return this.request(`/kanban/colunas/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(columnData),
    });
  }

  async deleteKanbanColumn(id) {
    return this.request(`/kanban/colunas/${id}/`, {
      method: 'DELETE',
    });
  }

  // ===== KANBAN CARDS =====
  
  async getKanbanCards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/kanban/cards/?${queryString}` : '/kanban/cards/';
    return this.request(endpoint);
  }

  async getKanbanCard(id) {
    return this.request(`/kanban/cards/${id}/`);
  }

  async createKanbanCard(cardData) {
    return this.request('/kanban/cards/', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  async updateKanbanCard(id, cardData) {
    return this.request(`/kanban/cards/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(cardData),
    });
  }

  async partialUpdateKanbanCard(id, cardData) {
    return this.request(`/kanban/cards/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(cardData),
    });
  }

  async deleteKanbanCard(id) {
    return this.request(`/kanban/cards/${id}/`, {
      method: 'DELETE',
    });
  }

  // ===== MÉTODOS UTILITÁRIOS =====
  
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erro HTTP ${response.status}`);
    }
    return response.json();
  }

  async handleError(error) {
    console.error('Erro na API:', error);
    throw error;
  }
}

// Instância única do serviço
export const apiService = new ApiService();
