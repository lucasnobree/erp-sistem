import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../supabase';
import ProdutosTable from './ProdutosTable';
import ProdutoModal from './ProdutoModal';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);


  useEffect(() => {
    fetchProdutos();
  }, []);



  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categoria:categorias(id, nome)
        `)
        .order('nome');

      if (error) throw error;

      setProdutos(data || []);
    } catch (error) {
      console.error('Error fetching produtos:', error);
      setError('Erro ao carregar os produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (produto) => {
    setSelectedProduto(produto);
    setIsModalOpen(true);
  };

  const handleDelete = async (produto) => {
    if (!window.confirm(`Tem certeza que deseja excluir este produto: "${produto.nome}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', produto.id);

      if (error) throw error;

      setProdutos(produtos.filter(p => p.id !== produto.id));
    } catch (error) {
      console.error('Error deleting produto:', error);
      setError('Erro ao excluir o produto');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduto(null);
    fetchProdutos(); // Recargar a lista de produtos depois de fechar o modal
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-5 w-5" />
          Novo Produto
        </button>
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
      />

      <ProdutoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        produto={selectedProduto}
      />
    </div>
  );
};

export default Produtos;