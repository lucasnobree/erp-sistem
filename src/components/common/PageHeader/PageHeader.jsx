import { Button, Typography, Box } from "@mui/material";
import { Add } from "@mui/icons-material";
import styles from "./PageHeader.module.css";

/**
 * Componente de cabeçalho reutilizável para páginas
 * @param {string} title - Título da página
 * @param {string} subtitle - Subtítulo opcional
 * @param {function} onAdd - Função chamada ao clicar no botão de adicionar
 * @param {string} addButtonText - Texto do botão de adicionar
 * @param {boolean} showAddButton - Se deve mostrar o botão de adicionar
 * @param {React.ReactNode} children - Elementos adicionais no cabeçalho
 */
export function PageHeader({ 
  title, 
  subtitle, 
  onAdd, 
  addButtonText = "Adicionar", 
  showAddButton = true,
  children 
}) {
  return (
    <Box className={styles.Header}>
      <Box className={styles.TitleSection}>
        <Typography variant="h4" component="h1" className={styles.Title}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" className={styles.Subtitle}>
            {subtitle}
          </Typography>
        )}
      </Box>
      
      <Box className={styles.ActionsSection}>
        {children}
        {showAddButton && onAdd && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
            className={styles.AddButton}
          >
            {addButtonText}
          </Button>
        )}
      </Box>
    </Box>
  );
}

