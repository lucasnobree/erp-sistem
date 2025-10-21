import { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../../shared/services/apiService';

// Estados possíveis da autenticação
const AuthState = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error'
};

// Ações do reducer
const AuthActions = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER'
};

// Estado inicial
const initialState = {
  status: AuthState.IDLE,
  user: null,
  token: null,
  error: null,
  isLoading: false
};

// Reducer para gerenciar o estado de autenticação
function authReducer(state, action) {
  switch (action.type) {
    case AuthActions.SET_LOADING:
      return {
        ...state,
        status: AuthState.LOADING,
        isLoading: true,
        error: null
      };
    
    case AuthActions.SET_AUTHENTICATED:
      return {
        ...state,
        status: AuthState.AUTHENTICATED,
        isLoading: false,
        token: action.payload.token,
        user: action.payload.user,
        error: null
      };
    
    case AuthActions.SET_UNAUTHENTICATED:
      return {
        ...state,
        status: AuthState.UNAUTHENTICATED,
        isLoading: false,
        token: null,
        user: null,
        error: null
      };
    
    case AuthActions.SET_ERROR:
      return {
        ...state,
        status: AuthState.ERROR,
        isLoading: false,
        error: action.payload
      };
    
    case AuthActions.SET_USER:
      return {
        ...state,
        user: action.payload
      };
    
    default:
      return state;
  }
}

// Criar o contexto
const AuthContext = createContext();

// Provider do contexto de autenticação
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar se há token salvo ao inicializar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verificar se o token ainda é válido
      verifyToken(token);
    } else {
      dispatch({ type: AuthActions.SET_UNAUTHENTICATED });
    }
  }, []);

  // Função para verificar se o token é válido
  const verifyToken = async (token) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING });
      
      // Verificar token com a API
      const response = await apiService.verifyToken(token);
      
      if (response.ok) {
        // Buscar dados do usuário
        const userResponse = await apiService.getCurrentUser(token);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          dispatch({
            type: AuthActions.SET_AUTHENTICATED,
            payload: { token, user: userData }
          });
        } else {
          throw new Error('Erro ao buscar dados do usuário');
        }
      } else {
        throw new Error('Token inválido');
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      dispatch({ type: AuthActions.SET_UNAUTHENTICATED });
    }
  };

  // Função de login
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING });
      
      const response = await apiService.login(credentials);
      const data = await response.json();
      
      if (response.ok) {
        const { access, refresh } = data;
        
        // Salvar tokens no localStorage
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Buscar dados do usuário
        const userResponse = await apiService.getCurrentUser(access);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          dispatch({
            type: AuthActions.SET_AUTHENTICATED,
            payload: { token: access, user: userData }
          });
          return { success: true };
        } else {
          throw new Error('Erro ao buscar dados do usuário');
        }
      } else {
        const errorMessage = data.detail || 'Erro ao fazer login';
        dispatch({ type: AuthActions.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = error.message || 'Erro de conexão';
      dispatch({ type: AuthActions.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Função de registro
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActions.SET_LOADING });
      
      const response = await apiService.register(userData);
      const data = await response.json();
      
      if (response.ok) {
        // Após registro bem-sucedido, fazer login automaticamente
        return await login({
          username: userData.username,
          password: userData.password
        });
      } else {
        const errorMessage = data.username?.[0] || data.email?.[0] || data.password?.[0] || 'Erro ao criar conta';
        dispatch({ type: AuthActions.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      const errorMessage = error.message || 'Erro de conexão';
      dispatch({ type: AuthActions.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch({ type: AuthActions.SET_UNAUTHENTICATED });
  };

  // Função para atualizar dados do usuário
  const updateUser = (userData) => {
    dispatch({ type: AuthActions.SET_USER, payload: userData });
  };

  // Função para limpar erros
  const clearError = () => {
    dispatch({ type: AuthActions.SET_ERROR, payload: null });
  };

  // Função para refresh do token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await apiService.refreshToken(refreshTokenValue);
      const data = await response.json();
      
      if (response.ok) {
        const { access } = data;
        localStorage.setItem('access_token', access);
        
        // Atualizar o token no estado
        dispatch({
          type: AuthActions.SET_AUTHENTICATED,
          payload: { token: access, user: state.user }
        });
        
        return access;
      } else {
        throw new Error('Erro ao renovar token');
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      logout();
      throw error;
    }
  };

  const value = {
    // Estado
    ...state,
    isAuthenticated: state.status === AuthState.AUTHENTICATED,
    isIdle: state.status === AuthState.IDLE,
    
    // Ações
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export { AuthState, AuthActions };
