import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadPaymentProof } from '../services/paymentsService';
import { getOrderById } from '../services/ordersService';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function fullUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function OrderPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getOrderById(id);
        if (!cancelled && data?.data) setOrder(data.data);
      } catch {
        if (!cancelled) toast.error('Could not load order');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Choose a screenshot first');
      return;
    }
    setUploading(true);
    try {
      await uploadPaymentProof(id, file);
      toast.success('Upload received. Our team will review it shortly.');
      navigate('/account', { state: { tab: 'orders' } });
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-shell py-20 text-center text-[#5b6475]">Loading order…</div>
    );
  }

  if (!order) {
    return (
      <div className="container-shell flex flex-col items-center py-20 text-center">
        <h1 className="text-xl font-bold text-[#111827]">Order not found</h1>
        <Link to="/products" className="btn-primary mt-6 px-6 py-2.5 text-sm">Back to shop</Link>
      </div>
    );
  }

  const st = order.status;
  const existing = order.paymentScreenshotUrl
    ? fullUrl(order.paymentScreenshotUrl)
    : null;

  return (
    <div className="container-shell py-10 max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3857d6]">Payment</p>
      <h1 className="mt-2 text-2xl font-bold text-[#111827]">Upload payment proof</h1>
      <p className="mt-2 text-sm text-[#5b6475]">
        Order total: <strong>ETB {Number(order.totalPrice).toLocaleString()}</strong> · Bank transfer
      </p>

      {['approved', 'shipped', 'delivered'].includes(st) && (
        <div className="mt-6 panel p-5 bg-[#e8f8f5] text-[#0a6d5c] text-sm">
          This order is already confirmed. No further action needed.
        </div>
      )}

      {st === 'under_review' && (
        <div className="mt-6 panel p-5 bg-[#fef3c7] text-amber-900 text-sm">
          We’re reviewing your payment. You’ll get an email when it’s approved or if we need a new
          screenshot.
        </div>
      )}

      {st === 'rejected' && order.rejectionReason && (
        <div className="mt-6 panel p-5 bg-red-50 text-red-800 text-sm">
          <p className="font-semibold">Previous upload was not accepted.</p>
          <p className="mt-1">{order.rejectionReason}</p>
          <p className="mt-2 text-xs">Please upload a new clear screenshot below.</p>
        </div>
      )}

      {existing && ['pending_payment', 'under_review', 'rejected'].includes(st) && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-[#5b6475] mb-2">Current upload</p>
          <a href={existing} target="_blank" rel="noreferrer" className="block">
            <img
              src={existing}
              alt="Payment"
              className="rounded-xl border border-[#d8deed] max-h-64 object-contain"
            />
          </a>
        </div>
      )}

      {['pending_payment', 'rejected'].includes(st) && (
        <div className="mt-8 space-y-4">
          <div
            {...getRootProps()}
            className={`panel cursor-pointer border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive ? 'border-[#3857d6] bg-[#ecf1ff]' : 'border-[#d8deed] hover:border-[#b9c5e0]'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-sm font-semibold text-[#111827]">
              {file ? file.name : isDragActive ? 'Drop the file here' : 'Drag a screenshot or click to choose'}
            </p>
            <p className="text-xs text-[#5b6475] mt-1">PNG, JPG, WebP or GIF — max 5MB</p>
          </div>
          <button
            type="button"
            disabled={!file || uploading}
            onClick={handleUpload}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Submit for review'}
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/account" className="btn-secondary px-5 py-2.5 text-sm">My account</Link>
        <Link to="/products" className="btn-ghost px-2 py-2.5 text-sm">Continue shopping</Link>
      </div>
    </div>
  );
}
