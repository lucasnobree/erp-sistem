import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { makeAuthenticatedRequest } from '../services/auth';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import ModalRegraAutomacao from './ModalRegraAutomacao';
import ModalGerenciarRegras from './ModalGerenciarRegras';
import ModalKanban from './ModalKanban';
import { ArrowLeft, Plus, Settings, User, Mail, Phone, Building, MapPin, Edit, Zap, ChevronDown, List } from 'lucide-react';

const KanbanBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kanban, setKanban] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnData, setNewColumnData] = useState({
    nome: '',
    cor: '#3B82F6',
    limite_cards: ''
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showRegraModal, setShowRegraModal] = useState(false);
  const [showGerenciarRegras, setShowGerenciarRegras] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchKanbanCompleto();
  }, [id]);

  const fetchKanbanCompleto = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`/kanbans/${id}/completo/`);
      if (response.ok) {
        const data = await response.json();
        setKanban(data);
      } else {
        setError('Erro ao carregar quadro Kanban');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleEditKanban = async (kanbanData) => {
    try {
      const response = await makeAuthenticatedRequest(`/kanbans/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kanbanData)
      });

      if (response.ok) {
        setShowEditModal(false);
        // Atualizar dados locais
        setKanban(prev => ({
          ...prev,
          nome: kanbanData.nome,
          descricao: kanbanData.descricao
        }));
        alert('Quadro atualizado com sucesso!');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Erro ao atualizar quadro');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const handleSaveRegra = async (regraData) => {
    try {
      const response = await makeAuthenticatedRequest('/regras-automacao/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regraData)
      });

      if (response.ok) {
        setShowRegraModal(false);
        alert('Regra de automação criada com sucesso!');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Erro ao criar regra de automação');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        kanban: parseInt(id),
        nome: newColumnData.nome,
        cor: newColumnData.cor,
        limite_cards: newColumnData.limite_cards ? parseInt(newColumnData.limite_cards) : null
      };

      const response = await makeAuthenticatedRequest('/colunas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowColumnModal(false);
        setNewColumnData({ nome: '', cor: '#3B82F6', limite_cards: '' });
        fetchKanbanCompleto();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Erro ao criar coluna');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    // Find the card being dragged
    for (const coluna of kanban.colunas) {
      const card = coluna.cards.find(c => c.id === active.id);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    // Find source and destination columns
    let sourceColuna = null;
    let destColuna = null;
    let cardToMove = null;

    for (const coluna of kanban.colunas) {
      const card = coluna.cards.find(c => c.id === active.id);
      if (card) {
        sourceColuna = coluna;
        cardToMove = card;
      }
      // Check if over is a column or a card
      if (over.id === `coluna-${coluna.id}` || coluna.cards.some(c => c.id === over.id)) {
        destColuna = coluna;
      }
    }

    if (!sourceColuna || !destColuna || !cardToMove) return;

    // If dropped in same column and same position, do nothing
    if (sourceColuna.id === destColuna.id && active.id === over.id) return;

    // Move card via API
    try {
      const response = await makeAuthenticatedRequest(`/cards/${active.id}/mover/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coluna_destino: destColuna.id,
          ordem: 0,
          observacao: `Movido de ${sourceColuna.nome} para ${destColuna.nome}`
        })
      });

      if (response.ok) {
        // Refresh the board
        fetchKanbanCompleto();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Erro ao mover card');
      }
    } catch (err) {
      alert('Erro ao mover card');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-gray-600">Carregando quadro Kanban...</div>
      </div>
    );
  }

  if (error || !kanban) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error || 'Quadro não encontrado'}
        </div>
        <button
          onClick={() => navigate('/atividades')}
          className="mt-4 text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/atividades')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{kanban.nome}</h1>
              {kanban.descricao && (
                <p className="text-sm text-gray-600 mt-1">{kanban.descricao}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowColumnModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Coluna
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showSettingsMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowEditModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Quadro
                  </button>
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowRegraModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <Zap className="w-4 h-4" />
                    Criar Regra de Automação
                  </button>
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      setShowGerenciarRegras(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <List className="w-4 h-4" />
                    Gerenciar Regras
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar menu de configurações */}
      {showSettingsMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowSettingsMenu(false)}
        />
      )}

      {/* Client Info */}
      {kanban.cliente_nome && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Cliente:</span>
            <span className="text-sm text-gray-900 font-semibold">{kanban.cliente_nome}</span>
          </div>
        </div>
      )}

      {/* Column Modal */}
      {showColumnModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowColumnModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Nova Coluna</h3>
                <button
                  onClick={() => setShowColumnModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateColumn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newColumnData.nome}
                    onChange={(e) => setNewColumnData({ ...newColumnData, nome: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="Ex: A Fazer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="color"
                    value={newColumnData.cor}
                    onChange={(e) => setNewColumnData({ ...newColumnData, cor: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limite de Cards (opcional)
                  </label>
                  <input
                    type="number"
                    value={newColumnData.limite_cards}
                    onChange={(e) => setNewColumnData({ ...newColumnData, limite_cards: e.target.value })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                    placeholder="Sem limite"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowColumnModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Criar Coluna
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Regra de Automação */}
      {showRegraModal && (
        <ModalRegraAutomacao
          kanban={kanban}
          onSave={handleSaveRegra}
          onClose={() => setShowRegraModal(false)}
        />
      )}

      {/* Modal de Gerenciar Regras */}
      {showGerenciarRegras && (
        <ModalGerenciarRegras
          kanban={kanban}
          onClose={() => setShowGerenciarRegras(false)}
        />
      )}

      {/* Modal de Edição do Quadro */}
      {showEditModal && (
        <ModalKanban
          kanban={kanban}
          onSave={handleEditKanban}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {kanban.colunas && kanban.colunas.length > 0 ? (
              kanban.colunas.map((coluna) => (
                <KanbanColumn
                  key={coluna.id}
                  coluna={coluna}
                  onRefresh={fetchKanbanCompleto}
                />
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Nenhuma coluna criada</p>
                  <button
                    onClick={() => setShowColumnModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Primeira Coluna
                  </button>
                </div>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3 opacity-80">
                <KanbanCard card={activeCard} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
