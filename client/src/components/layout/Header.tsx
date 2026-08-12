import React from 'react';
import { Menu, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'SALES':
        return 'info';
      case 'WAREHOUSE':
        return 'warning';
      case 'ACCOUNTS':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="md:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-semibold text-slate-800 hidden sm:block">
          NERP Operations Portal
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <div className="flex items-center space-x-2.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">{user.email}</p>
            </div>
            <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
              <Shield className="w-3 h-3 mr-1 inline" />
              {user.role}
            </Badge>
          </div>
        )}

        <button
          onClick={logout}
          title="Logout"
          className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium text-slate-700 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
