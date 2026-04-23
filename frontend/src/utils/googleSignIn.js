/**
 * Google Sign-In using the OAuth 2.0 popup flow.
 * Opens accounts.google.com in a popup — user picks their existing Google account.
 * Requires VITE_GOOGLE_CLIENT_ID in .env
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/tokeninfo';

const parseJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const existing = document.getElementById('google-gsi-script');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const s = document.createElement('script');
    s.id = 'google-gsi-script';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(s);
  });

/**
 * Opens Google's account chooser popup.
 * - If VITE_GOOGLE_CLIENT_ID is set → real OAuth flow
 * - If not set → throws a clear error so the UI can show a proper message
 */
export const signInWithGoogle = async () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      'Google sign-in is not configured yet. Please use email/password to sign in.'
    );
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: clientId,
      // use_fedcm_for_prompt: false ensures the classic popup account picker
      ux_mode: 'popup',
      callback: (response) => {
        if (!response?.credential) {
          reject(new Error('Google sign-in was cancelled.'));
          return;
        }
        const payload = parseJwt(response.credential);
        if (!payload?.email) {
          reject(new Error('Could not read your Google profile. Please try again.'));
          return;
        }
        resolve({
          name: payload.name || payload.given_name || 'Google User',
          email: payload.email,
          avatar: payload.picture || '',
          provider: 'google',
        });
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // renderButton triggers the full account chooser (not just One Tap)
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
    });

    // Trigger the prompt — shows the account picker popup
    window.google.accounts.id.prompt((notification) => {
      document.body.removeChild(container);
      if (notification.isNotDisplayed()) {
        reject(
          new Error(
            'Google sign-in popup was blocked. Please allow popups for this site and try again.'
          )
        );
      }
    });
  });
};
