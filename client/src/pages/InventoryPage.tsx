import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types/models';
import { StockBadge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Boxes, AlertTriangle, MapPin, Tag } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        page,
        limit: 10,
        search,
        lowStock: lowStockOnly,
      });
      setProducts(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.total);
    } catch (err) {
      console.error('Failed to load inventory:', err);
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
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Stock & Warehouse Control</h2>
        <p className="text-sm text-slate-400 mt-1">
          Monitor current physical stock balances across warehouse locations
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search stock by SKU, product name, or warehouse bay..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

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
          <span>Low Stock Items Only</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No Inventory Items Found"
            description="No inventory items match your search filter."
            icon={<Boxes className="w-8 h-8 text-brand-400" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">SKU & Item Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Warehouse Location</th>
                  <th className="py-3.5 px-4 text-center">Available Stock</th>
                  <th className="py-3.5 px-4 text-center">Minimum Threshold</th>
                  <th className="py-3.5 px-4 text-right">Stock Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.map((p) => {
                  const stockValue = Number(p.unitPrice) * p.currentStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-brand-400">{p.sku}</div>
                        <div className="font-semibold text-white mt-0.5">{p.name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          <Tag className="w-3 h-3 mr-1 text-slate-500" />
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        <span className="inline-flex items-center bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          <MapPin className="w-3 h-3 mr-1 text-rose-400" />
                          {p.warehouseLocation}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StockBadge stock={p.currentStock} minStock={p.minimumStock} />
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                        {p.minimumStock} units
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                        ₹{stockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
