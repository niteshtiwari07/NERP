import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  PlusCircle,
  X,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { hasRole } = useAuth();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Customers & CRM',
      path: '/customers',
      icon: <Users className="w-5 h-5" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Product Catalog',
      path: '/products',
      icon: <Package className="w-5 h-5" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Stock & Inventory',
      path: '/inventory',
      icon: <Boxes className="w-5 h-5" />,
      roles: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'],
    },
    {
      label: 'Sales Challans',
      path: '/challans',
      icon: <FileText className="w-5 h-5" />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      label: 'Create Challan',
      path: '/challans/create',
      icon: <PlusCircle className="w-5 h-5" />,
      roles: ['ADMIN', 'SALES'],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide text-lg">NERP</span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                CRM Portal
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems
            .filter((item) => hasRole(...item.roles))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Enterprise Operations</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Role-Based Secured Portal</p>
          </div>
        </div>
      </aside>
    </>
  );
};
