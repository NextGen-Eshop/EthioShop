/**
 * Google Sign-In via the standard OAuth 2.0 popup window.
 * Opens accounts.google.com in a centred popup — user sees the familiar
 * "Choose an account" screen exactly like Gmail, YouTube, etc.
 *
 * Flow:
 *  1. Open accounts.google.com/o/oauth2/v2/auth in a popup
 *  2. User picks their Google account
 *  3. Google redirects the popup back to /auth/google/callback with #id_token=…
 *  4. We read the token from the popup URL and close it
 *  5. The raw ID token is returned to the caller → sent to backend for
 *     server-side verification with google-auth-library
 *
 * Requires:
 *  - VITE_GOOGLE_CLIENT_ID in frontend .env
 *  - http://localhost:5173/auth/google/callback added as an
 *    Authorized redirect URI in Google Cloud Console
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
    prompt: 'select_account', // always show the "Choose an account" picker
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

    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      clearInterval(pollTimer);
      fn(value);
    };

    // Poll the popup URL — once it redirects back to our origin we can read the hash
    const pollTimer = setInterval(() => {
      try {
        if (popup.closed) {
          settle(reject, new Error('Google sign-in was cancelled.'));
          return;
        }

        // This throws a cross-origin error while popup is on accounts.google.com
        // Once the popup navigates back to our origin, we can read the URL
        const href = popup.location.href;

        if (href && href.includes(CALLBACK_PATH)) {
          const hash = new URLSearchParams(popup.location.hash.slice(1));
          const idToken = hash.get('id_token');
          popup.close();

          if (idToken) {
            settle(resolve, idToken);
          } else {
            const error = hash.get('error') || 'Unknown error from Google';
            settle(reject, new Error(`Google sign-in failed: ${error}`));
          }
        }
      } catch {
        // Cross-origin security error — popup is still on Google's domain, keep polling
      }
    }, 300);

    // Safety timeout — give up after 5 minutes
    setTimeout(() => {
      if (!settled) {
        if (!popup.closed) popup.close();
        settle(reject, new Error('Google sign-in timed out. Please try again.'));
      }
    }, 5 * 60 * 1000);
  });
};
