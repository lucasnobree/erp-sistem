import { Grid, Box } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader/PageHeader";
import { DataCard } from "../../components/common/DataCard/DataCard";
import {
  People,
  Assignment,
  TrendingUp,
  AttachMoney,
} from "@mui/icons-material";
import styles from "./events.module.css";
import { KanbanBoard } from "../../components/kanban/KanbanBoard/KanbanBoard";

export default function Eventos() {
  const handleAddEvent = () => {
    console.log("Adicionar novo item ao Evento");
    // Implementar lógica de adição
  };

  return (
    <Box className={styles.Container}>
      <PageHeader
        title="Quadro de Atividades"
        subtitle="Visão geral das suas atividades"
        onAdd={handleAddEvent}
        addButtonText="Novo Evento"
      />
      <KanbanBoard />
    </Box>
  );
}
