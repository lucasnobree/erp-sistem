import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/AuthContext';
import { Loading } from '../Loading/Loading';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, isIdle } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading || isIdle) {
    return <Loading fullScreen message="Verificando autenticação..." />;
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderizar o componente
  return children;
}
