import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { signInWithGoogle } from '../utils/googleSignIn';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const registerEmail = useAuthStore((state) => state.registerEmail);
  const signInGoogle = useAuthStore((state) => state.signInGoogle);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'personal' });
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const nextPath = new URLSearchParams(location.search).get('redirect') || '/home';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    registerEmail({ name: form.name, email: form.email });
    navigate(nextPath, { replace: true });
  };

  const handleGoogle = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const profile = await signInWithGoogle();
      signInGoogle(profile);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-up failed. Please retry.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="container-shell grid min-h-[calc(100vh-3rem)] items-center py-10 md:grid-cols-2 md:gap-8">
      <aside className="hidden rounded-2xl border border-[#d8deed] bg-white p-8 md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00a98f]">New account</p>
        <h1 className="mt-3 text-4xl leading-tight">Create your shopper identity.</h1>
        <p className="mt-4 text-sm leading-7 text-[#5b6475]">
          Start with a profile that syncs your saved items, checkout details, and delivery preferences across devices.
        </p>
        <div className="mt-6 space-y-3">
          {['Faster checkout', 'Order tracking timeline', 'Personalized picks'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-[#384258]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f8f5] text-[#0a8f79]">✓</span>
              {item}
            </div>
          ))}
        </div>
      </aside>
      <div className="panel mx-auto w-full max-w-md p-6 md:p-8">
        <h2 className="text-2xl">Create account</h2>
        <p className="mt-2 text-sm text-[#5b6475]">A modern account setup for secure shopping.</p>
        <button type="button" onClick={handleGoogle} disabled={isGoogleLoading} className="btn-secondary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-60">
          <GoogleIcon /> {isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}
        </button>
        <div className="my-4 h-px bg-[#d8deed]" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Full name</label>
            <input className={`field ${error ? 'field-error' : ''}`} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Email</label>
            <input type="email" className={`field ${error ? 'field-error' : ''}`} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Password</label>
            <input type="password" className={`field ${error ? 'field-error' : ''}`} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Account type</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm((p) => ({ ...p, role: 'personal' }))} className={`rounded-xl border px-3 py-2 text-sm ${form.role === 'personal' ? 'border-[#3857d6] bg-[#ecf1ff] text-[#1f2f6e]' : 'border-[#d8deed] text-[#5b6475]'}`}>
                Personal
              </button>
              <button type="button" onClick={() => setForm((p) => ({ ...p, role: 'business' }))} className={`rounded-xl border px-3 py-2 text-sm ${form.role === 'business' ? 'border-[#00a98f] bg-[#e8f8f5] text-[#0a6d5c]' : 'border-[#d8deed] text-[#5b6475]'}`}>
                Business
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-[#c7414b]">{error}</p>}
          <button className="btn-primary w-full px-4 py-3">Create account</button>
          <p className="text-center text-sm text-[#5b6475]">
            Already have an account? <Link className="font-semibold text-[#3857d6]" to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
