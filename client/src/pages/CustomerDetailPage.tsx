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
      <div className="text-center py-12 text-slate-400">
        Customer not found.
        <div className="mt-4">
          <Link to="/customers" className="text-brand-400 font-semibold underline">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/customers"
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers List</span>
        </Link>
      </div>

      {/* Customer Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">{customer.customerName}</h2>
              <CustomerStatusBadge status={customer.status} />
              <CustomerTypeBadge type={customer.customerType} />
            </div>
            <p className="text-sm font-medium text-slate-400 flex items-center mt-1">
              <Building className="w-4 h-4 mr-1.5 text-brand-400" />
              {customer.businessName}
              {customer.gstNumber && (
                <span className="ml-3 font-mono text-xs text-slate-500">GSTIN: {customer.gstNumber}</span>
              )}
            </p>
          </div>

          {hasRole('ADMIN', 'SALES') && (
            <Link
              to={`/challans/create?customerId=${customer.id}`}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
            >
              <FileText className="w-4 h-4" />
              <span>Create Challan for Account</span>
            </Link>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Contact Information</p>
            <p className="flex items-center text-slate-200 font-mono">
              <Phone className="w-4 h-4 mr-2 text-brand-400" />
              {customer.mobile}
            </p>
            <p className="flex items-center text-slate-300">
              <Mail className="w-4 h-4 mr-2 text-slate-500" />
              {customer.email}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Address Location</p>
            <p className="flex items-start text-slate-300 leading-relaxed">
              <MapPin className="w-4 h-4 mr-2 text-rose-400 shrink-0 mt-0.5" />
              {customer.address}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Upcoming CRM Follow-up</p>
            <p className="flex items-center text-amber-300 font-medium">
              <Calendar className="w-4 h-4 mr-2 text-amber-400" />
              {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'No follow-up set'}
            </p>
            {customer.notes && (
              <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
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
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                <PlusCircle className="w-5 h-5 mr-2 text-brand-400" />
                Add Follow-up Note & Update Schedule
              </h3>

              <form onSubmit={handleAddFollowUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Follow-up Discussion / Call Summary *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter key discussion details, client commitment, price negotiation notes..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Next Follow-up Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all self-end disabled:opacity-50"
                  >
                    {submitting ? 'Saving Note...' : 'Post Follow-up Note'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Follow-up Timeline */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-semibold text-white mb-6 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-brand-400" />
              CRM Follow-Up Activity Log
            </h3>

            {customer.followUps && customer.followUps.length > 0 ? (
              <div className="relative border-l-2 border-slate-800 ml-3 space-y-6 pl-6">
                {customer.followUps.map((f) => (
                  <div key={f.id} className="relative group">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-brand-500 border-4 border-slate-950 shadow-md" />
                    
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center font-medium text-slate-300">
                          <User className="w-3.5 h-3.5 mr-1 text-brand-400" />
                          {f.creator?.name || 'Sales Rep'}
                        </span>
                        <span className="font-mono text-slate-500">
                          {new Date(f.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed">{f.note}</p>

                      <div className="text-[11px] text-amber-400 font-mono pt-1">
                        Scheduled Next Call: {new Date(f.followUpDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No follow-up notes logged yet. Use the form above to add an entry.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Sales Challans for this customer */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-brand-400" />
              Recent Account Challans
            </h3>

            {customer.challans && customer.challans.length > 0 ? (
              <div className="space-y-3">
                {customer.challans.map((c) => (
                  <Link
                    key={c.id}
                    to={`/challans/${c.id}`}
                    className="block p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-brand-400 group-hover:text-brand-300">
                        {c.challanNumber}
                      </span>
                      <ChallanStatusBadge status={c.status} />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                      <span>Qty: {c.totalQuantity} items</span>
                      <span className="font-mono font-bold text-white">
                        ₹{Number(c.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                No sales challans recorded for this customer account.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
