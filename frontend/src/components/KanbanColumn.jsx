import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { makeAuthenticatedRequest } from '../services/auth';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';

const KanbanColumn = ({ coluna, onRefresh }) => {
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [newCardData, setNewCardData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    data_vencimento: ''
  });

  const { setNodeRef } = useDroppable({
    id: `coluna-${coluna.id}`,
  });

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        coluna: coluna.id,
        titulo: newCardData.titulo,
        descricao: newCardData.descricao,
        prioridade: newCardData.prioridade,
        data_vencimento: newCardData.data_vencimento || null
      };

      const response = await makeAuthenticatedRequest('/cards/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowCardModal(false);
        setNewCardData({ titulo: '', descricao: '', prioridade: 'media', data_vencimento: '' });
        onRefresh();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Erro ao criar card');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const handleDeleteColumn = async () => {
    if (coluna.cards.length > 0) {
      alert('Não é possível excluir uma coluna com cards. Mova ou exclua os cards primeiro.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a coluna "${coluna.nome}"?`)) {
      try {
        const response = await makeAuthenticatedRequest(`/colunas/${coluna.id}/`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onRefresh();
        } else {
          alert('Erro ao excluir coluna');
        }
      } catch (err) {
        alert('Erro de conexão');
      }
    }
  };

  const cardIds = coluna.cards.map(card => card.id);

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-80 bg-gray-100 rounded-lg flex flex-col"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Column Header */}
      <div
        className="p-4 border-b-4 rounded-t-lg"
        style={{ borderColor: coluna.cor }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{coluna.nome}</h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDeleteColumn();
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Coluna
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {coluna.total_cards} {coluna.total_cards === 1 ? 'card' : 'cards'}
            {coluna.limite_cards && ` / ${coluna.limite_cards}`}
          </span>
          <button
            onClick={() => setShowCardModal(true)}
            className="text-indigo-600 hover:text-indigo-800 p-1"
            title="Adicionar card"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {coluna.cards && coluna.cards.length > 0 ? (
            coluna.cards.map((card) => (
              <KanbanCard key={card.id} card={card} onRefresh={onRefresh} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum card
            </div>
          )}
        </SortableContext>
      </div>

      {/* Card Modal */}
      {showCardModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCardModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Novo Card</h3>
                <button
                  onClick={() => setShowCardModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newCardData.titulo}
                    onChange={(e) => setNewCardData({ ...newCardData, titulo: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Título do card"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={newCardData.descricao}
                    onChange={(e) => setNewCardData({ ...newCardData, descricao: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="Descrição do card..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newCardData.prioridade}
                    onChange={(e) => setNewCardData({ ...newCardData, prioridade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={newCardData.data_vencimento}
                    onChange={(e) => setNewCardData({ ...newCardData, data_vencimento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCardModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Criar Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;
