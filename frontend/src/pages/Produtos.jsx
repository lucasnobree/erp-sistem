import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ProdutoModal from '../components/ProdutoModal';
import ProdutosTable from '../components/ProdutosTable';
import { supabase } from '../supabase';
import { makeAuthenticatedRequest } from '../services/auth';
import { useProdutosCache } from '../hooks/useCache';
import RefreshButton from '../components/RefreshButton';
import { CacheStatus } from '../components/RefreshButton';

const Produtos = () => {
  const {
    data: produtos,
    loading,
    error,
    refresh,
    updateItem,
    removeItem,
    addItem,
    isFromCache,
    lastFetch,
    cacheInfo
  } = useProdutosCache();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await makeAuthenticatedRequest('/usuarios/perfil/', { method: 'GET' });
      const userData = await response.json();
      setUserRole(userData.rol);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  // A função fetchProdutos não é mais necessária, ela é tratada pelo hook useProdutosCache

  const handleEdit = (produto) => {
    setSelectedProduto(produto);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const response = await makeAuthenticatedRequest(`/produtos/${id}/`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Actualizar caché eliminando el produto
          removeItem(id);
          alert('Produto excluído com sucesso');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Erro ao excluir o produto');
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert(error.message);
      }
    }
  };

  const handleModalClose = (produtoActualizado) => {
    setIsModalOpen(false);
    setSelectedProduto(null);
    
    if (produtoActualizado) {
      if (selectedProduto) {
        // Actualização
        updateItem(produtoActualizado);
      } else {
        // Novo produto
        addItem(produtoActualizado);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <div className="flex space-x-3">
            <RefreshButton 
              onClick={refresh} 
              isFromCache={isFromCache} 
              lastFetch={lastFetch}
              cacheInfo={cacheInfo}
            />
            {userRole === 'Administrador' && (
              <button
                onClick={() => {
                  setSelectedProduto(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Novo Produto</span>
                <span className="sm:hidden">Novo</span>
              </button>
            )}
          </div>
        </div>
        <CacheStatus 
          isFromCache={isFromCache}
          lastFetch={lastFetch}
          cacheInfo={cacheInfo}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <ProdutosTable
        produtos={produtos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        userRole={userRole}
      />

      <ProdutoModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        produto={selectedProduto}
        readOnly={userRole === 'Usuario'}
      />
    </div>
  );
};

export default Produtos;