/**
 * Google OAuth callback page — this is where Google redirects the popup after sign-in.
 * The ID token is in the URL hash: #id_token=...
 *
 * This page just shows a "closing…" indicator. The parent window's polling
 * code (googleSignIn.js) reads the token from popup.location.hash and closes
 * the popup automatically. This page is never visible for more than a blink.
 */
export default function GoogleAuthCallback() {
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
