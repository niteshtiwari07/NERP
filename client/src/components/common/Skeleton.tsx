import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-slate-800/80 rounded-t-xl mb-2" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-slate-800/60">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-4 bg-slate-800/50 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 animate-pulse space-y-4">
      <div className="h-4 bg-slate-800 rounded w-1/3" />
      <div className="h-8 bg-slate-800 rounded w-1/2" />
      <div className="h-3 bg-slate-800 rounded w-2/3" />
    </div>
  );
};
