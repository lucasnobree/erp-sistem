import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de erro
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback
      return (
        <Box className={styles.Container}>
          <Paper className={styles.ErrorPaper} elevation={3}>
            <Box className={styles.ErrorContent}>
              <ErrorOutline className={styles.ErrorIcon} />
              
              <Typography variant="h5" className={styles.ErrorTitle}>
                Oops! Algo deu errado
              </Typography>
              
              <Typography variant="body1" className={styles.ErrorMessage}>
                Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box className={styles.ErrorDetails}>
                  <Typography variant="h6" className={styles.ErrorDetailsTitle}>
                    Detalhes do erro (desenvolvimento):
                  </Typography>
                  <Typography variant="body2" className={styles.ErrorDetailsText}>
                    {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="body2" className={styles.ErrorDetailsText}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Box>
              )}

              <Box className={styles.ErrorActions}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  className={styles.RetryButton}
                >
                  Tentar Novamente
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  className={styles.ReloadButton}
                >
                  Recarregar Página
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
