import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import type { DashboardStats } from '../types/models';
import { CardSkeleton } from '../components/common/Skeleton';
import { CustomerStatusBadge, ChallanStatusBadge } from '../components/common/Badge';
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  PhoneCall,
  Boxes,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const stats = await dashboardService.getStats();
        setData(stats);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time overview of inventory, sales challans & CRM follow-ups</p>
        </div>

        <Link
          to="/challans/create"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all self-start md:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>New Sales Challan</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Customers */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalCustomers || 0}</h3>
            <span className="inline-flex items-center text-xs text-emerald-400 font-medium mt-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> {stats?.activeCustomers || 0} Active Accounts
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalProducts || 0}</h3>
            <span className="inline-flex items-center text-xs text-slate-400 font-medium mt-2">
              <Boxes className="w-3.5 h-3.5 mr-1 text-slate-400" /> Catalog SKUs
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Low Stock Alert */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">{stats?.lowStockProductsCount || 0}</h3>
            <span className="inline-flex items-center text-xs text-amber-400 font-medium mt-2">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Reorder required
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Sales Challans */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Challans</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stats?.totalChallans || 0}</h3>
            <span className="inline-flex items-center text-xs text-slate-400 font-medium mt-2">
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" /> {stats?.draftChallans || 0} Drafts / {stats?.confirmedChallans || 0} Confirmed
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Challans */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Recent Sales Challans</h3>
                <p className="text-xs text-slate-400">Latest sales orders and confirmation status</p>
              </div>
              <Link
                to="/challans"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-3">Challan #</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Amount (₹)</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {data?.recentChallans && data.recentChallans.length > 0 ? (
                    data.recentChallans.map((challan) => (
                      <tr key={challan.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-brand-400">
                          {challan.challanNumber}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-white">{challan.customer?.customerName}</p>
                          <p className="text-xs text-slate-500">{challan.customer?.businessName}</p>
                        </td>
                        <td className="py-3 px-3">
                          <ChallanStatusBadge status={challan.status} />
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                          ₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/challans/${challan.id}`}
                            className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors inline-block"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                        No sales challans recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Warning Section */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-base font-semibold text-white">Critical Low Stock Warning</h3>
                  <p className="text-xs text-slate-400">Products where Current Stock ≤ Minimum Threshold</p>
                </div>
              </div>
              <Link
                to="/inventory?lowStock=true"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center"
              >
                Manage Inventory <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                data.lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{prod.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        SKU: {prod.sku} | Location: {prod.warehouseLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400 block">
                        {prod.currentStock} / {prod.minimumStock} min
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Stock Level</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-emerald-400 text-xs font-semibold">
                  ✓ All products are healthy above minimum stock thresholds.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming CRM Follow-ups */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-brand-400" />
              <div>
                <h3 className="text-base font-semibold text-white">Upcoming CRM Follow-ups</h3>
                <p className="text-xs text-slate-400">Scheduled sales calls & client tasks</p>
              </div>
            </div>

            <div className="space-y-3">
              {data?.upcomingFollowUps && data.upcomingFollowUps.length > 0 ? (
                data.upcomingFollowUps.map((cust) => (
                  <Link
                    key={cust.id}
                    to={`/customers/${cust.id}`}
                    className="block p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                          {cust.customerName}
                        </h4>
                        <p className="text-xs text-slate-400">{cust.businessName}</p>
                      </div>
                      <CustomerStatusBadge status={cust.status} />
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                      <span className="inline-flex items-center text-amber-300">
                        <PhoneCall className="w-3.5 h-3.5 mr-1" />
                        {cust.mobile}
                      </span>
                      <span className="font-mono text-slate-400">
                        {cust.followUpDate ? new Date(cust.followUpDate).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No upcoming CRM follow-ups scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
