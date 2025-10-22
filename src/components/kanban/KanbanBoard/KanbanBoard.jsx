import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { Add, MoreVert, Edit, Delete } from "@mui/icons-material";
import { KanbanColumn } from "../KanbanColumn/KanbanColumn";
import { KanbanCard } from "../KanbanCard/KanbanCard";
import styles from "./KanbanBoard.module.css";

/**
 * Componente de quadro Kanban personalizável
 * @param {Array} columns - Array de colunas do Kanban
 * @param {Array} cards - Array de cards do Kanban
 * @param {function} onColumnAdd - Função chamada ao adicionar coluna
 * @param {function} onColumnEdit - Função chamada ao editar coluna
 * @param {function} onColumnDelete - Função chamada ao deletar coluna
 * @param {function} onCardAdd - Função chamada ao adicionar card
 * @param {function} onCardEdit - Função chamada ao editar card
 * @param {function} onCardDelete - Função chamada ao deletar card
 * @param {function} onCardMove - Função chamada ao mover card
 */


export function KanbanBoard({
  columns = [{color: "#1976d2", id: 1, name: "To Do", order: 0}],
  cards = [{id: 1, title: "Sample Task", description: "This is a sample task", priority: "Alta", status: "Pendente", dueDate: "2024-12-31", assignee: "Lucas", columnId: 1}],
  onColumnAdd,
  onColumnEdit,
  onColumnDelete,
  onCardAdd,
  onCardEdit,
  onCardDelete,
  onCardMove,
  showHeader = true,
  showAddColumnButton = true,
  showEmptyState = true,
}) {
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [columnName, setColumnName] = useState("");
  const [columnColor, setColumnColor] = useState("#1976d2");

  const handleAddColumn = () => {
    setEditingColumn(null);
    setColumnName("");
    setColumnColor("#1976d2");
    setShowColumnDialog(true);
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setColumnName(column.name);
    setColumnColor(column.color || "#1976d2");
    setShowColumnDialog(true);
  };

  const handleSaveColumn = () => {
    if (columnName.trim()) {
      const columnData = {
        id: editingColumn?.id || Date.now(),
        name: columnName.trim(),
        color: columnColor,
        order: editingColumn?.order || columns.length
      };

      if (editingColumn) {
        onColumnEdit?.(columnData);
      } else {
        onColumnAdd?.(columnData);
      }

      setShowColumnDialog(false);
      setColumnName("");
      setColumnColor("#1976d2");
      setEditingColumn(null);
    }
  };

  const handleDeleteColumn = (columnId) => {
    if (window.confirm("Tem certeza que deseja excluir esta coluna? Todos os cards serão movidos para a primeira coluna.")) {
      onColumnDelete?.(columnId);
    }
  };

  const getCardsForColumn = (columnId) => {
    return cards.filter(card => card.columnId === columnId);
  };

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(card));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const cardData = JSON.parse(e.dataTransfer.getData("text/plain"));
    
    if (cardData.columnId !== columnId) {
      onCardMove?.(cardData.id, columnId);
    }
  };

  return (
    <Box className={styles.Board}>
      {showHeader && (
        <Box className={styles.Header}>
          <Typography variant="h6" className={styles.Title}>
            Quadro Kanban
          </Typography>
          {showAddColumnButton && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddColumn}
              className={styles.AddButton}
            >
              Nova Coluna
            </Button>
          )}
        </Box>
      )}

      <Box className={styles.Columns}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={getCardsForColumn(column.id)}
            onEdit={() => handleEditColumn(column)}
            onDelete={() => handleDeleteColumn(column.id)}
            onCardAdd={() => onCardAdd?.(column.id)}
            onCardEdit={onCardEdit}
            onCardDelete={onCardDelete}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragStart={handleDragStart}
          />
        ))}

        {showEmptyState && columns.length === 0 && (
          <Paper className={styles.EmptyState}>
            <Typography variant="h6" color="textSecondary">
              Nenhuma coluna criada
            </Typography>
            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
              Crie sua primeira coluna para começar a organizar seus projetos
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddColumn}
            >
              Criar Primeira Coluna
            </Button>
          </Paper>
        )}
      </Box>

      {/* Dialog para criar/editar coluna */}
      <Dialog open={showColumnDialog} onClose={() => setShowColumnDialog(false)}>
        <DialogTitle>
          {editingColumn ? "Editar Coluna" : "Nova Coluna"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Coluna"
            fullWidth
            variant="outlined"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Box className={styles.ColorPicker}>
            <Typography variant="body2" style={{ marginBottom: 8 }}>
              Cor da Coluna:
            </Typography>
            <Box className={styles.ColorOptions}>
              {["#1976d2", "#388e3c", "#f57c00", "#d32f2f", "#7b1fa2", "#455a64"].map((color) => (
                <Box
                  key={color}
                  className={`${styles.ColorOption} ${columnColor === color ? styles.Selected : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setColumnColor(color)}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowColumnDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveColumn} variant="contained">
            {editingColumn ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

