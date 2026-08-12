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
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
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
      <Badge variant="danger">
        Low Stock ({stock})
      </Badge>
    );
  }
  return <Badge variant="success">In Stock ({stock})</Badge>;
};
