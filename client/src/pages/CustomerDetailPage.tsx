import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import type { Customer } from '../types/models';
import { CustomerStatusBadge, CustomerTypeBadge, ChallanStatusBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  PlusCircle,
  FileText,
  Clock,
  User,
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Follow-up form
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchCustomerDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await customerService.getCustomerById(id);
      setCustomer(res);
      if (res.followUpDate) {
        setFollowUpDate(new Date(res.followUpDate).toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Failed to load customer detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !followUpDate || !id) {
      showError('Please fill in both the note and follow-up date.');
      return;
    }
    setSubmitting(true);
    try {
      await customerService.addFollowUp(id, note, followUpDate);
      showSuccess('Follow-up Note Added', 'Customer history and next follow-up date updated.');
      setNote('');
      fetchCustomerDetail();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add follow-up note.';
      showError('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12 text-slate-500">
        Customer not found.
        <div className="mt-4">
          <Link to="/customers" className="text-indigo-600 font-semibold underline">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/customers"
          className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers</span>
        </Link>
      </div>

      {/* Customer Overview Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold text-slate-900">{customer.customerName}</h2>
              <CustomerStatusBadge status={customer.status} />
              <CustomerTypeBadge type={customer.customerType} />
            </div>
            <p className="text-xs font-medium text-slate-500 flex items-center mt-0.5">
              <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {customer.businessName}
              {customer.gstNumber && (
                <span className="ml-2 font-mono text-[11px] text-slate-400">GSTIN: {customer.gstNumber}</span>
              )}
            </p>
          </div>

          {hasRole('ADMIN', 'SALES') && (
            <Link
              to={`/challans/create?customerId=${customer.id}`}
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded transition-colors self-start sm:self-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Create Sales Challan</span>
            </Link>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div className="space-y-1.5">
            <p className="font-semibold text-slate-500 uppercase">Contact Information</p>
            <p className="flex items-center text-slate-900 font-mono">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {customer.mobile}
            </p>
            <p className="flex items-center text-slate-600">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              {customer.email}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="font-semibold text-slate-500 uppercase">Address Location</p>
            <p className="flex items-start text-slate-700 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0 mt-0.5" />
              {customer.address}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="font-semibold text-slate-500 uppercase">Upcoming Follow-up</p>
            <p className="flex items-center text-amber-700 font-medium font-mono">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'No follow-up set'}
            </p>
            {customer.notes && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                "{customer.notes}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: CRM Follow-up History & Recent Challans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Follow-up History Timeline & Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Follow-up Form */}
          {hasRole('ADMIN', 'SALES') && (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                <PlusCircle className="w-4 h-4 mr-1.5 text-indigo-600" />
                Add Follow-up Note & Update Schedule
              </h3>

              <form onSubmit={handleAddFollowUp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Discussion Summary *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Key discussion notes, client feedback, terms..."
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Next Follow-up Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded transition-colors self-end disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Post Follow-up Note'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Follow-up Timeline */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-indigo-600" />
              Follow-Up Activity Log
            </h3>

            {customer.followUps && customer.followUps.length > 0 ? (
              <div className="relative border-l border-slate-200 ml-2 space-y-4 pl-4">
                {customer.followUps.map((f) => (
                  <div key={f.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white" />
                    
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center font-medium text-slate-900">
                          <User className="w-3 h-3 mr-1 text-slate-400" />
                          {f.creator?.name || 'Sales Rep'}
                        </span>
                        <span className="font-mono text-[11px]">
                          {new Date(f.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-slate-800 leading-relaxed">{f.note}</p>

                      <div className="text-[11px] text-amber-700 font-mono pt-0.5">
                        Next Call: {new Date(f.followUpDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No follow-up notes logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Account Challans */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-indigo-600" />
              Recent Account Challans
            </h3>

            {customer.challans && customer.challans.length > 0 ? (
              <div className="space-y-2">
                {customer.challans.map((c) => (
                  <Link
                    key={c.id}
                    to={`/challans/${c.id}`}
                    className="block p-3 rounded border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-indigo-600">
                        {c.challanNumber}
                      </span>
                      <ChallanStatusBadge status={c.status} />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-xs text-slate-700">
                      <span>Qty: {c.totalQuantity} items</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{Number(c.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                No sales challans for this customer account.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
