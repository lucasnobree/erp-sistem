import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem
} from "@mui/material";
import { Add, MoreVert, Edit, Delete } from "@mui/icons-material";
import { useState } from "react";
import { KanbanCard } from "../KanbanCard/KanbanCard";
import styles from "./KanbanColumn.module.css";

/**
 * Componente de coluna do Kanban
 * @param {object} column - Dados da coluna
 * @param {Array} cards - Cards da coluna
 * @param {function} onEdit - Função chamada ao editar coluna
 * @param {function} onDelete - Função chamada ao deletar coluna
 * @param {function} onCardAdd - Função chamada ao adicionar card
 * @param {function} onCardEdit - Função chamada ao editar card
 * @param {function} onCardDelete - Função chamada ao deletar card
 * @param {function} onDragOver - Função chamada durante drag over
 * @param {function} onDrop - Função chamada ao fazer drop
 * @param {function} onDragStart - Função chamada ao iniciar drag
 */
export function KanbanColumn({
  column,
  cards = [],
  onEdit,
  onDelete,
  onCardAdd,
  onCardEdit,
  onCardDelete,
  onDragOver,
  onDrop,
  onDragStart
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit();
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete();
    handleMenuClose();
  };

  return (
    <Paper 
      className={styles.Column}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Box className={styles.Header}>
        <Box className={styles.TitleSection}>
          <Box 
            className={styles.ColorIndicator}
            style={{ backgroundColor: column.color || "#1976d2" }}
          />
          <Typography variant="h6" className={styles.Title}>
            {column.name}
          </Typography>
          <Typography variant="body2" className={styles.Count}>
            {cards.length}
          </Typography>
        </Box>
        
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreVert />
        </IconButton>
      </Box>

      <Box className={styles.Cards}>
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onEdit={() => onCardEdit?.(card)}
            onDelete={() => onCardDelete?.(card.id)}
            onDragStart={(e) => onDragStart?.(e, card)}
          />
        ))}
      </Box>

      <Button
        variant="text"
        startIcon={<Add />}
        onClick={onCardAdd}
        className={styles.AddButton}
        fullWidth
      >
        Adicionar Card
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" style={{ marginRight: 8 }} />
          Editar Coluna
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" style={{ marginRight: 8 }} />
          Excluir Coluna
        </MenuItem>
      </Menu>
    </Paper>
  );
}

