/// <reference types="vite/client" />

export const ENV = {
  // En local (puerto 3000), redirige al backend local (4000). En producción (Vercel), usa la ruta relativa /api/v1
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== '')
    ? import.meta.env.VITE_API_BASE_URL
    : (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000')
      ? 'http://localhost:4000/api/v1'
      : '/api/v1',
};
