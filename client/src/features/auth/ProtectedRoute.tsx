import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500 mr-3" />
        <span>Verifying Security Session...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-rose-800/60 max-w-md mx-auto my-12">
        <h3 className="text-lg font-bold text-rose-400">403 Access Denied</h3>
        <p className="text-sm text-slate-300 mt-2">
          Your account role (<strong className="font-mono">{user.role}</strong>) does not have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
};
