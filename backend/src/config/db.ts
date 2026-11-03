import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env raíz y local
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // Fallback a directorio actual

let connectionString = process.env.DATABASE_URL || '';

// En Vercel / AWS Lambda la red es estrictamente IPv4.
// La conexión directa 'db.liozqlizpovzlgmzjiic.supabase.co' es IPv6-only y produce 'ENOTFOUND'.
// Si no hay DATABASE_URL o si apunta al host directo IPv6, usar el Supabase Connection Pooler IPv4 oficial:
if (!connectionString || connectionString.includes('db.liozqlizpovzlgmzjiic.supabase.co')) {
  connectionString = 'postgresql://postgres.liozqlizpovzlgmzjiic:kKmpObbYG0XY5VSa@aws-1-us-west-2.pooler.supabase.com:6543/postgres';
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
