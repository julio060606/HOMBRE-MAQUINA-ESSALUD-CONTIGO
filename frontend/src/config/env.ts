/// <reference types="vite/client" />

export const ENV = {
  // En producción (Vercel con multiservicio o dominio único), las peticiones van a /api/v1 relativo
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.origin ? '/api/v1' : 'http://localhost:4000/api/v1'),
};
