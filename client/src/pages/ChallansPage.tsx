import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challanService } from '../services/challanService';
import type { SalesChallan } from '../types/models';
import { ChallanStatusBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Search, Plus, FileText, CheckCircle, XCircle, Eye, Building } from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await challanService.getChallans({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      });
      setChallans(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
    } catch (err) {
      console.error('Failed to fetch challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, search, statusFilter]);

  const handleConfirmChallan = async (id: string, challanNumber: string) => {
    if (!window.confirm(`Are you sure you want to CONFIRM challan ${challanNumber}? This will deduct product stock.`)) {
      return;
    }
    try {
      await challanService.confirmChallan(id);
      showSuccess('Challan Confirmed', `Stock deducted and ${challanNumber} marked as CONFIRMED.`);
      fetchChallans();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to confirm sales challan due to stock constraint.';
      showError('Confirmation Failed (Insufficient Stock)', msg);
    }
  };

  const handleCancelChallan = async (id: string, challanNumber: string) => {
    if (!window.confirm(`Are you sure you want to CANCEL challan ${challanNumber}?`)) {
      return;
    }
    try {
      await challanService.cancelChallan(id);
      showSuccess('Challan Cancelled', `${challanNumber} marked as CANCELLED.`);
      fetchChallans();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel sales challan.';
      showError('Cancellation Error', msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sales Challans Management</h2>
          <p className="text-sm text-slate-400 mt-1">Track dispatch challans, stock commitments & invoice confirmations</p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <Link
            to="/challans/create"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sales Challan</span>
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by challan number, customer name, or business..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : challans.length === 0 ? (
          <EmptyState
            title="No Sales Challans Found"
            description="No sales challans match your search filter."
            icon={<FileText className="w-8 h-8 text-brand-400" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Challan Number</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Items Count</th>
                  <th className="py-3.5 px-4 text-right">Total Amount (₹)</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {challans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/challans/${c.id}`}
                        className="font-mono font-bold text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        {c.challanNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.customer?.customerName}</div>
                      <div className="flex items-center text-xs text-slate-400 mt-0.5">
                        <Building className="w-3 h-3 mr-1 text-slate-500" />
                        {c.customer?.businessName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <ChallanStatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                      {c.totalQuantity} units
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{Number(c.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/challans/${c.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>

                      {c.status === 'DRAFT' && hasRole('ADMIN', 'SALES', 'WAREHOUSE') && (
                        <button
                          onClick={() => handleConfirmChallan(c.id, c.challanNumber)}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 px-2.5 py-1.5 rounded-lg border border-emerald-800/40 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                      )}

                      {c.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
                        <button
                          onClick={() => handleCancelChallan(c.id, c.challanNumber)}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 px-2.5 py-1.5 rounded-lg border border-rose-800/40 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
};
