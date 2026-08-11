import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import type { Customer, Product } from '../types/models';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, Plus, Trash2, FileText, AlertCircle, ShoppingBag } from 'lucide-react';

interface SelectedItem {
  productId: string;
  product?: Product;
  quantity: number;
}

export const CreateChallanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedCustomerId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preSelectedCustomerId);
  const [items, setItems] = useState<SelectedItem[]>([
    { productId: '', quantity: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers({ limit: 100 }),
          productService.getProducts({ limit: 100 }),
        ]);
        setCustomers(custRes.items);
        setProducts(prodRes.items);
      } catch (err) {
        console.error('Failed to load customers or products:', err);
      }
    };
    loadInitialData();
  }, []);

  const handleProductChange = (index: number, productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId,
      product: selectedProd,
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, quantity);
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedItems = items.map((item) => {
    const unitPrice = item.product ? Number(item.product.unitPrice) : 0;
    const total = unitPrice * item.quantity;
    return {
      ...item,
      unitPrice,
      total,
    };
  });

  const grandTotalAmount = calculatedItems.reduce((acc, curr) => acc + curr.total, 0);
  const grandTotalQuantity = calculatedItems.reduce((acc, curr) => acc + (curr.productId ? curr.quantity : 0), 0);

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showError('Customer Required', 'Please select a customer for this sales challan.');
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      showError('Products Required', 'Please add at least one product with quantity > 0.');
      return;
    }

    setSubmitting(true);
    try {
      const challan = await challanService.createChallan({
        customerId: selectedCustomerId,
        items: validItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      showSuccess(
        'Draft Challan Saved',
        `Sales Challan ${challan.challanNumber} created in DRAFT status.`
      );
      navigate(`/challans/${challan.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create sales challan.';
      showError('Error Creating Challan', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/challans"
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sales Challans</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center">
                <FileText className="w-6 h-6 mr-2 text-brand-400" />
                Create New Sales Challan
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Draft sales challan does not deduct inventory stock until confirmed.
              </p>
            </div>

            <form onSubmit={handleSubmitDraft} className="space-y-6">
              {/* Step 1: Select Customer */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Account / Customer *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName} ({c.businessName}) - [{c.customerType}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Add Products */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    2. Select Products & Order Quantities *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-400 hover:text-brand-300 bg-brand-950/40 px-3 py-1.5 rounded-lg border border-brand-800/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const calc = calculatedItems[index];
                    return (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        {/* Product Selector */}
                        <div className="flex-1 w-full">
                          <select
                            required
                            value={item.productId}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                          >
                            <option value="">-- Choose Product SKU --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (SKU: {p.sku}) - ₹{Number(p.unitPrice)} | Stock: {p.currentStock}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Input */}
                        <div className="w-28 flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10) || 1)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono text-center focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="w-32 text-right font-mono text-sm font-semibold text-white">
                          ₹{calc.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length === 1}
                          className="p-2 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
                <Link
                  to="/challans"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Generating Draft...' : 'Save Draft Sales Challan'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (1 Col): Live Preview Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 sticky top-24">
            <h3 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-brand-400" />
              Sales Challan Summary
            </h3>

            {/* Customer Details */}
            {selectedCustomer ? (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-white">{selectedCustomer.customerName}</p>
                <p className="text-slate-400">{selectedCustomer.businessName}</p>
                <p className="text-slate-400 font-mono">{selectedCustomer.mobile}</p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-900 border border-slate-800">
                No customer selected yet.
              </div>
            )}

            {/* Totals Breakdown */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-slate-400">
                <span>Total Item Types:</span>
                <span className="font-mono text-white">{items.length} SKUs</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Quantity:</span>
                <span className="font-mono text-white">{grandTotalQuantity} units</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-3 text-white">
                <span>Grand Total Amount:</span>
                <span className="font-mono text-brand-400">
                  ₹{grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                Draft Challans reserve product snapshot info (Name, SKU, Unit Price). Actual inventory is deducted when confirmed.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
