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
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-lg font-semibold text-white tracking-wide hidden sm:block">
          NERP Operations Portal
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-brand-600/30 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-1">{user.email}</p>
            </div>
            <Badge variant={getRoleBadgeVariant(user.role)} size="sm" className="font-mono">
              <Shield className="w-3 h-3 mr-1 inline" />
              {user.role}
            </Badge>
          </div>
        )}

        <button
          onClick={logout}
          title="Logout"
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
