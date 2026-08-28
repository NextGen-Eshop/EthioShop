import { useEffect } from 'react';

export default function GoogleAuthCallback() {
  useEffect(() => {
    try {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const idToken = hash.get('id_token');
      const error = hash.get('error');

      if (window.opener) {
        if (idToken) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', idToken }, window.location.origin);
        } else if (error) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error }, window.location.origin);
        }
      }
      setTimeout(() => {
        window.close();
      }, 300);
    } catch (e) {
      console.warn('Callback error:', e);
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#f8f9fc',
        color: '#384258',
        gap: '16px',
      }}
    >
      {/* Google colour spinner */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        style={{ animation: 'spin 0.9s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="12" cy="12" r="10" stroke="#e8eaf0" strokeWidth="3" fill="none" />
        <path
          d="M12 2 a10 10 0 0 1 10 10"
          stroke="#4285F4"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <p style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>
        Signing you in with Google…
      </p>
      <p style={{ fontSize: '13px', color: '#8492a6', margin: 0 }}>
        This window will close automatically.
      </p>
    </div>
  );
}
