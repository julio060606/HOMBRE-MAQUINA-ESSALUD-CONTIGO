import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales con CORS permisivo para Vercel
app.use(cors({ origin: true, credentials: true }));
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

// Rutas principales del sistema - Resiliente ante reescrituras de Vercel
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Arranque del servidor - Solo escuchar si se ejecuta localmente (en Vercel actúa como runtime serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor EsSalud Contigo corriendo en http://localhost:${PORT}`);
    console.log(`📡 Endpoints REST listos bajo /api/v1`);
  });
}

export default app;
