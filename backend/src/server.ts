import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes';

const app = express();
// En Render se asigna PORT automáticamente mediante variable de entorno
const PORT = Number(process.env.PORT) || 4000;

// Middlewares globales con CORS permisivo para soportar el Frontend en Vercel o local
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Endpoint de verificación de salud (Health Check)
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'EsSalud Contigo REST API (Render Node.js)',
    database: 'Supabase PostgreSQL Cloud',
    timestamp: new Date().toISOString()
  });
});

// Rutas principales del sistema
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Arranque permanente de servidor Node.js (Servicio Web nativo para Render y Local)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor EsSalud Contigo corriendo en puerto ${PORT}`);
  console.log(`📡 Endpoints REST listos bajo /api/v1`);
  console.log(`🩺 Health check disponible en /health`);
});

// Compatibilidad modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

export default app;
