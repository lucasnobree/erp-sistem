import React, { useState } from 'react';
import { makeAuthenticatedRequest } from '../services/auth';

const ClienteForm = ({ onClienteAdded, initialData, isEditing, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    cedula: '',
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    empresa: '',
    cnpj: '',
    data_bloqueio: '',
    vencimento: '',
    reuniao_apresentacao_agendada: '',
    relatorio_gerado: false,
    data_apresentacao_relatorio: '',
    contato: '',
    parceiro: '',
    observacoes: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Submitting form data:', formData);
      const url = isEditing
        ? `/clientes/${formData.cedula}/`
        : '/clientes/';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await makeAuthenticatedRequest(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('Success data:', data);
        onClienteAdded(data);
        if (!isEditing) {
          setFormData({
            cedula: '',
            nome: '',
            email: '',
            telefone: '',
            cidade: '',
            empresa: '',
            cnpj: '',
            data_bloqueio: '',
            vencimento: '',
            reuniao_apresentacao_agendada: '',
            relatorio_gerado: false,
            data_apresentacao_relatorio: '',
            contato: '',
            parceiro: '',
            observacoes: ''
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Error data:', errorData);
        setError(errorData.detail || 'Erro ao salvar o cliente. Por favor, verificar os dados.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Erro de conexão. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      {/* Seção: Informações Básicas */}
      <div className="border-b pb-4">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Informações Básicas</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
              CPF/CNPJ (Cédula) *
            </label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              disabled={isEditing}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              type="text"
              id="telefone"
              name="telefone"
              value={formData.telefone || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              value={formData.cidade || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Seção: Informações Empresariais */}
      <div className="border-b pb-4">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Informações Empresariais</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
              Empresa
            </label>
            <input
              type="text"
              id="empresa"
              name="empresa"
              value={formData.empresa || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
              CNPJ
            </label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj || ''}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="contato" className="block text-sm font-medium text-gray-700">
              Contato
            </label>
            <input
              type="text"
              id="contato"
              name="contato"
              value={formData.contato || ''}
              onChange={handleChange}
              placeholder="Nome do contato"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="parceiro" className="block text-sm font-medium text-gray-700">
              Parceiro
            </label>
            <input
              type="text"
              id="parceiro"
              name="parceiro"
              value={formData.parceiro || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Seção: Datas e Relatórios */}
      <div className="border-b pb-4">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Datas e Relatórios</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vencimento" className="block text-sm font-medium text-gray-700">
              Vencimento
            </label>
            <input
              type="date"
              id="vencimento"
              name="vencimento"
              value={formData.vencimento || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="data_bloqueio" className="block text-sm font-medium text-gray-700">
              Data Bloqueio
            </label>
            <input
              type="date"
              id="data_bloqueio"
              name="data_bloqueio"
              value={formData.data_bloqueio || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="reuniao_apresentacao_agendada" className="block text-sm font-medium text-gray-700">
              Reunião Apresentação Agendada
            </label>
            <input
              type="datetime-local"
              id="reuniao_apresentacao_agendada"
              name="reuniao_apresentacao_agendada"
              value={formData.reuniao_apresentacao_agendada ? formData.reuniao_apresentacao_agendada.slice(0, 16) : ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="data_apresentacao_relatorio" className="block text-sm font-medium text-gray-700">
              Data Apresentação Relatório
            </label>
            <input
              type="date"
              id="data_apresentacao_relatorio"
              name="data_apresentacao_relatorio"
              value={formData.data_apresentacao_relatorio || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="relatorio_gerado"
              name="relatorio_gerado"
              checked={formData.relatorio_gerado || false}
              onChange={(e) => setFormData({ ...formData, relatorio_gerado: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="relatorio_gerado" className="ml-2 block text-sm font-medium text-gray-700">
              Relatório Gerado
            </label>
          </div>
        </div>
      </div>

      {/* Seção: Observações */}
      <div className="pb-4">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Observações</h4>

        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes || ''}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 px-3 py-2"
            placeholder="Observações adicionais sobre o cliente..."
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t sticky bottom-0 bg-white">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Cliente' : 'Criar Cliente'}
        </button>
      </div>
    </form>
  );
};

export default ClienteForm;