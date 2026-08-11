import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import type { Product, MovementType } from '../types/models';
import { StockBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  ArrowDownRight,
  History,
  Edit,
  MapPin,
  Tag,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [movementLogs, setMovementLogs] = useState<any[]>([]);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 5,
    warehouseLocation: '',
  });

  // Stock Movement Form
  const [movementForm, setMovementForm] = useState({
    quantity: 1,
    movementType: 'IN' as MovementType,
    reason: '',
  });

  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        page,
        limit: 10,
        search,
        category: categoryFilter || undefined,
        lowStock: lowStockOnly,
      });
      setProducts(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, lowStockOnly]);

  const handleOpenCreate = () => {
    setProductForm({
      name: '',
      sku: '',
      category: '',
      unitPrice: 0,
      currentStock: 0,
      minimumStock: 5,
      warehouseLocation: '',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: Number(p.unitPrice),
      currentStock: p.currentStock,
      minimumStock: p.minimumStock,
      warehouseLocation: p.warehouseLocation,
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productForm);
        showSuccess('Product Updated', `${productForm.name} updated successfully.`);
        setEditingProduct(null);
      } else {
        await productService.createProduct(productForm);
        showSuccess('Product Created', `${productForm.name} added to catalog.`);
        setIsCreateOpen(false);
      }
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save product.';
      showError('Error', msg);
    }
  };

  const handleStockMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;
    try {
      await productService.recordStockMovement(
        stockProduct.id,
        movementForm.quantity,
        movementForm.movementType,
        movementForm.reason
      );
      showSuccess(
        'Stock Updated',
        `Recorded ${movementForm.movementType} movement of ${movementForm.quantity} units for ${stockProduct.name}.`
      );
      setStockProduct(null);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to record stock movement.';
      showError('Stock Update Failed', msg);
    }
  };

  const handleViewHistory = async (p: Product) => {
    setHistoryProduct(p);
    try {
      const logs = await productService.getStockMovements(p.id);
      setMovementLogs(logs);
    } catch (err) {
      console.error('Failed to fetch stock movements history:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Product Catalog & Inventory</h2>
          <p className="text-sm text-slate-400 mt-1">Manage SKUs, unit prices, minimum thresholds & stock movements</p>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product SKU</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 flex-1 w-full">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or warehouse location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <input
            type="text"
            placeholder="Filter by Category..."
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Low Stock Filter Button */}
        <button
          onClick={() => {
            setLowStockOnly(!lowStockOnly);
            setPage(1);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            lowStockOnly
              ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-md shadow-rose-500/10'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Low Stock Only</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="No product records match your criteria."
            icon={<Package className="w-8 h-8 text-brand-400" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Unit Price (₹)</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Warehouse Location</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="font-mono text-xs text-brand-400 mt-0.5">SKU: {p.sku}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Tag className="w-3 h-3 mr-1 text-slate-500" />
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{Number(p.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <StockBadge stock={p.currentStock} minStock={p.minimumStock} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                        {p.warehouseLocation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Stock Movement Action */}
                      {hasRole('ADMIN', 'WAREHOUSE') && (
                        <button
                          onClick={() => {
                            setStockProduct(p);
                            setMovementForm({ quantity: 1, movementType: 'IN', reason: '' });
                          }}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 px-2.5 py-1.5 rounded-lg border border-emerald-800/40 transition-colors"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>Adjust Stock</span>
                        </button>
                      )}

                      {/* Movement Logs History */}
                      <button
                        onClick={() => handleViewHistory(p)}
                        className="inline-flex items-center space-x-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Log</span>
                      </button>

                      {/* Edit Product */}
                      {hasRole('ADMIN', 'WAREHOUSE') && (
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingProduct}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product SKU' : 'Create New Product SKU'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="e.g. Heavy Duty Cordless Drill"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Unique SKU *
              </label>
              <input
                type="text"
                required
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="SKU-DRL-900"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                placeholder="Power Tools / Electrical"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={productForm.unitPrice}
                onChange={(e) => setProductForm({ ...productForm, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Warehouse Location *
              </label>
              <input
                type="text"
                required
                value={productForm.warehouseLocation}
                onChange={(e) => setProductForm({ ...productForm, warehouseLocation: e.target.value })}
                placeholder="Bay A-12 / Shelf 3"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                required
                value={productForm.currentStock}
                onChange={(e) => setProductForm({ ...productForm, currentStock: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Minimum Stock Alert Level *
              </label>
              <input
                type="number"
                min="0"
                required
                value={productForm.minimumStock}
                onChange={(e) => setProductForm({ ...productForm, minimumStock: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/20 transition-all"
            >
              {editingProduct ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Stock Movement Modal */}
      <Modal
        isOpen={!!stockProduct}
        onClose={() => setStockProduct(null)}
        title={`Stock Adjustment: ${stockProduct?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleStockMovementSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex justify-between">
            <span>SKU: {stockProduct?.sku}</span>
            <span>Current Stock: <strong className="text-white">{stockProduct?.currentStock} units</strong></span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Movement Type
              </label>
              <select
                value={movementForm.movementType}
                onChange={(e) => setMovementForm({ ...movementForm, movementType: e.target.value as MovementType })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="IN">IN (+ Add Stock)</option>
                <option value="OUT">OUT (- Deduct Stock)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={movementForm.quantity}
                onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Reason / Reference *
            </label>
            <input
              type="text"
              required
              value={movementForm.reason}
              onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
              placeholder="Vendor Shipment #104, Damaged Stock Removal, Inventory Audit..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStockProduct(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/20 transition-all"
            >
              Record Stock Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Movement History Logs Modal */}
      <Modal
        isOpen={!!historyProduct}
        onClose={() => setHistoryProduct(null)}
        title={`Stock Movement History: ${historyProduct?.name}`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="text-xs text-slate-400 font-mono">SKU: {historyProduct?.sku}</div>

          {movementLogs.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">No recorded movements for this product.</div>
          ) : (
            <div className="overflow-x-auto max-h-96 custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {movementLogs.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            m.movementType === 'IN'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {m.movementType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">{m.quantity}</td>
                      <td className="py-2.5 px-3">{m.reason}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.creator?.name || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
