import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, User, Package, CreditCard, CheckCircle, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { formatCOP } from '../utils/formatters';

const API_BASE_URL = 'http://localhost:8000/api';

// Função para obter o token de autenticação
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Função para fazer requisições autenticadas
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  console.log('Token obtido:', token ? 'Token presente' : 'Sem token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  
  console.log('Fazendo requisição para:', url);
  console.log('Headers:', headers);

  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  console.log('Resposta recebida:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.log('Corpo da resposta de erro:', errorText);
    throw new Error(`Erro HTTP! status: ${response.status} - ${errorText}`);
  }

  const jsonData = await response.json();
  console.log('JSON parseado:', jsonData);
  return jsonData;
};

const VendasPage = () => {
  const normalizeProduto = (produto) => {
    const preco = parseFloat(produto.preco ?? produto.price ?? 0);
    const estoque = parseInt(produto.estoque ?? produto.stock ?? 0, 10);

    return {
      ...produto,
      preco: isNaN(preco) ? 0 : preco,
      estoque: isNaN(estoque) ? 0 : estoque,
      imagem_url: produto.imagem_url ?? produto.imagen_url ?? null,
      categoria_nome: produto.categoria_nome ?? produto.categoria?.nome ?? ''
    };
  };

  const [carrito, setCarrito] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [cpf_cnpj, setcpf_cnpj] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas');
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processandoVenda, setProcessandoVenda] = useState(false);
  const [quantidadesProdutos, setQuantidadesProdutos] = useState({});
  const carrinhoRef = useRef(null);

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
  }, []);

  const fetchProdutos = async () => {
    try {
      console.log('Tentando carregar produtos de:', `${API_BASE_URL}/produtos/`);
      const data = await fetchWithAuth(`${API_BASE_URL}/produtos/`);
      console.log('Dados recebidos:', data);
      setProdutos(data || []);
      setError(null);
    } catch (error) {
      console.error('Erro detalhado ao buscar produtos:', error);
      setError(`Erro ao carregar produtos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/categorias/`);
      setCategorias(['Todas', ...data.map(cat => cat.nome)]);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const filteredProdutos = produtos.filter(produto => {
    const matchSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaSelecionada === 'Todas' || 
                          (produto.categoria_nome && produto.categoria_nome === categoriaSelecionada);
    const hasStock = produto.estoque >= 1;
    return matchSearch && matchCategoria && hasStock;
  });

  const buscarCliente = async (cpf_cnpjBuscar) => {
    if (!cpf_cnpjBuscar.trim()) {
      setClienteSelecionado(null);
      return;
    }

    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/clientes/${cpf_cnpjBuscar}/`);
      setClienteSelecionado(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      setClienteSelecionado(null);
      setError('Cliente não encontrado');
    }
  };

  const adicionarAoCarrinho = (produtoOriginal, quantidade = 1) => {
    try {
      const produto = normalizeProduto(produtoOriginal);
      const existeNoCarrinho = carrito.find(item => item.id === produto.id);
    
      if (existeNoCarrinho) {
        // Se já existe, verificar que não exceda o estoque
        const novaQuantidade = existeNoCarrinho.cantidad + quantidade;
        if (novaQuantidade > produto.estoque) {
          setError(`Não é possível adicionar mais de ${produto.estoque} unidades de ${produto.nome}. Você já tem ${existeNoCarrinho.cantidad} no carrinho.`);
          return;
        }
        atualizarQuantidade(produto.id, novaQuantidade);
      } else {
        // Se não existe, verificar que a quantidade não exceda o estoque
        if (quantidade > produto.estoque) {
          setError(`Não é possível adicionar ${quantidade} unidades de ${produto.nome}. Apenas ${produto.estoque} disponíveis.`);
          return;
        }
        setCarrito([...carrito, { ...produto, cantidad: quantidade }]);
      }
      // Limpar erro se a operação foi bem-sucedida
      setError(null);

      // Rolagem suave até o carrinho para o usuário ver o item adicionado
      if (carrinhoRef.current) {
        carrinhoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      setError('Erro ao adicionar produto ao carrinho. Tente novamente.');
    }
  };

  const atualizarQuantidade = (id, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(id);
      return;
    }

    // Encontrar o produto no carrinho para verificar o estoque
    const itemNoCarrinho = carrito.find(item => item.id === id);
    if (itemNoCarrinho && novaQuantidade > itemNoCarrinho.estoque) {
      setError(`Não é possível adicionar mais de ${itemNoCarrinho.estoque} unidades de ${itemNoCarrinho.nome}.`);
      return;
    }

    setCarrito(carrito.map(item => {
      if (item.id === id) {
        return { ...item, cantidad: novaQuantidade };
      }
      return item;
    }));
    
    // Limpar erro se a operação foi bem-sucedida
    setError(null);
  };

  const removerDoCarrinho = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    const subtotal = carrito.reduce((total, item) => total + (item.preco * item.cantidad), 0);
    const imposto = subtotal * 0.19; // 19% de imposto (IVA)
    const total = subtotal + imposto;
    return { subtotal, impuesto, total };
  };

  const processarVenda = async () => {
    if (!clienteSelecionado) {
      setError('Por favor, selecione um cliente');
      return;
    }
    if (carrito.length === 0) {
      setError('O carrinho está vazio');
      return;
    }

    setProcessandoVenda(true);
    setError(null);

    try {
      const totais = calcularTotal();
      
      const vendaData = {
        cliente: clienteSelecionado.cedula,
        items: carrito.map(item => ({
          produto: item.id,
          quantidade: item.cantidad,
          preco_unitario: item.preco
        }))
      };

      const response = await fetchWithAuth(`${API_BASE_URL}/vendas/`, {
        method: 'POST',
        body: JSON.stringify(vendaData)
      });

      // Limpar o carrinho e cliente após uma venda bem-sucedida
      setCarrito([]);
      setClienteSelecionado(null);
      setcpf_cnpj('');
      
      alert(`Venda processada com sucesso. ID: ${response.id}`);
      
      // Atualizar a lista de produtos para refletir o novo estoque
      fetchProdutos();
      
    } catch (error) {
      console.error('Erro ao processar venda:', error);
      setError('Erro ao processar a venda: ' + error.message);
    } finally {
      setProcessandoVenda(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center h-64"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <div className="text-lg text-gray-600">Carregando produtos...</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
              Nova Venda
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Gerencie suas vendas de forma rápida e eficiente</p>
        </motion.div>
      
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-4 sm:mb-6 rounded-xl bg-red-50 p-4 border border-red-200 shadow-sm"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                <p className="text-sm sm:text-base text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      
      <div className="space-y-6">
        {/* Sección de Cliente */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-xl">
              <User className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900"  >Cliente</h3>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Digite a cédula do cliente"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm sm:text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white"
                value={cpf_cnpj}
                onChange={(e) => setcpf_cnpj(e.target.value)}
                onBlur={() => buscarCliente(cpf_cnpj)}
              />
            </div>
            
            <AnimatePresence>
              {clienteSelecionado && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-semibold text-blue-900">{clienteSelecionado.nome}</p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">{clienteSelecionado.email}</p>
                      <p className="text-xs text-blue-600 mt-1">Cédula: {clienteSelecionado.cedula}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sección de Produtos */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Produtos</h3>
            <div className="ml-auto bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-gray-600">{filteredProdutos.length} disponíveis</span>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Lista de Produtos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {filteredProdutos.map((produto, index) => (
                <motion.div 
                  key={produto.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 hover:shadow-xl transition-all duration-300 flex flex-col h-full group overflow-hidden relative"
                >
                  {/* Badge de estoque baixo */}
                  {produto.estoque <= 5 && produto.estoque > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Últimos!
                      </div>
                    </div>
                  )}
                  
                  {/* Imagem do produto */}
                  <div className="relative w-full h-40 sm:h-48 mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                    {produto.imagem_url ? (
                      <motion.img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center text-gray-400"
                      style={{ display: produto.imagem_url ? 'none' : 'flex' }}
                    >
                      <Package className="w-12 h-12" />
                    </div>
                    
                    {/* Overlay con gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Informação do produto */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 transition-colors">
                        {produto.nome}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                        {produto.descricao}
                      </p>
                    </div>
                    
                    {/* Informação adicional */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          produto.estoque > 10 ? 'bg-green-500' : 
                          produto.estoque > 5 ? 'bg-yellow-500' : 
                          produto.estoque > 0 ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                        <span className="text-gray-600 font-medium">{produto.estoque} disponíveis</span>
                      </div>
                      {produto.categoria_nome && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {produto.categoria_nome}
                        </span>
                      )}
                    </div>
                    
                    {/* Preço */}
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatCOP(produto.preco)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Controles de quantidade e adicionar */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded-xl p-1">
                        <button
                          onClick={() => {
                            const currentQty = quantidadesProdutos[produto.id] || 1;
                            if (currentQty > 1) {
                              setQuantidadesProdutos({
                                ...quantidadesProdutos,
                                [produto.id]: currentQty - 1
                              });
                            }
                          }}
                          className="p-1 hover:bg-white rounded-lg transition-colors"
                          disabled={produto.estoque <= 0 || (quantidadesProdutos[produto.id] || 1) <= 1}
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={produto.estoque}
                          value={quantidadesProdutos[produto.id] || 1}
                          onChange={(e) => setQuantidadesProdutos({
                            ...quantidadesProdutos,
                            [produto.id]: Math.max(1, Math.min(produto.estoque, parseInt(e.target.value) || 1))
                          })}
                          className="w-12 text-center text-sm bg-transparent border-none focus:outline-none font-medium"
                          disabled={produto.estoque <= 0}
                        />
                        <button
                          onClick={() => {
                            const currentQty = quantidadesProdutos[produto.id] || 1;
                            if (currentQty < produto.estoque) {
                              setQuantidadesProdutos({
                                ...quantidadesProdutos,
                                [produto.id]: currentQty + 1
                              });
                            }
                          }}
                          className="p-1 hover:bg-white rounded-lg transition-colors"
                          disabled={produto.estoque <= 0 || (quantidadesProdutos[produto.id] || 1) >= produto.estoque}
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const quantidade = quantidadesProdutos[produto.id] || 1;
                          adicionarAoCarrinho(produto, quantidade);
                          setQuantidadesProdutos({
                            ...quantidadesProdutos,
                            [produto.id]: 1
                          });
                        }}
                        disabled={produto.estoque <= 0}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                          produto.estoque <= 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-600 focus:ring-blue-500 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {produto.estoque <= 0 ? (
                          <span className="flex items-center justify-center gap-2">
                            <X className="h-4 w-4" />
                            Sem estoque
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Adicionar
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Estado vacío */}
          {filteredProdutos.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros de busca</p>
            </motion.div>
          )}
        </motion.div>
        </div>

        {/* Carrito */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6"
          ref={carrinhoRef}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-xl">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Carrinho de Compras</h3>
            {carrito.length > 0 && (
              <div className="ml-auto bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-orange-600">{carrito.length} produtos</span>
              </div>
            )}
          </div>
          
          {carrito.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border-2 border-dashed border-gray-300 p-8 sm:p-12 text-center bg-gray-50"
            >
              <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">O carrinho está vazio</h4>
              <p className="text-sm text-gray-600">Adicione produtos para começar uma venda</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Lista de produtos no carrinho */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {carrito.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Informação do produto */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.nome}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                            <p className="text-sm text-gray-600">{formatCOP(item.preco)} c/u</p>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${
                                item.estoque > 10 ? 'bg-green-500' : 
                                item.estoque > 5 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`} />
                              <span className="text-xs text-gray-500">{item.estoque} disponíveis</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Controles de quantidade */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => atualizarQuantidade(item.id, item.cantidad - 1)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </motion.button>
                            <input
                              type="number"
                              min="1"
                              max={item.estoque}
                              value={item.cantidad}
                              onChange={(e) => atualizarQuantidade(item.id, parseInt(e.target.value) || 1)}
                              className="w-12 text-center text-sm bg-transparent border-none focus:outline-none font-medium"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => atualizarQuantidade(item.id, item.cantidad + 1)}
                              disabled={item.cantidad >= item.estoque}
                              className={`p-2 rounded-lg transition-colors ${
                                item.cantidad >= item.estoque
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                            >
                              <Plus className="h-4 w-4" />
                            </motion.button>
                          </div>
                          
                          {/* Preço total do item */}
                          <div className="text-right min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base">
                              {formatCOP(parseFloat(item.preco) * item.cantidad)}
                            </p>
                          </div>
                          
                          {/* Botão remover */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removerDoCarrinho(item.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Totais */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCOP(calcularTotal().subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Imposto (19%):</span>
                    <span className="font-medium">{formatCOP(calcularTotal().impuesto)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg sm:text-xl font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatCOP(calcularTotal().total)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Botão processar venda */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={processarVenda}
                disabled={processandoVenda || !clienteSelecionado}
                className={`w-full rounded-xl px-6 py-4 font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  processandoVenda || !clienteSelecionado
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 focus:ring-green-500 shadow-lg hover:shadow-xl'
                }`}
              >
                {processandoVenda ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processando venda...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    Processar Venda
                  </span>
                )}
              </motion.button>
              
              {!clienteSelecionado && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-700">Selecione um cliente para processar a venda</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

      </div>
          </div>
          
  )
}

export default VendasPage;