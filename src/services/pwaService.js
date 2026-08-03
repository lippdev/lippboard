const APP_VERSION = '2026-08-03-3';
const APP_CACHE_PREFIX = 'lippboard-shell-';
const APP_BUILD_KEY = 'lippboard_app_version';

export async function clearPwaCache({ reload = false } = {}) {
  if (typeof window === 'undefined') return false;

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(APP_CACHE_PREFIX) || key.includes('workbox') || key.includes('vite'))
          .map((key) => caches.delete(key))
      );
    }

    localStorage.removeItem(APP_BUILD_KEY);
    sessionStorage.removeItem('lippboard_session_auth');

    if (reload) {
      window.location.reload();
    }

    return true;
  } catch (err) {
    console.error('Falha ao limpar cache do PWA:', err);
    throw err;
  }
}

export async function syncAppVersion() {
  if (typeof window === 'undefined') return false;
  const storedVersion = localStorage.getItem(APP_BUILD_KEY);
  if (storedVersion !== APP_VERSION) {
    localStorage.setItem(APP_BUILD_KEY, APP_VERSION);
    await clearPwaCache({ reload: false });
    return true;
  }
  return false;
}

export { APP_VERSION, APP_BUILD_KEY };
