import { useState, useEffect } from 'react';
import ProdutoModal from './ProdutoModal';
import { Search, MoreVertical, AlertTriangle } from 'lucide-react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { formatCOP } from '../utils/formatters';
import { useProdutosCache } from '../hooks/useCache';
import { makeAuthenticatedRequest } from '../services/auth';
import RefreshButton, { CacheStatus } from './RefreshButton';

const categorias = [
  'Todas',
  'Eletrônicos',
  'Roupas',
  'Alimentos',
  'Casa',
  'Esportes',
  'Brinquedos',
  'Livros',
  'Animais',
  'Saúde',
  'Beleza'
];

const ProdutosTableContainer = () => {
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [mostrarEstoqueBaixo, setMostrarEstoqueBaixo] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const response = await makeAuthenticatedRequest(`/produtos/${id}/`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Atualizar cache excluindo o produto
          removeItem(id);
          alert('Produto excluído com sucesso');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Erro ao excluir o produto');
        }
      } catch (error) {
        console.error('Error ao excluir:', error);
        alert(error.message);
      }
    }
  };

  const filteredProdutos = (produtos || []).filter(produto => {
    const matchSearch = Object.values(produto).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchCategoria = categoriaSelecionada === 'Todas' || 
                          produto.categoria_nome === categoriaSelecionada;
    const matchPrecoMin = !precoMin || produto.preco >= Number(precoMin);
    const matchPrecoMax = !precoMax || produto.preco <= Number(precoMax);
    const matchEstoqueBaixo = !mostrarEstoqueBaixo || produto.estoque < 50;

    return matchSearch && matchCategoria && matchPrecoMin && matchPrecoMax && matchEstoqueBaixo;
  });

  // Mostrar erro apenas se não houver dados em cache
  if (error && !produtos) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-700">Erro: {error}</div>
        <button 
          onClick={refresh}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const handleModalClose = (produtoAtualizado) => {
    setModalAberto(false);
    setProdutoSelecionado(null);
    
    if (produtoAtualizado) {
      if (produtoSelecionado) {
        // Atualização
        updateItem(produtoAtualizado);
      } else {
        // Novo produto
        addItem(produtoAtualizado);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho com informações do cache e botão de atualizar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lista de Produtos</h2>
          <CacheStatus 
            isFromCache={isFromCache}
            lastFetch={lastFetch}
            cacheInfo={cacheInfo}
            className="mt-1"
          />
        </div>
        <RefreshButton
          onRefresh={refresh}
          loading={loading}
          lastUpdate={lastFetch}
          variant="outline"
          size="sm"
        />
      </div>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <select
          className="border rounded-lg px-4 py-2"
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
        >
          {categorias.map((cat, index) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Preço mínimo"
          className="border rounded-lg px-4 py-2 w-32"
          value={precoMin}
          onChange={(e) => setPrecoMin(e.target.value)}
        />

        <input
          type="number"
          placeholder="Preço máximo"
          className="border rounded-lg px-4 py-2 w-32"
          value={precoMax}
          onChange={(e) => setPrecoMax(e.target.value)}
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={mostrarEstoqueBaixo}
            onChange={(e) => setMostrarEstoqueBaixo(e.target.checked)}
            className="rounded"
          />
          <span>Mostrar baixo estoque</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-48">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProdutos.map((produto) => (
              <tr key={produto.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{produto.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {produto.imagem_url && (
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 max-w-48">
                  <div className="truncate" title={produto.descricao}>{produto.descricao || 'Sem descrição'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {produto.categoria_nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {produto.estoque < 50 && (
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
                    )}
                    <span className="text-sm text-gray-900">{produto.estoque}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCOP(produto.preco)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setProdutoSelecionado(produto);
                        setModalAberto(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setProdutoSelecionado(produto);
                        setModalAberto(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(produto.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProdutoModal
        isOpen={modalAberto}
        onClose={handleModalClose}
        produto={produtoSelecionado}
      />
    </div>
  );
};

const ProdutosTable = ({ produtos, onEdit, onDelete, loading }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedProdutos = [...(produtos || [])].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('nombre')}
            >
              Nome {getSortIndicator('nombre')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('descripcion')}
            >
              Descrição {getSortIndicator('descripcion')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('precio')}
            >
              Preço {getSortIndicator('precio')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('stock')}
            >
              Estoque {getSortIndicator('stock')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Imagem
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('categoria')}
            >
              Categoria {getSortIndicator('categoria')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center">
                Carregando produtos...
              </td>
            </tr>
          ) : sortedProdutos.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center">
                Não possui produtos disponiveis
              </td>
            </tr>
          ) : (
            sortedProdutos.map((produto) => (
              <tr key={produto.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {produto.nome}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {produto.descricao}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCOP(produto.preco)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${produto.estoque < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {produto.estoque}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {produto.imagem_url ? (
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    'Sem imagem'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {produto.categoria_nome || 'Sem categoria'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(produto)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(produto)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(produto.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProdutosTable;
export { ProdutosTableContainer };