import { useMemo, useState, useEffect } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader/PageHeader";
import styles from "./events.module.css";
import { KanbanBoard } from "../../components/kanban/KanbanBoard/KanbanBoard";
import { useKanbanColumns, useKanbanCards } from "../../shared/hooks";
import { Loading } from "../../components/common/Loading/Loading";
import { useNotification } from "../../components/common/Notification/Notification";

export default function Eventos() {
  const { data: columns, loading: colsLoading, error: colsError, create: createColumn, update: updateColumn, remove: deleteColumn, refetch: refetchColumns, fetchData: fetchColumns } = useKanbanColumns();
  const { data: cards, loading: cardsLoading, error: cardsError, create: createCard, update: updateCard, partialUpdate: partialUpdateCard, remove: deleteCard, refetch: refetchCards, fetchData: fetchCards } = useKanbanCards();
  const { showSuccess, showError } = useNotification();

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [editingCard, setEditingCard] = useState(null);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("#1976d2");

  const mappedColumns = useMemo(() => {
    return (columns || []).map((c, idx) => ({
      id: c.id,
      name: c.nome || c.titulo || c.name || `Coluna #${c.id}`,
      color: c.cor || c.color,
      order: c.ordem ?? c.order ?? idx,
    }));
  }, [columns]);

  const mappedCards = useMemo(() => {
    return (cards || []).map((card) => ({
      id: card.id,
      title: card.titulo || card.nome || card.title || `Card #${card.id}`,
      description: card.descricao || card.description || "",
      priority: card.prioridade || card.priority,
      status: card.status,
      dueDate: card.vencimento || card.dueDate,
      assignee: card.responsavel || card.assignee,
      columnId: card.columnId ?? card.coluna ?? card.coluna_id ?? card.column_id ?? card.column,
      tags: card.tags || [],
    }));
  }, [cards]);

  useEffect(() => {
    fetchColumns();
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddColumnFromBoard = async (columnData) => {
    const payload = {
      name: columnData.name,
      color: columnData.color || "#1976d2",
      order: columnData.order ?? 0,
    };
    const res = await createColumn(payload);
    if (res.success) {
      showSuccess("Coluna criada com sucesso");
      refetchColumns();
    } else {
      showError(res.error || "Erro ao criar coluna");
    }
  };

  const handleCreateColumnTop = async () => {
    const payload = { name: newColumnName, color: newColumnColor || "#1976d2", order: 0 };
    const res = await createColumn(payload);
    if (res.success) {
      showSuccess("Coluna criada com sucesso");
      setIsAddColumnOpen(false);
      setNewColumnName("");
      setNewColumnColor("#1976d2");
      refetchColumns();
    } else {
      showError(res.error || "Erro ao criar coluna");
    }
  };

  const handleOpenAddCard = (columnId) => {
    setActiveColumnId(columnId);
    setIsAddCardOpen(true);
  };

  const handleCreateCard = async () => {
    const payload = {
      columnId: activeColumnId,
      title: newCardTitle,
      description: newCardDescription,
    };
    const res = await createCard(payload);
    if (res.success) {
      showSuccess("Card criado com sucesso");
      setIsAddCardOpen(false);
      setNewCardTitle("");
      setNewCardDescription("");
      setActiveColumnId(null);
      refetchCards();
    } else {
      showError(res.error || "Erro ao criar card");
    }
  };

  const handleOpenEditCard = (card) => {
    setEditingCard(card);
    setNewCardTitle(card.title || "");
    setNewCardDescription(card.description || "");
    setIsAddCardOpen(true);
    setActiveColumnId(card.columnId);
  };

  const handleSaveEditCard = async () => {
    if (!editingCard) return;
    const payload = { columnId: activeColumnId, title: newCardTitle, description: newCardDescription };
    const res = await updateCard(editingCard.id, payload);
    if (res.success) {
      showSuccess("Card atualizado com sucesso");
      setIsAddCardOpen(false);
      setEditingCard(null);
      setNewCardTitle("");
      setNewCardDescription("");
      setActiveColumnId(null);
      refetchCards();
    } else {
      showError(res.error || "Erro ao atualizar card");
    }
  };

  const handleDeleteCard = async (cardId) => {
    const res = await deleteCard(cardId);
    if (res.success) {
      showSuccess("Card excluído com sucesso");
      refetchCards();
    } else {
      showError(res.error || "Erro ao excluir card");
    }
  };

  if (colsLoading || cardsLoading) {
    return <Loading fullScreen message="Carregando Kanban..." />;
  }

  if (colsError || cardsError) {
    return (
      <Box className={styles.Container}>
        <PageHeader title="Quadro de Atividades" subtitle="Erro ao carregar dados" />
        <Box sx={{ p: 3, textAlign: "center" }}>
          <p>Erro: {colsError || cardsError}</p>
          <Button variant="outlined" onClick={() => { refetchColumns(); refetchCards(); }}>Tentar novamente</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.Container}>
      <PageHeader
        title="Quadro de Atividades"
        subtitle="Organize suas atividades"
        onAdd={() => setIsAddColumnOpen(true)}
        addButtonText="Nova Coluna"
      />
      <KanbanBoard
        columns={mappedColumns}
        cards={mappedCards}
        onColumnAdd={handleAddColumnFromBoard}
        onColumnEdit={async (columnData) => {
          const payload = { name: columnData.name, color: columnData.color || "#1976d2", order: columnData.order ?? 0 };
          const res = await updateColumn(columnData.id, payload);
          if (res.success) {
            showSuccess("Coluna atualizada com sucesso");
            refetchColumns();
          } else {
            showError(res.error || "Erro ao atualizar coluna");
          }
        }}
        onColumnDelete={async (columnId) => {
          const res = await deleteColumn(columnId);
          if (res.success) {
            showSuccess("Coluna excluída com sucesso");
            refetchColumns();
            refetchCards();
          } else {
            showError(res.error || "Erro ao excluir coluna");
          }
        }}
        onCardEdit={handleOpenEditCard}
        onCardDelete={handleDeleteCard}
        onCardMove={async (cardId, newColumnId) => {
          const res = await partialUpdateCard(cardId, { columnId: newColumnId });
          if (res.success) {
            showSuccess("Card movido");
            refetchCards();
          } else {
            showError(res.error || "Erro ao mover card");
          }
        }}
        onCardAdd={handleOpenAddCard}
        showHeader={false}
        showAddColumnButton={false}
        showEmptyState={false}
      />

      {/* Dialog Novo Card */}
      <Dialog open={isAddCardOpen} onClose={() => { setIsAddCardOpen(false); setEditingCard(null); }} fullWidth maxWidth="sm">
        <DialogTitle>{editingCard ? "Editar Card" : "Novo Card"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Título"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descrição"
            value={newCardDescription}
            onChange={(e) => setNewCardDescription(e.target.value)}
            margin="normal"
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsAddCardOpen(false); setEditingCard(null); }}>Cancelar</Button>
          {editingCard ? (
            <Button variant="contained" onClick={handleSaveEditCard} disabled={!newCardTitle.trim()}>Salvar</Button>
          ) : (
            <Button variant="contained" onClick={handleCreateCard} disabled={!newCardTitle.trim()}>Criar</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog Nova Coluna (topo) */}
      <Dialog open={isAddColumnOpen} onClose={() => setIsAddColumnOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova Coluna</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome da Coluna"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            margin="normal"
          />
          <Box sx={{ mt: 1 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#555' }}>Cor da Coluna:</p>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {["#1976d2", "#388e3c", "#f57c00", "#d32f2f", "#7b1fa2", "#455a64"].map((color) => (
                <Box
                  key={color}
                  onClick={() => setNewColumnColor(color)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: newColumnColor === color ? '2px solid #000' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                  title={color}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddColumnOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateColumnTop} disabled={!newColumnName.trim()}>Criar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
