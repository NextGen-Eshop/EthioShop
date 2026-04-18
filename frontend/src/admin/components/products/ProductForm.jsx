import { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { productCategories } from '../../data/mockData';

const initialForm = {
  name: '',
  category: productCategories[0],
  price: '',
  originalPrice: '',
  stock: '',
  image: 'https://via.placeholder.com/50',
  description: '',
  superDeal: false,
};

export default function ProductForm({ isOpen, product, onClose, onSave }) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name ?? '',
        category: product.category ?? productCategories[0],
        price: product.price ?? '',
        originalPrice: product.originalPrice ?? '',
        stock: product.stock ?? '',
        image: product.image ?? 'https://via.placeholder.com/50',
        description: product.description ?? '',
        superDeal: Boolean(product.superDeal),
      });
      return;
    }

    setFormData(initialForm);
  }, [product, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...product,
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      stock: Number(formData.stock),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#004aad]">
              Products Management
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {product ? 'Edit Product' : 'Add Product'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Close product form"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Product Name">
              <input name="name" value={formData.name} onChange={handleChange} required className={inputClassName} />
            </Field>
            <Field label="Category">
              <select name="category" value={formData.category} onChange={handleChange} className={inputClassName}>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Price">
              <input name="price" type="number" value={formData.price} onChange={handleChange} required className={inputClassName} />
            </Field>
            <Field label="Original Price">
              <input
                name="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={handleChange}
                required
                className={inputClassName}
              />
            </Field>
            <Field label="Stock">
              <input name="stock" type="number" value={formData.stock} onChange={handleChange} required className={inputClassName} />
            </Field>
            <Field label="Image URL">
              <input name="image" value={formData.image} onChange={handleChange} className={inputClassName} />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`${inputClassName} resize-none`}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              name="superDeal"
              checked={formData.superDeal}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-[#004aad] focus:ring-[#004aad]"
            />
            <span className="text-sm font-medium text-slate-700">Mark this item as a SuperDeal</span>
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-[#004aad] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#003b88]"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#004aad] focus:bg-white';
