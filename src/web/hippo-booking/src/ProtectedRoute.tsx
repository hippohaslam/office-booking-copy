
import React from 'react';
import { useUser } from './contexts/UserContext';
import { Navigate, useLocation } from 'react-router-dom';

type ProtectedRouteProps = {
    children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = useUser();
  const location = useLocation();

  if (!user.user) {
    return <Navigate to={`/signin?returnUrl=${encodeURI(location.pathname)}`} />;
  }

  return children;
};

export default ProtectedRoute;