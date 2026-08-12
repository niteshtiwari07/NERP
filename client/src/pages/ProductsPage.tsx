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
import { Search, Plus, Package, Edit, ArrowUpRight, History } from 'lucide-react';

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
  const [movementsProduct, setMovementsProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<any[]>([]);

  // Form State for Product
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 5,
    warehouseLocation: '',
  });

  // Stock Movement Form State
  const [stockForm, setStockForm] = useState({
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
        lowStock: lowStockOnly || undefined,
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
    setFormData({
      name: '',
      sku: '',
      category: 'Power Tools',
      unitPrice: 100,
      currentStock: 10,
      minimumStock: 5,
      warehouseLocation: 'Bay A-01',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
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
        await productService.updateProduct(editingProduct.id, formData);
        showSuccess('Product Updated', `${formData.name} updated successfully.`);
        setEditingProduct(null);
      } else {
        await productService.createProduct(formData);
        showSuccess('Product Created', `${formData.name} created successfully.`);
        setIsCreateOpen(false);
      }
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save product.';
      showError('Error', msg);
    }
  };

  const handleRecordStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;
    try {
      await productService.recordStockMovement(
        stockProduct.id,
        stockForm.quantity,
        stockForm.movementType,
        stockForm.reason
      );
      showSuccess(
        'Stock Updated',
        `Recorded ${stockForm.movementType} ${stockForm.quantity} unit(s) for ${stockProduct.name}.`
      );
      setStockProduct(null);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to record stock movement.';
      showError('Stock Error', msg);
    }
  };

  const handleViewMovements = async (p: Product) => {
    setMovementsProduct(p);
    try {
      const list = await productService.getStockMovements(p.id);
      setMovements(list);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product & SKU Inventory Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage wholesale products, unit prices & warehouse locations</p>
        </div>

        {hasRole('ADMIN', 'WAREHOUSE') && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search product name, SKU, or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Categories</option>
          <option value="Power Tools">Power Tools</option>
          <option value="Electronics">Electronics</option>
          <option value="Safety Equipment">Safety Equipment</option>
        </select>

        <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer px-2">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => {
              setLowStockOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <span>Show Low Stock Only</span>
        </label>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No Products Found"
            description="No SKUs match your filter criteria."
            icon={<Package className="w-6 h-6 text-slate-400" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase">
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Unit Price (₹)</th>
                  <th className="py-3 px-4 text-center">Stock Level</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.category}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-medium">{p.sku}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{Number(p.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900">
                      {p.currentStock} / {p.minimumStock} min
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {p.warehouseLocation}
                    </td>
                    <td className="py-3 px-4">
                      <StockBadge stock={p.currentStock} minStock={p.minimumStock} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {hasRole('ADMIN', 'WAREHOUSE') && (
                        <button
                          onClick={() => {
                            setStockProduct(p);
                            setStockForm({ quantity: 1, movementType: 'IN', reason: '' });
                          }}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Stock</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleViewMovements(p)}
                        className="inline-flex items-center space-x-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded border border-slate-200 transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Logs</span>
                      </button>

                      {hasRole('ADMIN', 'WAREHOUSE') && (
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded border border-slate-200 transition-colors"
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

      {/* Product Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingProduct}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product SKU' : 'Add New Product'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Industrial Power Drill 800W"
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-DRL-800"
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Power Tools"
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Warehouse Location *
              </label>
              <input
                type="text"
                required
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                placeholder="Bay A-12"
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Minimum Stock Threshold *
              </label>
              <input
                type="number"
                required
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingProduct(null);
              }}
              className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              {editingProduct ? 'Update SKU' : 'Save SKU'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Stock Movement Modal */}
      <Modal
        isOpen={!!stockProduct}
        onClose={() => setStockProduct(null)}
        title={`Record Stock Movement: ${stockProduct?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordStock} className="space-y-3.5">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
            <p className="text-slate-600">Current Available Stock: <strong className="text-slate-900 font-mono">{stockProduct?.currentStock}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Movement Direction *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStockForm({ ...stockForm, movementType: 'IN' })}
                className={`py-2 px-3 rounded text-xs font-semibold border ${
                  stockForm.movementType === 'IN'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                + STOCK IN (Add)
              </button>

              <button
                type="button"
                onClick={() => setStockForm({ ...stockForm, movementType: 'OUT' })}
                className={`py-2 px-3 rounded text-xs font-semibold border ${
                  stockForm.movementType === 'OUT'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                - STOCK OUT (Deduct)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              required
              value={stockForm.quantity}
              onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Reason / Reference *
            </label>
            <input
              type="text"
              required
              value={stockForm.reason}
              onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
              placeholder="Vendor shipment, return, damaged inventory..."
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStockProduct(null)}
              className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Save Movement
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock History Audit Modal */}
      <Modal
        isOpen={!!movementsProduct}
        onClose={() => setMovementsProduct(null)}
        title={`Stock Audit History: ${movementsProduct?.name}`}
        maxWidth="xl"
      >
        <div className="space-y-3">
          {movements.length === 0 ? (
            <p className="text-center py-6 text-slate-500 text-xs">No stock movement logs recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            m.movementType === 'IN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {m.movementType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{m.reason}</td>
                      <td className="py-2.5 px-3 text-slate-500">{m.creator?.name || 'User'}</td>
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
