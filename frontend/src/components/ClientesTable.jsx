import { useState } from 'react';
import { Search, Edit2, Trash2, Eye, Phone, Mail, MapPin, CreditCard, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockClientes = [
  { id: 1, nome: 'Sofia Mendes', email: 'sofia.mendes@email.com', cpf_cnpj: '12345678901', telefone: '(11) 91234-5678', cidade: 'São Paulo', estado: 'SP' },
  { id: 2, nome: 'Diego Oliveira', email: 'diego.oliveira@email.com', cpf_cnpj: '23456789012', telefone: '(21) 98765-4321', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { id: 3, nome: 'Luciana Santos', email: 'luciana.santos@email.com', cpf_cnpj: '34567890123', telefone: '(31) 94567-8901', cidade: 'Belo Horizonte', estado: 'MG' },
  { id: 4, nome: 'Alexandre Silva', email: 'alexandre.silva@email.com', cpf_cnpj: '45678901234', telefone: '(41) 92345-6789', cidade: 'Curitiba', estado: 'PR' },
  { id: 5, nome: 'Marina Costa', email: 'marina.costa@email.com', cpf_cnpj: '56789012345', telefone: '(51) 99876-5432', cidade: 'Porto Alegre', estado: 'RS' },
];

const ClientesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes] = useState(mockClientes);

  const filteredClientes = (clientes || []).filter(cliente =>
    Object.values(cliente).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="w-full space-y-6">
      {/* Header responsivo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar clientes..."
            className="input-responsive w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-responsive bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Cliente</span>
          <span className="sm:hidden">Novo</span>
        </motion.button>
      </motion.div>

      {/* Vista móvil - Tarjetas */}
      <div className="block lg:hidden">
        <AnimatePresence>
          {filteredClientes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">👥</span>
              </div>
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredClientes.map((cliente, index) => (
                <motion.div
                  key={cliente.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{cliente.nome}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <CreditCard className="h-3 w-3" />
                        <span>CPF: {cliente.cpf_cnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {cliente.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <a href={`mailto:${cliente.email}`} className="truncate hover:text-blue-600 hover:underline">{cliente.email}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-green-500" />
                      <a href={`tel:${cliente.telefone.replace(/\D/g, '')}`} className="hover:text-green-600 hover:underline">{cliente.telefone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span>{cliente.cidade}, {cliente.estado || 'Brasil'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden lg:block">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    CPF/CNPJ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">👥</span>
                        </div>
                        <span className="text-gray-500 text-sm">Nenhum cliente encontrado</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {cliente.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{cliente.nome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <a href={`mailto:${cliente.email}`} className="truncate max-w-xs hover:text-blue-600 hover:underline">{cliente.email}</a>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3 text-green-500" />
                            <a href={`tel:${cliente.telefone.replace(/\D/g, '')}`} className="hover:text-green-600 hover:underline">{cliente.telefone}</a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{cliente.cpf_cnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {cliente.cidade}, {cliente.estado || 'Brasil'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientesTable;