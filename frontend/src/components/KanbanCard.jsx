import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { makeAuthenticatedRequest } from '../services/auth';
import { Calendar, AlertCircle, User, Trash2, Edit, Clock } from 'lucide-react';

const KanbanCard = ({ card, onRefresh, isDragging }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    titulo: card.titulo,
    descricao: card.descricao || '',
    prioridade: card.prioridade,
    data_vencimento: card.data_vencimento || ''
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'alta':
        return 'Alta';
      case 'media':
        return 'Média';
      case 'baixa':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o card "${card.titulo}"?`)) {
      try {
        const response = await makeAuthenticatedRequest(`/cards/${card.id}/`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onRefresh && onRefresh();
        } else {
          alert('Erro ao excluir card');
        }
      } catch (err) {
        alert('Erro de conexão');
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest(`/cards/${card.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          data_vencimento: editData.data_vencimento || null
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        onRefresh && onRefresh();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Erro ao atualizar card');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const isOverdue = card.esta_atrasado;
  const daysToDeadline = card.dias_vencimento;

  // If it's being dragged by DragOverlay, render without sortable attributes
  if (isDragging) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 cursor-grabbing">
        <div className="mb-2">
          <h4 className="font-medium text-gray-900">{card.titulo}</h4>
        </div>
        {card.descricao && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.descricao}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white rounded-lg shadow-sm hover:shadow-md p-4 border border-gray-200 cursor-grab active:cursor-grabbing transition-shadow"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 flex-1">{card.titulo}</h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-gray-600 ml-2 relative"
          >
            •••
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowEditModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            )}
          </button>
        </div>

        {card.descricao && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.descricao}</p>
        )}

        <div className="space-y-2">
          {/* Priority Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(card.prioridade)}`}>
              {getPriorityLabel(card.prioridade)}
            </span>
          </div>

          {/* Due Date */}
          {card.data_vencimento && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              <span>
                {formatDate(card.data_vencimento)}
                {daysToDeadline !== null && (
                  <span className="ml-1">
                    ({daysToDeadline > 0 ? `${daysToDeadline} dias` : daysToDeadline === 0 ? 'Hoje' : 'Atrasado'})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Assignee */}
          {card.responsavel_nome && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <User className="w-3 h-3" />
              <span>{card.responsavel_nome}</span>
            </div>
          )}

          {/* Client */}
          {card.cliente_nome && (
            <div className="text-xs text-gray-500">
              Cliente: {card.cliente_nome}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Editar Card</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={editData.titulo}
                    onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={editData.descricao}
                    onChange={(e) => setEditData({ ...editData, descricao: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={editData.prioridade}
                    onChange={(e) => setEditData({ ...editData, prioridade: e.target.value })}
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
                    value={editData.data_vencimento}
                    onChange={(e) => setEditData({ ...editData, data_vencimento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KanbanCard;
