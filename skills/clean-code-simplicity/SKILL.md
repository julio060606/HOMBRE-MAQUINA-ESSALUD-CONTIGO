---
name: clean-code-simplicity
description: Directrices estrictas para desarrollar código simple, legible y con pocas líneas por archivo (máximo 150-200 líneas) sin sobreingeniería.
---

# Skill: Clean Code & Simplicidad Máxima (EsSalud Contigo)

Este skill define las directrices obligatorias para mantener el código del proyecto **EsSalud Contigo** ultra simple, directo, modular y fácil de mantener y defender ante el jurado docente.

---

## 1. Principio Fundamental: Simplicidad sobre Abstracción (KISS)

* 🚫 **Prohibido la sobreingeniería:** No crear patrones abstractos complejos (no factories innecesarias, no middlewares anidados de 5 niveles, no herencias profundas).
* 🎯 **Límite de líneas por archivo:**
  * Controladores backend: **máximo 120 líneas**.
  * Servicios de negocio: **máximo 150 líneas**.
  * Componentes React: **máximo 180 líneas**. Si un componente supera este límite, extraer subcomponentes visuales.
* 🧩 **Funciones pequeñas de una sola responsabilidad:**
  * Cada función debe realizar una única tarea y tener entre 10 y 30 líneas de código.

---

## 2. Reglas Específicas por Capa

### A. Backend (Node.js + Express + TypeScript)
1. **Rutas Claras y Directas:** Cada recurso tiene su archivo de rutas (`patientRoutes.ts`, `intakeRoutes.ts`).
2. **Controladores Delgados:** El controlador solo extrae parámetros (`req.params`, `req.body`), llama al servicio y responde con JSON y código de estado adecuado (`200`, `201`, `400`, `500`).
3. **Servicios Concisos:** Métodos directos que consultan Supabase PostgreSQL y aplican las reglas clínicas (ej. calcular adherencia o validar presión $>140/90$).
4. **Cero Mocks:** Todas las operaciones leen o escriben en Supabase.

### B. Frontend (React 18 + TypeScript + Tailwind)
1. **Componentes Funcionales Limpios:** Usar hooks nativos (`useState`, `useEffect`, hooks personalizados).
2. **Manejo de Errores Amigable:** Siempre mostrar toasts o mensajes visuales si una petición falla.
3. **Accesibilidad Integrada:** Todo botón táctil para el anciano usa `h-16` ($64\text{ px}$) y texto de alto contraste.
4. **Atributos `data-testid`:** En cada botón o input relevante para testing y demostraciones.
