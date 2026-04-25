/**
 * Google Identity Services (GIS) — returns a JWT `idToken` for backend verification.
 * Requires VITE_GOOGLE_CLIENT_ID in .env (must match server GOOGLE_CLIENT_ID).
 */

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
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
 * Shows the Google account picker and resolves with the OIDC `idToken` (JWT)
 * to send to POST /api/auth/google.
 */
export const getGoogleIdToken = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return Promise.reject(
      new Error('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID or use email/password.')
    );
  }

  return loadGoogleScript().then(
    () =>
      new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          callback: (response) => {
            if (!response?.credential) {
              reject(new Error('Google sign-in was cancelled.'));
              return;
            }
            resolve(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);

        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
        });

        window.google.accounts.id.prompt((notification) => {
          if (container.parentNode) {
            document.body.removeChild(container);
          }
          if (notification.isNotDisplayed()) {
            reject(
              new Error(
                'Google sign-in was blocked. Allow popups for this site, then try again.'
              )
            );
          }
        });
      })
  );
};

/** @deprecated use getGoogleIdToken + API /api/auth/google */
export const signInWithGoogle = async () => {
  const idToken = await getGoogleIdToken();
  return { idToken, provider: 'google' };
};
