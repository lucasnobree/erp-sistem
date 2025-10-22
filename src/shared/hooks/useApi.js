import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

// Hook genérico para requisições GET
export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.request(endpoint, options);
      const result = await response.json();
      
      if (response.ok) {
        const payload = Array.isArray(result) ? result : (Array.isArray(result?.results) ? result.results : result);
        setData(payload);
      } else {
        setError(result.detail || 'Erro ao carregar dados');
      }
    } catch (err) {
      setError(err.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Hook para operações CRUD
export function useCrud(resource, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.request(`/${resource}/`, { 
        ...options,
        params 
      });
      const result = await response.json();
      
      if (response.ok) {
        const payload = Array.isArray(result) ? result : (Array.isArray(result?.results) ? result.results : [result]);
        setData(payload);
      } else {
        setError(result.detail || 'Erro ao carregar dados');
      }
    } catch (err) {
      setError(err.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [resource, JSON.stringify(options)]);

  const create = useCallback(async (itemData) => {
    setOperationLoading(true);
    setError(null);

    try {
      const response = await apiService.request(`/${resource}/`, {
        method: 'POST',
        body: JSON.stringify(itemData),
        ...options
      });
      const result = await response.json();
      
      if (response.ok) {
        setData(prev => [...prev, result]);
        return { success: true, data: result };
      } else {
        const errorMessage = result.detail || 'Erro ao criar item';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro de conexão';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading(false);
    }
  }, [resource, JSON.stringify(options)]);

  const update = useCallback(async (id, itemData) => {
    setOperationLoading(true);
    setError(null);

    try {
      const response = await apiService.request(`/${resource}/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
        ...options
      });
      const result = await response.json();
      
      if (response.ok) {
        setData(prev => prev.map(item => item.id === id ? result : item));
        return { success: true, data: result };
      } else {
        const errorMessage = result.detail || 'Erro ao atualizar item';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro de conexão';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading(false);
    }
  }, [resource, JSON.stringify(options)]);

  const partialUpdate = useCallback(async (id, itemData) => {
    setOperationLoading(true);
    setError(null);

    try {
      const response = await apiService.request(`/${resource}/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(itemData),
        ...options
      });
      const result = await response.json();
      
      if (response.ok) {
        setData(prev => prev.map(item => item.id === id ? result : item));
        return { success: true, data: result };
      } else {
        const errorMessage = result.detail || 'Erro ao atualizar item';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro de conexão';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading(false);
    }
  }, [resource, JSON.stringify(options)]);

  const remove = useCallback(async (id) => {
    setOperationLoading(true);
    setError(null);

    try {
      const response = await apiService.request(`/${resource}/${id}/`, {
        method: 'DELETE',
        ...options
      });
      
      if (response.ok) {
        setData(prev => prev.filter(item => item.id !== id));
        return { success: true };
      } else {
        const errorMessage = 'Erro ao excluir item';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro de conexão';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setOperationLoading(false);
    }
  }, [resource, JSON.stringify(options)]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    operationLoading,
    create,
    update,
    partialUpdate,
    remove,
    refetch,
    fetchData
  };
}

// Hook específico para clientes
export function useClients() {
  return useCrud('clientes');
}

// Hook específico para colunas do Kanban
export function useKanbanColumns() {
  return useCrud('kanban/colunas');
}

// Hook específico para cards do Kanban
export function useKanbanCards() {
  return useCrud('kanban/cards');
}
