
import { useUser } from './contexts/UserContext';
import { Navigate, useLocation } from 'react-router-dom';

type ProtectedRouteProps = {
    children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const userContext = useUser();
  const location = useLocation();

  if(!userContext.user) {
    return <Navigate to={`/signin?returnUrl=${encodeURI(location.pathname)}`} />;
  }

  return children;
};

const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const userContext = useUser();

  if(!userContext.user) {
    return <Navigate to={`/signin?returnUrl=${encodeURI(location.pathname)}`} />;
  }

  if(!userContext.user.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}

export {ProtectedRoute, AdminProtectedRoute};