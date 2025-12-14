import React, { useState } from 'react';
import { makeAuthenticatedRequest } from '../services/auth';

const ClienteForm = ({ onClienteAdded, initialData, isEditing, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    cpf_cnpj: '',
    nome: '',
    email: '',
    telefone: '',
    cidade: ''
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
        ? `/clientes/${formData.cpf_cnpj}/`
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
            cpf_cnpj: '',
            nome: '',
            email: '',
            telefone: '',
            cidade: ''
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cpf_cnpj" className="block text-sm font-medium text-gray-700">
          CPF/CNPJ
        </label>
        <input
          type="text"
          id="cpf_cnpj"
          name="cpf_cnpj"
          value={formData.cpf_cnpj}
          onChange={handleChange}
          disabled={isEditing}
          required
          className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          value={formData.telefone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
          value={formData.cidade}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
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