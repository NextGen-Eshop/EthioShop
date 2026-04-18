import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,74,173,0.10),_transparent_28%)]" />
      <section className="relative w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#004aad]">EthioShop</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">You have been logged out</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          This is a frontend-only placeholder screen for the admin dashboard. No backend authentication has been connected yet.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Mock session ended</p>
          <p className="mt-1 text-sm text-slate-500">Use the button below to re-enter the dashboard UI.</p>
        </div>

        <Link
          to="/overview"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#004aad] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-[#003b88]"
        >
          Return to Dashboard
          <HiArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
