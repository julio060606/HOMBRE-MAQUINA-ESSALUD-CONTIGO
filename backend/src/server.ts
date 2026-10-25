import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de verificación de salud (Health Check)
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'EsSalud Contigo REST API',
    database: 'Supabase PostgreSQL Cloud',
    timestamp: new Date().toISOString()
  });
});

// Rutas principales del sistema
app.use('/api/v1', apiRoutes);

// Arranque del servidor local (solo si no es entorno serverless de Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor EsSalud Contigo corriendo en http://localhost:${PORT}`);
    console.log(`📡 Endpoints REST disponibles bajo http://localhost:${PORT}/api/v1`);
  });
}

export default app;
