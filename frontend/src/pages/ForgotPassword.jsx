import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    // TODO: POST /api/auth/forgot-password
    setSent(true);
  };

  return (
    <section className="container-shell flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="panel mx-auto w-full max-w-md p-6 md:p-8">
        {sent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-2xl mb-2">Check your inbox</h2>
            <p className="text-sm text-[#5b6475] mb-6">
              We sent a password reset link to <strong>{email}</strong>. It expires in 15 minutes.
            </p>
            <Link to="/login" className="btn-primary px-6 py-2.5 text-sm inline-block">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl">Reset password</h2>
            <p className="mt-2 text-sm text-[#5b6475]">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`field ${error ? 'field-error' : ''}`}
                  placeholder="you@example.com"
                />
                {error && <p className="mt-1 text-xs text-[#c7414b]">{error}</p>}
              </div>
              <button type="submit" className="btn-primary w-full px-4 py-3 text-sm">
                Send Reset Link
              </button>
              <p className="text-center text-sm text-[#5b6475]">
                Remember it?{' '}
                <Link to="/login" className="font-semibold text-[#3857d6]">
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
