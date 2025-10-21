// Configurações da aplicação
export const config = {
  // URL base da API
  API_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  
  // Configurações da aplicação
  APP_NAME: import.meta.env.VITE_APP_NAME || 'ERP Sistema',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Configurações de desenvolvimento
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 segundos
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes do token expirar
};

// Função para verificar se estamos em desenvolvimento
export const isDevelopment = () => config.IS_DEVELOPMENT;

// Função para verificar se estamos em produção
export const isProduction = () => config.IS_PRODUCTION;
