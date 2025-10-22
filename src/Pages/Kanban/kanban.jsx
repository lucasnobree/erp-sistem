import { useState, useMemo, useEffect } from "react";
import { Box, Grid, Paper, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader/PageHeader";
import { Loading } from "../../components/common/Loading/Loading";
import { useKanbanColumns, useKanbanCards } from "../../shared/hooks/useApi";
import { useNotification } from "../../components/common/Notification/Notification";
import styles from "./kanban.module.css";

export default function Kanban() {
  const { data: columns, loading: columnsLoading, error: columnsError, create: createColumn, refetch: refetchColumns, fetchData: fetchColumns } = useKanbanColumns();
  const { data: cards, loading: cardsLoading, error: cardsError, create: createCard, refetch: refetchCards, fetchData: fetchCards } = useKanbanCards();
  const { showSuccess, showError } = useNotification();

  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");

  const cardsByColumn = useMemo(() => {
    const map = {};
    (cards || []).forEach((c) => {
      const colId = c.columnId;
      if (!map[colId]) map[colId] = [];
      map[colId].push(c);
    });
    return map;
  }, [cards]);

  useEffect(() => {
    fetchColumns();
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateColumn = async () => {
    const payload = { name: newColumnName, color: "#1976d2", order: 0 };
    const result = await createColumn(payload);
    if (result.success) {
      showSuccess("Coluna criada com sucesso");
      setIsAddColumnOpen(false);
      setNewColumnName("");
      refetchColumns();
    } else {
      showError(result.error || "Erro ao criar coluna");
    }
  };

  const handleOpenAddCard = (columnId) => {
    setActiveColumnId(columnId);
    setIsAddCardOpen(true);
  };

  const handleCreateCard = async () => {
    const payload = { columnId: activeColumnId, title: newCardTitle, description: newCardDescription };
    const result = await createCard(payload);
    if (result.success) {
      showSuccess("Card criado com sucesso");
      setIsAddCardOpen(false);
      setNewCardTitle("");
      setNewCardDescription("");
      setActiveColumnId(null);
      refetchCards();
    } else {
      showError(result.error || "Erro ao criar card");
    }
  };

  if (columnsLoading || cardsLoading) {
    return <Loading fullScreen message="Carregando Kanban..." />;
  }

  if (columnsError || cardsError) {
    return (
      <Box className={styles.Container}>
        <PageHeader title="Kanban" subtitle="Erro ao carregar dados" />
        <Box sx={{ p: 3, textAlign: "center" }}>
          <p>Erro: {columnsError || cardsError}</p>
          <Button variant="outlined" onClick={() => { refetchColumns(); refetchCards(); }}>Tentar novamente</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.Container}>
      <PageHeader
        title="Kanban"
        subtitle="Organize suas tarefas por coluna"
        onAdd={() => setIsAddColumnOpen(true)}
        addButtonText="Nova Coluna"
      />

      <Grid container spacing={2} className={styles.Board}>
        {(columns || []).map((col) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={col.id}>
            <Paper className={styles.Column} elevation={2}>
              <Box className={styles.ColumnHeader}>
                <Typography variant="h6">{col.name || `Coluna #${col.id}`}</Typography>
                <Button size="small" variant="contained" onClick={() => handleOpenAddCard(col.id)}>Novo Card</Button>
              </Box>
              <Box className={styles.CardsList}>
                {(cardsByColumn[col.id] || []).map((card) => (
                  <Paper key={card.id} className={styles.Card} variant="outlined">
                    <Typography variant="subtitle1" className={styles.CardTitle}>{card.title || `Card #${card.id}`}</Typography>
                    {card.description && (
                      <Typography variant="body2" className={styles.CardDesc}>{card.description}</Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog Nova Coluna */}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddColumnOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateColumn} disabled={!newColumnName.trim()}>Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Novo Card */}
      <Dialog open={isAddCardOpen} onClose={() => setIsAddCardOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo Card</DialogTitle>
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
          <Button onClick={() => setIsAddCardOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateCard} disabled={!newCardTitle.trim()}>Criar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
