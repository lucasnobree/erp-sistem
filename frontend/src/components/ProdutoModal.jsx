import { useState, useEffect } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { makeAuthenticatedRequest } from '../services/auth';
import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dpsqlyeox'
  }
});

const ProdutoModal = ({ isOpen, onClose, produto = null, readOnly = false }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    cliente: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);

  useEffect(() => {
    fetchCategorias();
    fetchClientes();
    if (produto) {
      setFormData({
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        preco: produto.preco?.toString() || '',
        estoque: produto.estoque?.toString() || '',
        imagem_url: produto.imagem_url || '',
        categoria_id: produto.categoria_id?.toString() || produto.categoria?.toString() || '',
        cliente: (produto.cliente ?? produto.cliente_id ?? produto.cliente_cedula)?.toString() || ''
      });
    } else {
      // Reset form when no produto is provided
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        imagem_url: '',
        categoria_id: '',
        cliente: ''
      });
    }
  }, [produto]);

  const fetchCategorias = async () => {
    try {
      const response = await makeAuthenticatedRequest('/categorias/');

      if (!response.ok) {
        throw new Error('Erro ao carregar categorias');
      }

      const data = await response.json();
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError('Erro ao carregar as categorias');
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await makeAuthenticatedRequest('/clientes/');

      if (!response.ok) {
        throw new Error('Erro ao carregar clientes');
      }

      const data = await response.json();
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar os clientes');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar o tipo e tamanho do arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('O arquivo deve ser uma imagem (JPEG, PNG, GIF ou WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('A imagem não pode ultrapassar 10MB');
      return;
    }

    try {
      setUploadingImage(true);
      const timestamp = Date.now();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'produtos_preset');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dpsqlyeox/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro do Cloudinary:', errorData);
        throw new Error(errorData.error?.message || 'Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      console.log('Resposta do Cloudinary:', data);

      if (data.secure_url) {
        setFormData(prev => ({ ...prev, imagem_url: data.secure_url }));
      } else {
        throw new Error('Não foi possível obter a URL da imagem');
      }
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setError('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCriarCategoria = async () => {
    if (!novaCategoria.trim()) {
      setError('O nome da categoria não pode estar vazio');
      return;
    }

    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/categorias/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novaCategoria.trim() })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar categoria');
      }

      const data = await response.json();

      if (data) {
        setCategorias(prev => [...prev, data]);
        setFormData(prev => ({ ...prev, categoria_id: data.id }));
        setNovaCategoria('');
        setMostrarNovaCategoria(false);
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      setError('Erro ao criar a categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const produtoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque),
        imagem_url: formData.imagem_url || '',
        categoria: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        cliente: formData.cliente || null
      };

      let result;
      if (produto) {
        // Atualizar produto existente
        const response = await makeAuthenticatedRequest(`/produtos/${produto.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(produtoData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao atualizar produto');
        }

        result = await response.json();
      } else {
        // Criar novo produto
        const response = await makeAuthenticatedRequest('/produtos/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(produtoData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao criar produto');
        }

        result = await response.json();
      }

      // Passar o produto atualizado/criado para o componente pai
      onClose(result);
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        imagem_url: '',
        categoria_id: '',
        cliente: ''
      });
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setError(error.message || 'Erro ao salvar o produto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md text-gray-900 shadow-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {readOnly ? 'Detalhes do Produto' : (produto ? 'Editar Produto' : 'Novo Produto')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              required={!readOnly}
              readOnly={readOnly}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 ${readOnly ? 'bg-gray-50' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
              value={formData.nome}
              onChange={(e) => !readOnly && setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              readOnly={readOnly}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 ${readOnly ? 'bg-gray-50' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
              rows="3"
              value={formData.descricao}
              onChange={(e) => !readOnly && setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Preço</label>
              <input
                type="number"
                step="0.01"
                required={!readOnly}
                readOnly={readOnly}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 ${readOnly ? 'bg-gray-50' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
                value={formData.preco}
                onChange={(e) => !readOnly && setFormData({ ...formData, preco: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estoque</label>
              <input
                type="number"
                required={!readOnly}
                readOnly={readOnly}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 ${readOnly ? 'bg-gray-50' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
                value={formData.estoque}
                onChange={(e) => !readOnly && setFormData({ ...formData, estoque: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Imagem</label>
            <div className="mt-1 flex items-center space-x-4">
              {formData.imagem_url && (
                <img
                  src={formData.imagem_url}
                  alt="Vista previa"
                  className="h-20 w-20 object-cover rounded-lg"
                />
              )}
              {!readOnly && (
                <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="h-5 w-5 mr-2" />
                  {uploadingImage ? 'Enviando...' : 'Enviar imagem'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select
              disabled={readOnly}
              required={!readOnly}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 ${readOnly ? 'bg-gray-50' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
              value={formData.cliente}
              onChange={(e) => !readOnly && setFormData({ ...formData, cliente: e.target.value })}
            >
              <option value="">Selecionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.cedula} value={cliente.cedula}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setMostrarNovaCategoria(!mostrarNovaCategoria)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nova categoria
                </button>
              )}
            </div>
            {mostrarNovaCategoria ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Nome da categoria"
                />
                <button
                  type="button"
                  onClick={handleCriarCategoria}
                  disabled={loading}
                  className="mt-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Criar
                </button>
              </div>
            ) : (
              <select
                disabled={readOnly}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 ${readOnly ? 'bg-gray-50' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
                value={formData.categoria_id}
                onChange={(e) => !readOnly && setFormData({ ...formData, categoria_id: e.target.value })}
              >
                <option value="">Selecionar categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : produto ? 'Atualizar' : 'Criar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProdutoModal;