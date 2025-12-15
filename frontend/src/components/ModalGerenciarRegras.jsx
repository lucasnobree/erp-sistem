import { useState, useEffect } from 'react';
import { X, Zap, Edit, Trash2, Power, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { makeAuthenticatedRequest } from '../services/auth';

const ModalGerenciarRegras = ({ kanban, onClose }) => {
  const [regras, setRegras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegras();
  }, [kanban.id]);

  const fetchRegras = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`/kanbans/${kanban.id}/regras/`);
      if (response.ok) {
        const data = await response.json();
        setRegras(data);
      }
    } catch (err) {
      console.error('Erro ao carregar regras:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegra = async (regraId, ativo) => {
    try {
      const response = await makeAuthenticatedRequest(`/regras-automacao/${regraId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo })
      });

      if (response.ok) {
        setRegras(regras.map(regra => 
          regra.id === regraId 
            ? { ...regra, ativo: !ativo }
            : regra
        ));
      } else {
        alert('Erro ao alterar status da regra');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const handleDeleteRegra = async (regraId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta regra?')) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`/regras-automacao/${regraId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRegras(regras.filter(regra => regra.id !== regraId));
      } else {
        alert('Erro ao excluir regra');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const getTriggerLabel = (tipo, coluna, dias) => {
    switch (tipo) {
      case 'movimentacao':
        return `Quando movido para "${coluna?.nome || 'N/A'}"`;
      case 'prazo':
        return `${dias} dias antes do vencimento`;
      case 'criacao':
        return 'Quando card for criado';
      case 'atribuicao':
        return 'Quando responsável for atribuído';
      default:
        return tipo;
    }
  };

  const getAcaoLabel = (acao) => {
    const acoes = {
      'cliente': 'Notificar Cliente',
      'responsavel': 'Notificar Responsável',
      'admin': 'Notificar Administrador'
    };
    return acoes[acao] || acao;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Regras de Automação - {kanban.nome}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : regras.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma regra configurada
              </h3>
              <p className="text-gray-500 mb-6">
                Crie regras de automação para notificar via WhatsApp quando certas ações ocorrerem
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {regras.map((regra, index) => (
                <motion.div
                  key={regra.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${
                    regra.ativo ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Nome e Status */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{regra.nome}</h3>
                        <div className="flex items-center gap-2">
                          {regra.ativo ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            regra.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {regra.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>

                      {/* Detalhes da Regra */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Trigger:</strong> {getTriggerLabel(regra.tipo_trigger, regra.coluna_trigger, regra.dias_antes_vencimento)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <strong>Ação:</strong> {getAcaoLabel(regra.acao_whatsapp)}
                          </p>
                        </div>
                      </div>

                      {/* Template da Mensagem */}
                      <div className="bg-white border border-gray-200 rounded p-3">
                        <p className="text-xs text-gray-500 mb-1">Mensagem:</p>
                        <p className="text-sm text-gray-800 italic">"{regra.template_mensagem}"</p>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleRegra(regra.id, regra.ativo)}
                        className={`p-2 rounded-lg transition-colors ${
                          regra.ativo
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={regra.ativo ? 'Desativar regra' : 'Ativar regra'}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implementar edição
                          console.log('Editar regra:', regra.id);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar regra"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRegra(regra.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir regra"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalGerenciarRegras;