import React, { useState, useEffect } from 'react';

const UsuarioModal = ({ usuario, mode, onClose, onSave, isEditingSelf, currentUserRole }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nome: '',
    rol: 'Usuario',
    zona_acesso: 'geral',
    is_active: true
  });

  useEffect(() => {
    if (usuario && (mode === 'edit' || mode === 'view')) {
      setFormData({
        username: usuario.username || '',
        email: usuario.email || '',
        password: '',
        nome: usuario.nome || '',
        rol: usuario.rol || 'Usuario',
        zona_acesso: usuario.zona_acesso || 'geral',
        is_active: usuario.is_active
      });
    }
  }, [usuario, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'view') return;

    const submitData = { ...formData };
    if (mode === 'edit' && !submitData.password) {
      delete submitData.password;
    }

    onSave(submitData);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {mode === 'create' ? 'Criar Usuario' :
               mode === 'edit' ? 'Editar Usuario' :
               'Detalhes do Usuario'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome de Usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={mode === 'view'}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={mode === 'view'}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {mode !== 'view' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {mode === 'create' ? 'Senha' : 'Nova Senha (deixe em branco para manter)'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={mode === 'create'}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              disabled={mode === 'view'}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rol</label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={mode === 'view' || (isEditingSelf && currentUserRole === 'Usuario')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Usuario">Usuario</option>
              <option value="staff">Staff</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Zona de Acesso</label>
            <select
              name="zona_acesso"
              value={formData.zona_acesso}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="geral">Geral</option>
              <option value="restringida">Restrita</option>
              <option value="administrativa">Administrativa</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Usuario Ativo</label>
          </div>

          {mode !== 'view' && (
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {mode === 'create' ? 'Criar Usuario' : 'Atualizar Usuario'}
              </button>
            </div>
          )}

          {mode === 'view' && (
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsuarioModal;