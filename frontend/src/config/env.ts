/// <reference types="vite/client" />

function getApiBaseUrl(): string {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 0. Detección dinámica y persistente vía query param (?backend=https://... o ?api=https://...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryBackend = urlParams.get('backend') || urlParams.get('api');
      if (queryBackend) {
        let clean = queryBackend.trim().replace(/\/+$/, '');
        if (!clean.endsWith('/api/v1')) {
          clean = clean.endsWith('/api') ? `${clean}/v1` : `${clean}/api/v1`;
        }
        localStorage.setItem('VITE_API_BASE_URL', clean);
        return clean;
      }

      // Si ya fue guardado en localStorage previamente en este navegador
      const saved = localStorage.getItem('VITE_API_BASE_URL');
      if (saved && !isLocalhost) {
        let clean = saved.trim().replace(/\/+$/, '');
        if (!clean.endsWith('/api/v1')) {
          clean = clean.endsWith('/api') ? `${clean}/v1` : `${clean}/api/v1`;
        }
        return clean;
      }
    } catch {
      // ignore
    }

    // 1. Variable de entorno configurada en Vercel Dashboard (VITE_API_BASE_URL)
    if (envUrl) {
      const isEnvLocalhost = envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
      if (!isLocalhost && isEnvLocalhost) {
        return '/api/v1';
      }
      let clean = envUrl.replace(/\/+$/, '');
      if (!clean.endsWith('/api/v1')) {
        clean = clean.endsWith('/api') ? `${clean}/v1` : `${clean}/api/v1`;
      }
      return clean;
    }

    // 2. Si estamos en desarrollo local en localhost:3000, apuntar al backend local 4000
    if (isLocalhost && (window.location.port === '3000' || window.location.port === '5173')) {
      return 'http://localhost:4000/api/v1';
    }

    // 3. Fallback de producción si no hay URL configurada
    if (!isLocalhost) {
      return '/api/v1';
    }
  }

  // Fallback seguro
  if (envUrl) {
    let clean = envUrl.replace(/\/+$/, '');
    if (!clean.endsWith('/api/v1')) {
      clean = clean.endsWith('/api') ? `${clean}/v1` : `${clean}/api/v1`;
    }
    return clean;
  }
  return '/api/v1';
}

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
};
