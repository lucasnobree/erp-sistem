import { useState, createContext, useContext } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

// Context para notificações
const NotificationContext = createContext();

// Provider do contexto de notificações
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info', title = null, duration = 6000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      title,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remover após a duração especificada
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, title = 'Sucesso') => {
    showNotification(message, 'success', title);
  };

  const showError = (message, title = 'Erro') => {
    showNotification(message, 'error', title, 8000);
  };

  const showWarning = (message, title = 'Atenção') => {
    showNotification(message, 'warning', title);
  };

  const showInfo = (message, title = 'Informação') => {
    showNotification(message, 'info', title);
  };

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Renderizar todas as notificações */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.title && (
              <AlertTitle>{notification.title}</AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}

// Hook para usar notificações
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
}
