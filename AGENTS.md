# Reglas del Proyecto: ESSALUD CONTIGO

Estas directrices son obligatorias para todo agente de IA y desarrollador en el repositorio **ESSALUD-CONTIGO**:

---

## 1. Reglas de Simplicidad y Arquitectura

1. 🚫 **Máximo 150-200 líneas por archivo:** Mantener controladores, servicios y componentes React pequeños y modulares.
2. 🚫 **Cero Mocks Fantasma:** Toda operación se conecta a la base de datos real en Supabase (PostgreSQL).
3. 📦 **ORM / Supabase Client Directo:** No usar Flyway (evitar dependencias de Java en Node.js). Usar Prisma o el cliente directo de Supabase con scripts SQL versionados.
4. 📱 **Accesibilidad WCAG 2.5.5 AAA:** En la vista del paciente, todo botón táctil debe medir al menos **$64\times64\text{ px}$** (`h-16`) con tipografía de alto contraste y voz asistiva en español.
5. 🧪 **Atributos `data-testid`:** Incluir identificadores claros en cada botón o campo interactivo para pruebas y demostraciones.
