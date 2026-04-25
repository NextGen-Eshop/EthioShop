import { useState } from 'react';
import ProductForm from '../components/products/ProductForm';
import ProductTable from '../components/products/ProductTable';
import { products as mockProducts } from '../data/mockData';

export default function Products() {
  const [products, setProducts] = useState(mockProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddProduct = () => { setSelectedProduct(null); setIsFormOpen(true); };
  const handleEditProduct = (product) => { setSelectedProduct(product); setIsFormOpen(true); };
  const handleDeleteProduct = (productId) => { setProducts((c) => c.filter((p) => p.id !== productId)); };

  const handleSaveProduct = (product) => {
    setProducts((c) => {
      if (product.id) return c.map((item) => (item.id === product.id ? product : item));
      return [{ ...product, id: Date.now() }, ...c];
    });
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = searchQuery
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Products</h1>
          <p className="text-gray-500 text-sm">Manage your products, pricing and stock levels.</p>
        </div>
        <button type="button" onClick={handleAddProduct}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 active:scale-[0.98]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400" />
        </div>
        <button className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
          Filters
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">In Stock</p>
          <p className="text-2xl font-bold text-emerald-600">{products.filter(p => (p.stock || p.quantity) > 0).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">{products.filter(p => (p.stock || p.quantity) > 0 && (p.stock || p.quantity) < 5).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <ProductTable products={filteredProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
      </div>

      <ProductForm
        isOpen={isFormOpen}
        product={selectedProduct}
        onClose={() => { setIsFormOpen(false); setSelectedProduct(null); }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
