import React, { useState } from 'react';
import { makeAuthenticatedRequest } from '../services/auth';
import { useClientesCache } from '../hooks/useCache';
import ClienteForm from './ClienteForm';
import RefreshButton, { CacheStatus } from './RefreshButton';
import { Eye, PencilLine, Trash2 } from 'lucide-react';

const ClienteList = () => {
  const {
    data: clientes,
    loading: isLoading,
    error,
    refresh,
    addItem,
    updateItem,
    removeItem,
    isFromCache,
    lastFetch,
    cacheInfo
  } = useClientesCache();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [viewingCliente, setViewingCliente] = useState(null);

  const handleDelete = async (cpf_cnpj) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const response = await makeAuthenticatedRequest(`/clientes/${cpf_cnpj}/`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Atualizar cache removendo o cliente
          removeItem(cpf_cnpj, 'cpf_cnpj');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Erro ao excluir o cliente');
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert(error.message);
      }
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setViewingCliente(null);
    setShowForm(true);
  };

  const handleView = (cliente) => {
    setViewingCliente(cliente);
    setEditingCliente(null);
    setShowForm(false);
  };

  const handleClienteAdded = (newCliente) => {
    if (editingCliente) {
      // Atualizar cliente existente no cache
      updateItem(newCliente, 'cpf_cnpj');
      setEditingCliente(null);
    } else {
      // Adicionar novo cliente ao cache
      addItem(newCliente);
    }
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-gray-600">Carregando clientes...</div>
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
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          <CacheStatus 
            isFromCache={isFromCache}
            lastFetch={lastFetch}
            cacheInfo={cacheInfo}
            className="mt-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton
            onRefresh={refresh}
            loading={isLoading}
            lastUpdate={lastFetch}
            variant="outline"
            size="sm"
          />
          <button
            onClick={() => {
              setEditingCliente(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Novo Cliente
          </button>
        </div>
      </div>

      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setEditingCliente(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingCliente(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ClienteForm
                onClienteAdded={handleClienteAdded}
                initialData={editingCliente}
                isEditing={!!editingCliente}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCliente(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {viewingCliente && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingCliente(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Detalhes do Cliente</h3>
                <button
                  onClick={() => setViewingCliente(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
                {/* Informações Básicas */}
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-800 mb-2">Informações Básicas</h4>
                  <div className="space-y-2">
                    <div className="border-b pb-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">CPF/CNPJ (Cédula)</p>
                      <p className="text-gray-900 font-semibold">{viewingCliente.cedula}</p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">Nome</p>
                      <p className="text-gray-900 font-semibold">{viewingCliente.nome}</p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                      <p className="text-gray-900">{viewingCliente.email}</p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">Telefone</p>
                      <p className="text-gray-900">{viewingCliente.telefone || 'Não especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Cidade</p>
                      <p className="text-gray-900">{viewingCliente.cidade || 'Não especificada'}</p>
                    </div>
                  </div>
                </div>

                {/* Informações Empresariais */}
                {(viewingCliente.empresa || viewingCliente.cnpj || viewingCliente.contato || viewingCliente.parceiro) && (
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800 mb-2">Informações Empresariais</h4>
                    <div className="space-y-2">
                      {viewingCliente.empresa && (
                        <div className="border-b pb-2">
                          <p className="text-sm font-medium text-gray-500 mb-1">Empresa</p>
                          <p className="text-gray-900">{viewingCliente.empresa}</p>
                        </div>
                      )}
                      {viewingCliente.cnpj && (
                        <div className="border-b pb-2">
                          <p className="text-sm font-medium text-gray-500 mb-1">CNPJ</p>
                          <p className="text-gray-900">{viewingCliente.cnpj}</p>
                        </div>
                      )}
                      {viewingCliente.contato && (
                        <div className="border-b pb-2">
                          <p className="text-sm font-medium text-gray-500 mb-1">Contato</p>
                          <p className="text-gray-900">{viewingCliente.contato}</p>
                        </div>
                      )}
                      {viewingCliente.parceiro && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Parceiro</p>
                          <p className="text-gray-900">{viewingCliente.parceiro}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Datas e Relatórios */}
                {(viewingCliente.vencimento || viewingCliente.data_bloqueio || viewingCliente.reuniao_apresentacao_agendada || viewingCliente.data_apresentacao_relatorio || viewingCliente.relatorio_gerado) && (
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800 mb-2">Datas e Relatórios</h4>
                    <div className="space-y-2">
                      {viewingCliente.vencimento && (
                        <div className="border-b pb-2">
                          <p className="text-sm font-medium text-gray-500 mb-1">Vencimento</p>
                          <p className="text-gray-900">{new Date(viewingCliente.vencimento).toLocaleDateString()}</p>
                        </div>
                      )}
                      {viewingCliente.data_bloqueio && (
                        <div className="border-b pb-2">
                          <p className="text-sm font-medium text-gray-500 mb-1">Data Bloqueio</p>
                          <p className="text-gray-900">{new Date(viewingCliente.data_bloqueio).toLocaleDateString()}</p>
                        </div>
                      )}
                      {viewingCliente.reuniao_apresentacao_agendada && (
                        <div className="border-b pb-2">
                          <p className="text-sm font-medium text-gray-500 mb-1">Reunião Apresentação Agendada</p>
                          <p className="text-gray-900">{new Date(viewingCliente.reuniao_apresentacao_agendada).toLocaleString()}</p>
                        </div>
                      )}
                      {viewingCliente.data_apresentacao_relatorio && (
                        <div className="border-b pb-2">
                          <p className="text-sm font-medium text-gray-500 mb-1">Data Apresentação Relatório</p>
                          <p className="text-gray-900">{new Date(viewingCliente.data_apresentacao_relatorio).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Relatório Gerado</p>
                        <p className={`font-semibold ${viewingCliente.relatorio_gerado ? 'text-green-600' : 'text-gray-400'}`}>
                          {viewingCliente.relatorio_gerado ? '✓ Sim' : '✗ Não'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {viewingCliente.observacoes && (
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-gray-800 mb-2">Observações</h4>
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingCliente.observacoes}</p>
                  </div>
                )}

                {/* Meta informações */}
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-800 mb-2">Informações do Sistema</h4>
                  <div className="space-y-2">
                    <div className="border-b pb-2">
                      <p className="text-sm font-medium text-gray-500 mb-1">Data de Cadastro</p>
                      <p className="text-gray-900">{new Date(viewingCliente.created_at).toLocaleString()}</p>
                    </div>
                    {viewingCliente.updated_at && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Última Atualização</p>
                        <p className="text-gray-900">{new Date(viewingCliente.updated_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => {
                    setViewingCliente(null);
                    handleEdit(viewingCliente);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setViewingCliente(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(clientes || []).length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Não tem clientes registrados
                </td>
              </tr>
            ) : (
              (clientes || []).map((cliente) => (
                <tr key={cliente.cedula}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.cedula}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.cidade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(cliente)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Ver detalhes"
                    >
                      <Eye className="inline-block w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="text-orange-500 hover:text-orange-700 mr-3"
                      title="Editar cliente"
                    >
                      <PencilLine className="inline-block w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.cedula)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir cliente"
                    >
                      <Trash2 className="inline-block w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClienteList;