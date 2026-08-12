import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import type { Customer, Product } from '../types/models';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';

interface ChallanItemInput {
  productId: string;
  product?: Product;
  quantity: number;
}

export const CreateChallanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId);

  // Items State
  const [items, setItems] = useState<ChallanItemInput[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadMasterData = async () => {
      setLoading(true);
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers({ limit: 100 }),
          productService.getProducts({ limit: 100 }),
        ]);
        setCustomers(custRes.items);
        setProducts(prodRes.items);
        if (prodRes.items.length > 0) {
          setSelectedProductId(prodRes.items[0].id);
        }
      } catch (err) {
        console.error('Failed to load master data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMasterData();
  }, []);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (quantity > prod.currentStock) {
      showError(
        'Stock Alert',
        `Requested quantity (${quantity}) exceeds current available stock (${prod.currentStock}).`
      );
      return;
    }

    const existingIndex = items.findIndex((i) => i.productId === selectedProductId);
    if (existingIndex > -1) {
      const newItems = [...items];
      const newQty = newItems[existingIndex].quantity + quantity;
      if (newQty > prod.currentStock) {
        showError(
          'Stock Alert',
          `Combined quantity (${newQty}) exceeds current available stock (${prod.currentStock}).`
        );
        return;
      }
      newItems[existingIndex].quantity = newQty;
      setItems(newItems);
    } else {
      setItems([...items, { productId: selectedProductId, product: prod, quantity }]);
    }

    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const newItems = [...items];
    const prod = newItems[index].product;
    if (prod && newQty > prod.currentStock) {
      showError(
        'Stock Alert',
        `Quantity (${newQty}) exceeds available stock (${prod.currentStock}).`
      );
      return;
    }
    newItems[index].quantity = newQty;
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, item) => {
    const price = Number(item.product?.unitPrice || 0);
    return acc + price * item.quantity;
  }, 0);

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSubmitChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showError('Customer Required', 'Please select a customer account.');
      return;
    }
    if (items.length === 0) {
      showError('Items Required', 'Add at least one product item to the sales challan.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
      const created = await challanService.createChallan(payload);
      showSuccess(
        'Challan Created',
        `Draft Challan ${created.challanNumber} created successfully.`
      );
      navigate(`/challans/${created.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create sales challan.';
      showError('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading master catalog...</div>;
  }

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);
  const currentSelectedProd = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/challans"
          className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sales Challans</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create New Sales Delivery Challan</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select customer account and dispatch line items</p>
        </div>
      </div>

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSubmitChallan} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Line Item Selector & Summary Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">1. Customer Information</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Select Customer Account *
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} ({c.businessName})
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomerObj && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                <p className="font-semibold text-slate-900">{selectedCustomerObj.businessName}</p>
                <p className="text-slate-600">GSTIN: {selectedCustomerObj.gstNumber || 'N/A'}</p>
                <p className="text-slate-600">{selectedCustomerObj.address}</p>
              </div>
            )}
          </div>

          {/* Add Product Items Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">2. Add Line Items</h3>

            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Product / SKU *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — ₹{Number(p.unitPrice).toFixed(2)} | Stock: {p.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-28">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded transition-colors"
              >
                + Add Line Item
              </button>
            </div>

            {currentSelectedProd && (
              <p className="text-[11px] text-slate-500 font-mono">
                Location: {currentSelectedProd.warehouseLocation} | Available: {currentSelectedProd.currentStock} units
              </p>
            )}

            {/* Line Items Table */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase mb-2">Challan Dispatched Items</h4>
              {items.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-300 rounded">
                  No line items added yet. Choose a product above and click "+ Add Line Item".
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase">
                        <th className="py-2.5 px-3">Item & SKU</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                        <th className="py-2.5 px-3 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {items.map((item, idx) => {
                        const subtotal = Number(item.product?.unitPrice || 0) * item.quantity;
                        return (
                          <tr key={idx}>
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-slate-900">{item.product?.name}</p>
                              <p className="text-[11px] font-mono text-slate-500">{item.product?.sku}</p>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              ₹{Number(item.product?.unitPrice || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                                className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 text-center font-mono text-xs text-slate-900"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{subtotal.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Order Summary Card & Submit */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Challan Order Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-mono font-semibold text-slate-900">{items.length} SKUs</span>
              </div>
              <div className="flex justify-between">
                <span>Total Dispatch Units:</span>
                <span className="font-mono font-semibold text-slate-900">{totalQuantity} units</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-indigo-600">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded shadow-sm flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Generating...' : 'Save Draft Sales Challan'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
