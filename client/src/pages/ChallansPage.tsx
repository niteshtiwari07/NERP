import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challanService } from '../services/challanService';
import type { SalesChallan, ChallanStatus } from '../types/models';
import { ChallanStatusBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { Search, Plus, FileText, Eye, Building } from 'lucide-react';

export const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { hasRole } = useAuth();

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await challanService.getChallans({
        page,
        limit: 10,
        search,
        status: (statusFilter as ChallanStatus) || undefined,
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales Delivery Challans</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage wholesale dispatch challans & stock deductions</p>
        </div>

        {hasRole('ADMIN', 'SALES') && (
          <Link
            to="/challans/create"
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sales Challan</span>
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by challan # or customer business name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : challans.length === 0 ? (
          <EmptyState
            title="No Sales Challans Found"
            description="No delivery challans match your search parameters."
            icon={<FileText className="w-6 h-6 text-slate-400" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase">
                  <th className="py-3 px-4">Challan #</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Total Quantity</th>
                  <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {challans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      <Link to={`/challans/${c.id}`}>{c.challanNumber}</Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{c.customer?.customerName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                        <Building className="w-3 h-3 mr-1 text-slate-400" />
                        {c.customer?.businessName}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <ChallanStatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">
                      {c.totalQuantity} items
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{Number(c.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/challans/${c.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded border border-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
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
