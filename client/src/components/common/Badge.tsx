import React from 'react';
import type { CustomerStatus, CustomerType, ChallanStatus } from '../../types/models';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-500/30',
    info: 'bg-sky-950/70 text-sky-300 border-sky-500/30',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-500/30',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const CustomerStatusBadge: React.FC<{ status: CustomerStatus }> = ({ status }) => {
  const map = {
    LEAD: { variant: 'info' as const, label: 'Lead' },
    ACTIVE: { variant: 'success' as const, label: 'Active' },
    INACTIVE: { variant: 'danger' as const, label: 'Inactive' },
  };
  const conf = map[status] || { variant: 'default' as const, label: status };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const CustomerTypeBadge: React.FC<{ type: CustomerType }> = ({ type }) => {
  const map = {
    RETAIL: { variant: 'default' as const, label: 'Retail' },
    WHOLESALE: { variant: 'purple' as const, label: 'Wholesale' },
    DISTRIBUTOR: { variant: 'info' as const, label: 'Distributor' },
  };
  const conf = map[type] || { variant: 'default' as const, label: type };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const ChallanStatusBadge: React.FC<{ status: ChallanStatus }> = ({ status }) => {
  const map = {
    DRAFT: { variant: 'warning' as const, label: 'Draft' },
    CONFIRMED: { variant: 'success' as const, label: 'Confirmed' },
    CANCELLED: { variant: 'danger' as const, label: 'Cancelled' },
  };
  const conf = map[status] || { variant: 'default' as const, label: status };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
};

export const StockBadge: React.FC<{ stock: number; minStock: number }> = ({ stock, minStock }) => {
  if (stock <= minStock) {
    return (
      <Badge variant="danger" className="animate-pulse">
        Low Stock ({stock})
      </Badge>
    );
  }
  return <Badge variant="success">In Stock ({stock})</Badge>;
};
