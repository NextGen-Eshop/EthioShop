import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.08),_transparent_30%)]" />
      <section className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-indigo-200">E</div>
          <span className="text-base font-extrabold text-gray-900">Ethio<span className="text-indigo-600">Shop</span></span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Session Ended</h1>
        <p className="text-sm leading-6 text-gray-500">
          You have been logged out of the admin panel. Sign in again to manage your store.
        </p>

        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm font-medium text-indigo-800">Demo Admin Access</p>
          <p className="mt-1 text-xs text-indigo-600">
            Use the storefront login at <span className="font-semibold">/login</span> with admin credentials to access the dashboard.
          </p>
        </div>

        <Link
          to="/admin/overview"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.99]"
        >
          Return to Dashboard
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </Link>

        <p className="mt-4 text-center text-xs text-gray-400">
          Or <Link to="/login" className="text-indigo-600 font-semibold hover:underline">sign in as customer</Link>
        </p>
      </section>
    </main>
  );
}
