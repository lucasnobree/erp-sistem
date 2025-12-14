import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeAuthenticatedRequest } from '../services/auth';
import { Plus, LayoutGrid, Calendar, Users, ChevronRight } from 'lucide-react';

const KanbanList = () => {
  const [kanbans, setKanbans] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cliente: '',
    ativo: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchKanbans();
    fetchClientes();
  }, []);

  const fetchKanbans = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/kanbans/');
      if (response.ok) {
        const data = await response.json();
        setKanbans(data);
      } else {
        setError('Erro ao carregar quadros Kanban');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await makeAuthenticatedRequest('/clientes/');
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (err) {
      console.error('Error fetching clientes:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload with cliente as integer
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        cliente: parseInt(formData.cliente),
        ativo: formData.ativo
      };

      const response = await makeAuthenticatedRequest('/kanbans/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newKanban = await response.json();
        setKanbans([newKanban, ...kanbans]);
        setShowCreateModal(false);
        setFormData({ nome: '', descricao: '', cliente: '', ativo: true });
        // Navigate to the new kanban
        navigate(`/atividades/kanban/${newKanban.id}`);
      } else {
        const errorData = await response.json();
        alert(JSON.stringify(errorData) || 'Erro ao criar quadro');
      }
    } catch (err) {
      alert('Erro de conexão: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este quadro Kanban?')) {
      try {
        const response = await makeAuthenticatedRequest(`/kanbans/${id}/`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setKanbans(kanbans.filter(k => k.id !== id));
        } else {
          alert('Erro ao excluir quadro');
        }
      } catch (err) {
        alert('Erro de conexão');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-gray-600">Carregando quadros Kanban...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quadros Kanban</h2>
          <p className="text-sm text-gray-600 mt-1">Gerencie seus projetos e atividades</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Quadro
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Novo Quadro Kanban</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Ex: Projeto de Desenvolvimento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Descrição do quadro..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
                    Quadro ativo
                  </label>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Criar Quadro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Kanban List */}
      {kanbans.length === 0 ? (
        <div className="text-center py-12">
          <LayoutGrid className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum quadro Kanban</h3>
          <p className="text-gray-600 mb-4">Crie seu primeiro quadro para começar a organizar suas atividades</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Quadro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kanbans.map((kanban) => (
            <div
              key={kanban.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{kanban.nome}</h3>
                  {!kanban.ativo && (
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                      Inativo
                    </span>
                  )}
                </div>

                {kanban.descricao && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{kanban.descricao}</p>
                )}

                {kanban.cliente_nome && (
                  <div className="mb-3 px-3 py-2 bg-blue-50 rounded-md border border-blue-100">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{kanban.cliente_nome}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <LayoutGrid className="w-4 h-4" />
                    <span>{kanban.total_colunas} colunas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{kanban.total_cards} cards</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Criado por {kanban.criado_por_nome}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/atividades/kanban/${kanban.id}`)}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Abrir
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(kanban.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KanbanList;
