/**
 * Google Sign-In via the standard OAuth 2.0 popup window.
 * Opens accounts.google.com in a centred popup — user sees the familiar
 * "Choose an account" screen exactly like Gmail, YouTube, etc.
 *
 * Flow:
 *  1. Open accounts.google.com/o/oauth2/v2/auth in a popup
 *  2. User picks their Google account
 *  3. Google redirects the popup back to /auth/google/callback with #id_token=…
 *  4. GoogleAuthCallback sends postMessage back to opener
 *  5. The raw ID token is returned to the caller → sent to backend for
 *     server-side verification with google-auth-library
 */

const CALLBACK_PATH = '/auth/google/callback';

/** Open a centred popup window */
const openPopup = (url) => {
  const width = 500;
  const height = 620;
  const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - height) / 2);
  return window.open(
    url,
    'google-signin-popup',
    `width=${width},height=${height},left=${left},top=${top},` +
      'scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
  );
};

/**
 * Opens the standard Google account chooser popup.
 * Returns a Promise that resolves with the raw Google ID token (string).
 */
export const signInWithGoogle = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return Promise.reject(
      new Error('Google sign-in is not configured. Please contact support.')
    );
  }

  // Generate a random nonce for CSRF protection
  const nonce = crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '')
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

  const redirectUri = `${window.location.origin}${CALLBACK_PATH}`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce,
    prompt: 'select_account',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return new Promise((resolve, reject) => {
    const popup = openPopup(authUrl);

    if (!popup) {
      reject(
        new Error(
          'Popup was blocked. Please allow popups for this site and try again.'
        )
      );
      return;
    }

    let settled = false;
    let safetyTimeout = null;

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      if (safetyTimeout) clearTimeout(safetyTimeout);
    };

    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn(value);
    };

    // Modern postMessage listener (avoids COOP polling warnings)
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.idToken) {
        settle(resolve, event.data.idToken);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        settle(reject, new Error(event.data.error || 'Google sign-in failed'));
      }
    };

    window.addEventListener('message', handleMessage);

    // Safety timeout — 5 minutes
    safetyTimeout = setTimeout(() => {
      if (!settled) {
        try { popup.close(); } catch (_) {}
        settle(reject, new Error('Google sign-in timed out. Please try again.'));
      }
    }, 5 * 60 * 1000);
  });
};
