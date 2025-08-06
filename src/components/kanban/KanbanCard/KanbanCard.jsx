import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import { MoreVert, Edit, Delete, Person } from "@mui/icons-material";
import { useState } from "react";
import styles from "./KanbanCard.module.css";

/**
 * Componente de card do Kanban
 * @param {object} card - Dados do card
 * @param {function} onEdit - Função chamada ao editar card
 * @param {function} onDelete - Função chamada ao deletar card
 * @param {function} onDragStart - Função chamada ao iniciar drag
 */
export function KanbanCard({ card, onEdit, onDelete, onDragStart }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    event.stopPropagation();
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "alta": return "#f44336";
      case "média": return "#ff9800";
      case "baixa": return "#4caf50";
      default: return "#757575";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "concluído": return "success";
      case "em andamento": return "primary";
      case "pendente": return "warning";
      case "cancelado": return "error";
      default: return "default";
    }
  };

  return (
    <Card 
      className={styles.Card}
      draggable
      onDragStart={onDragStart}
    >
      <CardContent className={styles.Content}>
        <Box className={styles.Header}>
          <Typography variant="h6" className={styles.Title}>
            {card.title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            className={styles.MenuButton}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {card.description && (
          <Typography variant="body2" className={styles.Description}>
            {card.description}
          </Typography>
        )}

        {card.tags && card.tags.length > 0 && (
          <Box className={styles.Tags}>
            {card.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                className={styles.Tag}
              />
            ))}
          </Box>
        )}

        <Box className={styles.Footer}>
          <Box className={styles.LeftSection}>
            {card.priority && (
              <Chip
                label={card.priority}
                size="small"
                style={{ 
                  backgroundColor: getPriorityColor(card.priority),
                  color: "white",
                  fontSize: "0.7rem"
                }}
              />
            )}
            {card.status && (
              <Chip
                label={card.status}
                size="small"
                color={getStatusColor(card.status)}
              />
            )}
          </Box>

          <Box className={styles.RightSection}>
            {card.assignee ? (
              <Avatar 
                src={card.assignee.avatar} 
                className={styles.Avatar}
              >
                {card.assignee.name?.charAt(0)}
              </Avatar>
            ) : (
              <Avatar className={styles.Avatar}>
                <Person fontSize="small" />
              </Avatar>
            )}
          </Box>
        </Box>

        {card.dueDate && (
          <Typography variant="caption" className={styles.DueDate}>
            Vencimento: {new Date(card.dueDate).toLocaleDateString("pt-BR")}
          </Typography>
        )}
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" style={{ marginRight: 8 }} />
          Editar Card
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" style={{ marginRight: 8 }} />
          Excluir Card
        </MenuItem>
      </Menu>
    </Card>
  );
}

