import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);
  const location = useLocation();

  if (initializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};



