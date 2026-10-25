import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env raíz
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // Fallback a directorio actual

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ Advertencia: DATABASE_URL no encontrada en variables de entorno.');
}

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Requerido para conexión segura con Supabase Cloud
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

pool.on('error', (err) => {
  console.error('❌ Error imprevisto en el pool de Supabase PostgreSQL:', err);
});
