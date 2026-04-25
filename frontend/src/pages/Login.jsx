import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getGoogleIdToken } from '../utils/googleSignIn';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const STAFF = ['admin', 'manager'];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const redirectParam = new URLSearchParams(location.search).get('redirect');

  const getDestination = (role) => {
    if (redirectParam) return redirectParam;
    return STAFF.includes(role) ? '/admin/overview' : '/home';
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    try {
      const data = await login({ email: form.email, password: form.password });
      navigate(getDestination(data.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const onGoogle = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const idToken = await getGoogleIdToken();
      const data = await loginWithGoogle(idToken);
      navigate(getDestination(data.role), { replace: true });
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <section className="container-shell grid min-h-[calc(100vh-3rem)] items-center py-10 md:grid-cols-2 md:gap-8">
      <aside className="hidden rounded-2xl border border-[#d8deed] bg-white p-8 md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3857d6]">Welcome back</p>
        <h1 className="mt-3 text-4xl leading-tight">A calmer way to shop essentials.</h1>
        <p className="mt-4 text-sm leading-7 text-[#5b6475]">
          Log in to continue your orders, saved items, and tailored product collections.
        </p>
      </aside>

      <div className="panel mx-auto w-full max-w-md p-6 md:p-8">
        <h2 className="text-2xl">Sign in</h2>
        <p className="mt-2 text-sm text-[#5b6475]">Use your account to continue checkout.</p>
        <button
          type="button"
          onClick={onGoogle}
          disabled={isGoogleLoading}
          className="btn-secondary mt-5 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-60"
        >
          <GoogleIcon /> {isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}
        </button>
        <div className="my-4 h-px bg-[#d8deed]" />
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Email</label>
            <input
              type="email"
              className={`field ${error ? 'field-error' : ''}`}
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Password</label>
            <input
              type="password"
              className={`field ${error ? 'field-error' : ''}`}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
          </div>
          {error && <p className="text-sm text-[#c7414b]">{error}</p>}
          <button className="btn-primary w-full px-4 py-3">Sign in</button>
          <p className="text-center text-sm text-[#5b6475]">
            New here? <Link className="font-semibold text-[#3857d6]" to="/register">Create account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
