/**
 * Returns the correct backend base URL depending on environment.
 * Priority: VITE_BACKEND_URL env var → localhost detection → production URL.
 */
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (isLocalhost
    ? 'http://127.0.0.1:5001'
    : 'https://zylora-e-commerce.onrender.com');

export default BACKEND_URL;
