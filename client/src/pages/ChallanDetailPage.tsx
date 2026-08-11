import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challanService } from '../services/challanService';
import type { SalesChallan } from '../types/models';
import { ChallanStatusBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  XCircle,
  Building,
  User,
  Calendar,
} from 'lucide-react';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<SalesChallan | null>(null);
  const [loading, setLoading] = useState(true);

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchChallanDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await challanService.getChallanById(id);
      setChallan(res);
    } catch (err) {
      console.error('Failed to load challan detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallanDetail();
  }, [id]);

  const handleConfirm = async () => {
    if (!challan) return;
    if (!window.confirm(`Confirm Sales Challan ${challan.challanNumber}? This will deduct inventory stock.`)) {
      return;
    }
    try {
      await challanService.confirmChallan(challan.id);
      showSuccess(
        'Sales Challan Confirmed',
        `Inventory stock has been deducted and ${challan.challanNumber} is marked as CONFIRMED.`
      );
      fetchChallanDetail();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to confirm sales challan due to stock constraint.';
      showError('Confirmation Blocked (Insufficient Stock)', msg);
    }
  };

  const handleCancel = async () => {
    if (!challan) return;
    if (!window.confirm(`Are you sure you want to CANCEL sales challan ${challan.challanNumber}?`)) {
      return;
    }
    try {
      await challanService.cancelChallan(challan.id);
      showSuccess('Challan Cancelled', `Sales challan ${challan.challanNumber} cancelled.`);
      fetchChallanDetail();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel sales challan.';
      showError('Cancellation Error', msg);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="text-center py-12 text-slate-400">
        Sales challan not found.
        <div className="mt-4">
          <Link to="/challans" className="text-brand-400 font-semibold underline">
            Back to Sales Challans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:p-0">
      {/* Top Header & Actions (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/challans"
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sales Challans</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Challan</span>
          </button>

          {challan.status === 'DRAFT' && hasRole('ADMIN', 'SALES', 'WAREHOUSE') && (
            <button
              onClick={handleConfirm}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm & Deduct Stock</span>
            </button>
          )}

          {challan.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Challan</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Challan Document */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-8 bg-slate-900 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 print:border-slate-300 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl font-mono font-bold text-white tracking-tight print:text-slate-900">
                {challan.challanNumber}
              </h2>
              <ChallanStatusBadge status={challan.status} />
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Wholesale Dispatch & Delivery Challan
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono space-y-1">
            <p className="flex items-center justify-end">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Issue Date: {new Date(challan.createdAt).toLocaleDateString()}
            </p>
            <p className="flex items-center justify-end">
              <User className="w-3.5 h-3.5 mr-1" />
              Created By: {challan.creator?.name || 'Sales Representative'}
            </p>
          </div>
        </div>

        {/* Customer Information Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Customer Billed To</p>
            <h3 className="text-lg font-bold text-white print:text-slate-900">{challan.customer?.customerName}</h3>
            <p className="text-sm font-medium text-brand-400 print:text-slate-700 flex items-center mt-0.5">
              <Building className="w-4 h-4 mr-1.5" />
              {challan.customer?.businessName}
            </p>
            {challan.customer?.gstNumber && (
              <p className="text-xs font-mono text-slate-400 print:text-slate-600 mt-1">
                GSTIN: {challan.customer.gstNumber}
              </p>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 print:text-slate-700 md:text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contact & Shipping Address</p>
            <p className="font-mono">{challan.customer?.mobile}</p>
            <p>{challan.customer?.email}</p>
            <p className="max-w-xs md:ml-auto leading-relaxed text-slate-400 print:text-slate-600">
              {challan.customer?.address}
            </p>
          </div>
        </div>

        {/* Product Items Table (Product Snapshot Information) */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 print:text-slate-800 uppercase tracking-wider mb-3">
            Itemized Products (Snapshot Preserved)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 bg-slate-950/80 print:bg-slate-100 text-xs font-semibold text-slate-400 print:text-slate-700 uppercase">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Product Name (Snapshot)</th>
                  <th className="py-3 px-4">SKU (Snapshot)</th>
                  <th className="py-3 px-4 text-right">Unit Price Snapshot (₹)</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Line Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-slate-300 print:text-slate-900">
                {challan.items?.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/20 print:hover:bg-transparent">
                    <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-white print:text-slate-900">
                      {item.productNameSnapshot}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-brand-400 print:text-slate-700">
                      {item.skuSnapshot}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      ₹{Number(item.unitPriceSnapshot).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-white print:text-slate-900">
                      ₹{Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grand Total Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-xl bg-slate-950/80 border border-slate-800 print:bg-slate-100 print:border-slate-300">
          <div className="text-xs text-slate-400 print:text-slate-600">
            <p>Total Items Dispatched: <strong className="text-white print:text-slate-900">{challan.totalQuantity} units</strong></p>
            <p className="mt-0.5">Status: <strong className="text-slate-200 print:text-slate-800">{challan.status}</strong></p>
          </div>

          <div className="mt-4 sm:mt-0 text-right">
            <span className="text-xs text-slate-400 print:text-slate-600 block uppercase font-semibold">Grand Total Amount</span>
            <span className="text-2xl font-mono font-bold text-brand-400 print:text-slate-900">
              ₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Audit Notice */}
        <div className="text-[11px] text-slate-500 print:text-slate-600 border-t border-slate-800 print:border-slate-300 pt-4 flex items-center justify-between">
          <span>NERP Operations System - Audit Logged Document</span>
          <span className="font-mono">ID: {challan.id}</span>
        </div>
      </div>
    </div>
  );
};
