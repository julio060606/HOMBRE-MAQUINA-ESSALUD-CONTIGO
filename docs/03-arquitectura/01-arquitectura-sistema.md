# Arquitectura del Sistema: EsSalud Contigo
## Diseño Técnico Desacoplado, Cloud-Native y Multidispositivo

---

## 1. Visión General de la Arquitectura

"EsSalud Contigo" está diseñado bajo el principio de **desacoplamiento total** entre la capa de presentación (frontend adaptativo para dos factores de forma), la capa de servicios y lógica de negocio (backend REST en Node.js) y la capa de persistencia relacional en la nube (PostgreSQL en Supabase):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CAPA DE CLIENTES (FRONTEND)                          │
├────────────────────────────────────────┬───────────────────────────────────────────────┤
│ 📱 VISTA MÓVIL (ASEGURADO MAYOR)       │ 💻 VISTA WEB ESCRITORIO (CUIDADOR / FAMILIAR) │
│ - Pantalla táctil ultra-simplificada   │ - Dashboard clínico panorámico                │
│ - Botones gigantes de 64x64 px         │ - Gráficos interactivos de presión (Recharts) │
│ - Web Speech API (Síntesis de voz)     │ - Gestión de recetas de EsSalud y stock       │
│ - Web Audio API (Sirena SOS y chime)   │ - Exportador de reportes médicos en PDF       │
└───────────────────┬────────────────────┴───────────────────────┬───────────────────────┘
                    │                                            │
                    │ Peticiones HTTPS / JSON (REST API)         │ Peticiones HTTPS / JSON
                    ▼                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE NEGOCIO Y API (BACKEND NODE.JS)                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ - Framework: Express con TypeScript estricto.                                          │
│ - Validación de entrada: Esquemas Zod para prevenir inyecciones y datos erróneos.      │
│ - Lógica de Negocio:                                                                   │
│   * Cálculo dinámico de porcentaje de adherencia diaria.                               │
│   * Evaluación clínica de presión arterial (Generación de alertas si > 140/90 mmHg).   │
│   * Descuento automático de existencias en farmacia por cada toma confirmada.          │
│   * Despacho y registro de eventos críticos de auxilio SOS.                            │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Conexión PostgreSQL SSL (Prisma / pg)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       CAPA DE DATOS EN LA NUBE (SUPABASE POSTGRESQL)                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ - Motor: PostgreSQL 15 en la nube (Supabase Cloud).                                    │
│ - Tablas relacionales con integridad referencial estricta y llaves foráneas.           │
│ - Canales de suscripción en tiempo real (WebSockets) para actualización instantánea.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tecnologías y Responsabilidades por Capa

### A. Capa de Frontend (Cliente Web + Móvil PWA)
* **Framework:** React 18+ estructurado en módulos funcionales.
* **Empaquetador y Build:** Vite 5 (arranque instantáneo y optimización de bundles para producción).
* **Lenguaje:** TypeScript 5 (tipado estático riguroso en interfaces clínicas).
* **Estilos y Accesibilidad:** Tailwind CSS con tokens de contraste alto (WCAG AAA) y paleta institucional de EsSalud.
* **Componentes de Accesibilidad:**
  * `Web Speech API`: Motor nativo del navegador para lectura en voz alta en español (`es-PE`, `es-419`, `0.88x`).
  * `Web Audio API`: Generación sintética de tonos (chime de confirmación y sirena de pánico SOS sin archivos pesados).

### B. Capa de Backend (Servidor REST en Node.js)
* **Entorno de Ejecución:** Node.js 20 LTS con Express.
* **Lenguaje:** TypeScript compilado a JavaScript limpio.
* **Estructura Interna:**
  * `controllers/`: Recepción de peticiones HTTP, extracción de parámetros y códigos de estado (200, 201, 400, 404, 500).
  * `services/`: Reglas clínicas, algoritmos de adherencia y evaluación de hipertensión.
  * `routes/`: Enrutamiento modular (`/api/pacientes`, `/api/recetas`, `/api/tomas`, `/api/presion`, `/api/alertas`).

### C. Capa de Datos (Supabase Cloud)
* **Hosting:** Servidor gestionado en la nube con réplicas automáticas y copias de seguridad continuas.
* **Seguridad:** Row Level Security (RLS) y variables de entorno protegidas (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

---

## 3. Despliegue en Producción (Topología Vercel)

El proyecto se despliega de forma unificada en **Vercel**:
* El Frontend se publica en la red de borde (Edge Network) de Vercel para carga ultrarrápida.
* El Backend en Node.js se ejecuta mediante **Vercel Serverless Functions** (`/api`), compartiendo el mismo dominio HTTPS sin problemas de CORS ni certificados SSL manuales.
* La base de datos en Supabase recibe las conexiones seguras desde Vercel con latencias inferiores a $45\text{ ms}$.
