import { useState, useEffect } from 'react';
import { X, Zap, MessageSquare, Clock, Move, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const ModalRegraAutomacao = ({ kanban, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo_trigger: 'movimentacao',
    coluna_trigger: '',
    dias_antes_vencimento: '',
    acao_whatsapp: 'cliente',
    template_mensagem: ''
  });
  const [errors, setErrors] = useState({});

  const tipoTriggerOptions = [
    { value: 'movimentacao', label: 'Movimentação de Card', icon: Move },
    { value: 'prazo', label: 'Prazo de Vencimento', icon: Clock },
    { value: 'criacao', label: 'Criação de Card', icon: UserPlus },
    { value: 'atribuicao', label: 'Atribuição de Responsável', icon: UserPlus }
  ];

  const acaoWhatsappOptions = [
    { value: 'cliente', label: 'Notificar Cliente' },
    { value: 'responsavel', label: 'Notificar Responsável' },
    { value: 'admin', label: 'Notificar Administrador' }
  ];

  const templateVariaveis = [
    { var: '{cliente_nome}', desc: 'Nome do cliente' },
    { var: '{produto_nome}', desc: 'Nome do produto' },
    { var: '{card_titulo}', desc: 'Título do card' },
    { var: '{responsavel_nome}', desc: 'Nome do responsável' },
    { var: '{data_vencimento}', desc: 'Data de vencimento' },
    { var: '{coluna_nome}', desc: 'Nome da coluna' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template_mensagem');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.template_mensagem;
    const newText = text.substring(0, start) + variable + text.substring(end);
    
    setFormData(prev => ({
      ...prev,
      template_mensagem: newText
    }));
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da regra é obrigatório';
    }

    if (formData.tipo_trigger === 'movimentacao' && !formData.coluna_trigger) {
      newErrors.coluna_trigger = 'Selecione a coluna para o trigger';
    }

    if (formData.tipo_trigger === 'prazo' && !formData.dias_antes_vencimento) {
      newErrors.dias_antes_vencimento = 'Informe quantos dias antes do vencimento';
    }

    if (!formData.template_mensagem.trim()) {
      newErrors.template_mensagem = 'Template da mensagem é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const payload = {
        ...formData,
        kanban: kanban.id,
        dias_antes_vencimento: formData.dias_antes_vencimento ? parseInt(formData.dias_antes_vencimento) : null,
        coluna_trigger: formData.coluna_trigger || null
      };
      onSave(payload);
    }
  };

  const getTemplateExample = () => {
    switch (formData.tipo_trigger) {
      case 'movimentacao':
        return `Olá {cliente_nome}! Seu card "{card_titulo}" foi movido para {coluna_nome}.`;
      case 'prazo':
        return `Atenção {cliente_nome}! O prazo do card "{card_titulo}" vence em {data_vencimento}.`;
      case 'criacao':
        return `Olá {cliente_nome}! Um novo card "{card_titulo}" foi criado para você.`;
      case 'atribuicao':
        return `Olá {responsavel_nome}! Você foi atribuído ao card "{card_titulo}".`;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Nova Regra de Automação
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Nome da Regra */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Regra *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                  errors.nome ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Notificar cliente quando concluído"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
              )}
            </div>

            {/* Tipo de Trigger */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quando executar a regra? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tipoTriggerOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.tipo_trigger === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipo_trigger"
                        value={option.value}
                        checked={formData.tipo_trigger === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <IconComponent className="h-5 w-5 mr-3 text-gray-700" />
                      <span className="text-sm font-medium text-gray-800">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Configurações específicas do trigger */}
            {formData.tipo_trigger === 'movimentacao' && (
              <div>
                <label htmlFor="coluna_trigger" className="block text-sm font-medium text-gray-700 mb-2">
                  Quando movido para qual coluna? *
                </label>
                <select
                  id="coluna_trigger"
                  name="coluna_trigger"
                  value={formData.coluna_trigger}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                    errors.coluna_trigger ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma coluna</option>
                  {kanban.colunas?.map((coluna) => (
                    <option key={coluna.id} value={coluna.id}>
                      {coluna.nome}
                    </option>
                  ))}
                </select>
                {errors.coluna_trigger && (
                  <p className="mt-1 text-sm text-red-600">{errors.coluna_trigger}</p>
                )}
              </div>
            )}

            {formData.tipo_trigger === 'prazo' && (
              <div>
                <label htmlFor="dias_antes_vencimento" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantos dias antes do vencimento? *
                </label>
                <input
                  type="number"
                  id="dias_antes_vencimento"
                  name="dias_antes_vencimento"
                  value={formData.dias_antes_vencimento}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                    errors.dias_antes_vencimento ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 3"
                />
                {errors.dias_antes_vencimento && (
                  <p className="mt-1 text-sm text-red-600">{errors.dias_antes_vencimento}</p>
                )}
              </div>
            )}

            {/* Ação WhatsApp */}
            <div>
              <label htmlFor="acao_whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                Quem será notificado? *
              </label>
              <select
                id="acao_whatsapp"
                name="acao_whatsapp"
                value={formData.acao_whatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
              >
                {acaoWhatsappOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Template da Mensagem */}
            <div>
              <label htmlFor="template_mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem que será enviada *
              </label>
              
              {/* Variáveis disponíveis */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Variáveis disponíveis (clique para inserir):</p>
                <div className="flex flex-wrap gap-2">
                  {templateVariaveis.map((item) => (
                    <button
                      key={item.var}
                      type="button"
                      onClick={() => insertVariable(item.var)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                      title={item.desc}
                    >
                      {item.var}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                id="template_mensagem"
                name="template_mensagem"
                value={formData.template_mensagem}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-gray-900 placeholder-gray-500 ${
                  errors.template_mensagem ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={getTemplateExample()}
              />
              {errors.template_mensagem && (
                <p className="mt-1 text-sm text-red-600">{errors.template_mensagem}</p>
              )}
              
              {/* Exemplo */}
              {getTemplateExample() && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">Exemplo:</p>
                  <p className="text-xs text-blue-800">{getTemplateExample()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Criar Regra
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ModalRegraAutomacao;