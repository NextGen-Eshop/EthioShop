import { useState } from 'react';
import { HiOutlinePlus, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import ProductForm from '../components/products/ProductForm';
import ProductTable from '../components/products/ProductTable';
import { products as mockProducts } from '../data/mockData';

export default function Products() {
  const [products, setProducts] = useState(mockProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
  };

  const handleSaveProduct = (product) => {
    setProducts((current) => {
      if (product.id) {
        return current.map((item) => (item.id === product.id ? product : item));
      }

      return [
        {
          ...product,
          id: Date.now(),
        },
        ...current,
      ];
    });

    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-10">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Products</h1>
          <p className="text-slate-500 text-sm">Manage your products, pricing and stock levels.</p>
        </div>
        <button
          type="button"
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Filter & Search Area */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm focus:ring-primary focus:border-primary transition-all shadow-sm"
          />
        </div>
        <button className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          Filters
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
      </div>

      <ProductForm
        isOpen={isFormOpen}
        product={selectedProduct}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
