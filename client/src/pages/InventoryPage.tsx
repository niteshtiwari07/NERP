import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types/models';
import { StockBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Boxes, AlertTriangle } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialLowStock = searchParams.get('lowStock') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStock);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        page,
        limit: 10,
        search,
        lowStock: lowStockOnly || undefined,
      });
      setProducts(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, search, lowStockOnly]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Warehouse Inventory Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time stock balances, warehouse bin locations & replenishment alerts</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by product name, SKU, or bay location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <button
          onClick={() => {
            setLowStockOnly(!lowStockOnly);
            setPage(1);
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
            lowStockOnly
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{lowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock Alert'}</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No Inventory Records"
            description="No SKUs match the current stock filter."
            icon={<Boxes className="w-6 h-6 text-slate-400" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 uppercase">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Available Stock</th>
                  <th className="py-3 px-4 text-center">Minimum Threshold</th>
                  <th className="py-3 px-4">Warehouse Location</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => {
                  const isLow = p.currentStock <= p.minimumStock;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isLow ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500">{p.category}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{p.sku}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                        {p.currentStock}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {p.minimumStock}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{p.warehouseLocation}</td>
                      <td className="py-3 px-4 text-right">
                        <StockBadge stock={p.currentStock} minStock={p.minimumStock} />
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
};
