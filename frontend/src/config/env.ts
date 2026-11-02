/// <reference types="vite/client" />

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Si NO estamos en localhost (es decir, estamos en Vercel o cualquier dominio en la nube),
    // NUNCA jamás permitir localhost. Usar siempre la ruta relativa /api/v1
    if (!isLocalhost) {
      return '/api/v1';
    }

    // Si estamos en localhost:3000 (desarrollo local del frontend), apuntar a localhost:4000
    if (window.location.port === '3000') {
      return 'http://localhost:4000/api/v1';
    }
  }

  // Fallback por defecto seguro: ruta relativa
  return '/api/v1';
}

export const ENV = {
  API_BASE_URL: getApiBaseUrl(),
};
