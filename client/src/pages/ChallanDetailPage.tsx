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
} from 'lucide-react';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<SalesChallan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchChallan = async () => {
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
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await challanService.confirmChallan(id);
      showSuccess(
        'Challan Confirmed',
        'Sales Challan confirmed and product stock deducted from inventory.'
      );
      fetchChallan();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to confirm challan.';
      showError('Stock Deduction Failed', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to cancel this sales challan?')) return;
    setActionLoading(true);
    try {
      await challanService.cancelChallan(id);
      showSuccess('Challan Cancelled', 'Sales challan status set to CANCELLED.');
      fetchChallan();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel challan.';
      showError('Error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (!challan) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs">
        Sales challan record not found.
        <div className="mt-4">
          <Link to="/challans" className="text-indigo-600 font-semibold underline">
            Back to Sales Challans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/challans"
          className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sales Challans</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          {challan.status === 'DRAFT' && hasRole('ADMIN', 'SALES', 'WAREHOUSE') && (
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{actionLoading ? 'Processing...' : 'Confirm & Deduct Stock'}</span>
            </button>
          )}

          {challan.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Challan</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Invoice / Delivery Challan Document */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-indigo-600 text-white">
                <Building className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">NERP Operations Ltd</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Wholesale & Industrial Distribution</p>
            <p className="text-[11px] text-slate-400">Plot 45, Industrial Zone Phase 1, Mumbai 400001</p>
          </div>

          <div className="text-right">
            <div className="inline-block">
              <ChallanStatusBadge status={challan.status} />
            </div>
            <h2 className="text-lg font-bold font-mono text-indigo-600 mt-2">
              {challan.challanNumber}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Date: {new Date(challan.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Customer & Order Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-5">
          <div>
            <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Dispatch To (Customer):
            </p>
            <h3 className="text-sm font-bold text-slate-900">{challan.customer?.customerName}</h3>
            <p className="font-semibold text-slate-700">{challan.customer?.businessName}</p>
            <p className="text-slate-600 mt-1 leading-relaxed">{challan.customer?.address}</p>
            <p className="text-slate-600 font-mono mt-1">
              Mobile: {challan.customer?.mobile} | Email: {challan.customer?.email}
            </p>
            {challan.customer?.gstNumber && (
              <p className="text-slate-700 font-mono font-semibold mt-1">
                GSTIN: {challan.customer?.gstNumber}
              </p>
            )}
          </div>

          <div className="sm:text-right space-y-1">
            <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Document Audit Details:
            </p>
            <p className="text-slate-700">
              Generated By: <strong className="text-slate-900">{challan.creator?.name}</strong> ({challan.creator?.role})
            </p>
            <p className="text-slate-600">
              Issuer Email: <span className="font-mono">{challan.creator?.email}</span>
            </p>
            <p className="text-slate-600 font-mono">
              Timestamp: {new Date(challan.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Dispatched Line Items
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Unit Price (₹)</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {challan.items?.map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productNameSnapshot}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{item.skuSnapshot}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{Number(item.unitPriceSnapshot).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary Card */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Quantity:</span>
              <span className="font-mono font-bold text-slate-900">{challan.totalQuantity} items</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="font-mono text-indigo-600">
                ₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Signature & Stamp Section */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">Receiver's Signature & Stamp:</p>
            <div className="h-12 border-b border-slate-300 mt-2" />
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-700">Authorized Signatory (NERP Operations):</p>
            <div className="h-12 border-b border-slate-300 mt-2" />
          </div>
        </div>

        {/* Audit Footer */}
        <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between font-mono">
          <span>NERP Operations Portal — Internal Audit Document</span>
          <span>ID: {challan.id}</span>
        </div>
      </div>
    </div>
  );
};
