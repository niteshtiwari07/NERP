import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="w-full animate-pulse p-4 space-y-3">
      <div className="h-8 bg-slate-200 rounded w-full mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-slate-100">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-4 bg-slate-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="card-panel p-5 animate-pulse space-y-3">
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="h-7 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  );
};
