"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno desde el archivo .env raíz
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
dotenv_1.default.config(); // Fallback a directorio actual
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn('⚠️ Advertencia: DATABASE_URL no encontrada en variables de entorno.');
}
exports.pool = new pg_1.Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Requerido para conexión segura con Supabase Cloud
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
const query = (text, params) => exports.pool.query(text, params);
exports.query = query;
exports.pool.on('error', (err) => {
    console.error('❌ Error imprevisto en el pool de Supabase PostgreSQL:', err);
});
