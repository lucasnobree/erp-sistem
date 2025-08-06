import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import styles from "./DataCard.module.css";

/**
 * Componente de card reutilizável para exibir dados
 * @param {string} title - Título do card
 * @param {string|number} value - Valor principal a ser exibido
 * @param {string} subtitle - Subtítulo ou descrição
 * @param {React.ReactNode} icon - Ícone do card
 * @param {string} trend - Tendência (up, down, neutral)
 * @param {string} trendValue - Valor da tendência
 * @param {function} onMenuClick - Função chamada ao clicar no menu
 * @param {React.ReactNode} children - Conteúdo adicional
 */
export function DataCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  onMenuClick,
  children 
}) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#4caf50';
      case 'down': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <Card className={styles.Card}>
      <CardContent className={styles.Content}>
        <Box className={styles.Header}>
          <Box className={styles.IconContainer}>
            {icon}
          </Box>
          {onMenuClick && (
            <IconButton size="small" onClick={onMenuClick}>
              <MoreVert />
            </IconButton>
          )}
        </Box>
        
        <Typography variant="h4" className={styles.Value}>
          {value}
        </Typography>
        
        <Typography variant="h6" className={styles.Title}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" className={styles.Subtitle}>
            {subtitle}
          </Typography>
        )}
        
        {trend && trendValue && (
          <Box className={styles.Trend}>
            <Typography 
              variant="body2" 
              style={{ color: getTrendColor() }}
            >
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </Typography>
          </Box>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
}

