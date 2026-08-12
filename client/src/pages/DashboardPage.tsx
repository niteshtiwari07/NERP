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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Executive Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Overview of inventory, sales challans & CRM follow-ups</p>
        </div>

        <Link
          to="/challans/create"
          className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded shadow-sm transition-colors self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>New Sales Challan</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Customers */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Customers</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalCustomers || 0}</h3>
            <span className="inline-flex items-center text-xs text-emerald-700 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> {stats?.activeCustomers || 0} Active
            </span>
          </div>
          <div className="p-2.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalProducts || 0}</h3>
            <span className="inline-flex items-center text-xs text-slate-500 font-medium mt-1">
              <Boxes className="w-3.5 h-3.5 mr-1" /> Master SKUs
            </span>
          </div>
          <div className="p-2.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Low Stock Warning */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats?.lowStockProductsCount || 0}</h3>
            <span className="inline-flex items-center text-xs text-amber-700 font-medium mt-1">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Reorder Alert
            </span>
          </div>
          <div className="p-2.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Sales Challans */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Challans</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalChallans || 0}</h3>
            <span className="inline-flex items-center text-xs text-slate-500 font-medium mt-1">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {stats?.draftChallans || 0} Drafts / {stats?.confirmedChallans || 0} Confirmed
            </span>
          </div>
          <div className="p-2.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Challans */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Sales Challans</h3>
                <p className="text-xs text-slate-500">Latest dispatch orders</p>
              </div>
              <Link
                to="/challans"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center"
              >
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Challan #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data?.recentChallans && data.recentChallans.length > 0 ? (
                    data.recentChallans.map((challan) => (
                      <tr key={challan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600">
                          {challan.challanNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-medium text-slate-900">{challan.customer?.customerName}</p>
                          <p className="text-[11px] text-slate-500">{challan.customer?.businessName}</p>
                        </td>
                        <td className="py-2.5 px-3">
                          <ChallanStatusBadge status={challan.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                          ₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            to={`/challans/${challan.id}`}
                            className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors inline-block"
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
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Low Stock Warning</h3>
                  <p className="text-xs text-slate-500">Products where Current Stock ≤ Minimum Threshold</p>
                </div>
              </div>
              <Link
                to="/inventory?lowStock=true"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center"
              >
                Manage Inventory <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                data.lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded border border-rose-200 bg-rose-50/50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{prod.name}</h4>
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                        SKU: {prod.sku} | Bay: {prod.warehouseLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-700 block">
                        {prod.currentStock} / {prod.minimumStock} min
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-3 text-emerald-700 text-xs font-medium bg-emerald-50 rounded border border-emerald-200">
                  ✓ All product inventory levels are healthy.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming CRM Follow-ups */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Upcoming Follow-ups</h3>
                <p className="text-xs text-slate-500">Scheduled client calls</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {data?.upcomingFollowUps && data.upcomingFollowUps.length > 0 ? (
                data.upcomingFollowUps.map((cust) => (
                  <Link
                    key={cust.id}
                    to={`/customers/${cust.id}`}
                    className="block p-3 rounded border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">{cust.customerName}</h4>
                        <p className="text-[11px] text-slate-500">{cust.businessName}</p>
                      </div>
                      <CustomerStatusBadge status={cust.status} />
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="inline-flex items-center font-mono">
                        <PhoneCall className="w-3 h-3 mr-1 text-slate-400" />
                        {cust.mobile}
                      </span>
                      <span className="font-mono text-indigo-700 font-medium">
                        {cust.followUpDate ? new Date(cust.followUpDate).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
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
