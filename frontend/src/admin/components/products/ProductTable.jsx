import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[860px] text-left">
          <thead className="bg-slate-50">
            <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
              <th className="px-6 py-4 font-semibold">Product Image</th>
              <th className="px-6 py-4 font-semibold">Product Name</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{product.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{currency.format(product.price)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
