"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middlewares globales con CORS permisivo para Vercel
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
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
app.use('/api/v1', apiRoutes_1.default);
app.use('/api', apiRoutes_1.default);
app.use('/', apiRoutes_1.default);
// Arranque del servidor - Solo escuchar si se ejecuta localmente (en Vercel actúa como runtime serverless)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor EsSalud Contigo corriendo en http://localhost:${PORT}`);
        console.log(`📡 Endpoints REST listos bajo /api/v1`);
    });
}
exports.default = app;
