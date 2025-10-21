import { Box, CircularProgress, Typography } from '@mui/material';
import styles from './Loading.module.css';

export function Loading({ 
  size = 40, 
  message = 'Carregando...', 
  fullScreen = false,
  overlay = false 
}) {
  const containerClass = fullScreen 
    ? styles.FullScreenContainer 
    : styles.Container;
  
  const contentClass = overlay 
    ? styles.OverlayContent 
    : styles.Content;

  return (
    <Box className={containerClass}>
      <Box className={contentClass}>
        <CircularProgress 
          size={size} 
          className={styles.Spinner}
        />
        {message && (
          <Typography 
            variant="body1" 
            className={styles.Message}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function LoadingOverlay({ loading, children, message = 'Carregando...' }) {
  return (
    <Box className={styles.RelativeContainer}>
      {children}
      {loading && (
        <Box className={styles.Overlay}>
          <Loading message={message} overlay={true} />
        </Box>
      )}
    </Box>
  );
}
