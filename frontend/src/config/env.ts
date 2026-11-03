/// <reference types="vite/client" />

function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();

  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 1. Si se configuró una URL explícita (ej. backend desplegado en Vercel o Railway)
    if (envUrl) {
      const isEnvLocalhost = envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
      // Si estamos en producción en la nube, jamás permitir que use localhost
      if (!isLocalhost && isEnvLocalhost) {
        return '/api/v1';
      }
      return envUrl.replace(/\/+$/, '');
    }

    // 2. Si estamos en desarrollo local en el puerto 3000, apuntar al backend local 4000
    if (isLocalhost && (window.location.port === '3000' || window.location.port === '5173')) {
      return 'http://localhost:4000/api/v1';
    }

    // 3. Si estamos en producción en la nube sin URL explícita, usar ruta relativa /api/v1 (rewrites)
    if (!isLocalhost) {
      return '/api/v1';
    }
  }

  // Fallback seguro
  return envUrl ? envUrl.replace(/\/+$/, '') : '/api/v1';
}

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
};
