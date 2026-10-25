# ADR-002: Adopción de Backend REST en Node.js y Base de Datos Cloud en Supabase (PostgreSQL)

* **Estado:** Aceptado y Vigente.
* **Fecha:** Octubre 2026.
* **Contexto:** En el avance anterior, el prototipo utilizaba un archivo de datos en memoria local (`mockData.ts`), lo que provocó la observación del docente de que *"no había backend y todo estaba simulado"*. Asimismo, los planes iniciales de utilizar Java Spring Boot 3 con Redis y Docker introducían una sobrecarga de configuración que dificultaba el despliegue ágil en la nube y la evaluación fluida por parte del jurado.

---

## 1. Decisión Tomada

Implementar un backend ágil, desacoplado y 100% persistente en la nube compuesto por:

1. **Servidor REST en Node.js + Express con TypeScript:**
   * Expone endpoints estandarizados con validación de esquemas Zod.
   * Centraliza las reglas de negocio (cálculo de adherencia, detección de hipertensión $> 140/90\text{ mmHg}$ y descuento de pastillas por toma).
   * Desplegable como Serverless Functions en **Vercel** en el mismo dominio del frontend.
2. **Base de Datos Cloud Relacional en Supabase (PostgreSQL 15):**
   * Aloja las tablas relacionales (`pacientes`, `cuidadores`, `recetas`, `tomas_diarias`, `registros_presion`, `alertas_clinicas`).
   * Soporta suscripciones en tiempo real mediante WebSockets para actualizar el dashboard del cuidador sin recargar.

---

## 2. Consecuencias Positivas

* **Cero Mocks Fantasma:** Todas las tomas, mediciones y alertas se guardan en una base de datos real en la nube. Si el evaluador abre el enlace en su propio celular o laptop, los datos persisten y se sincronizan de verdad.
* **Despliegue Continuo en Vercel:** Todo el stack (Frontend + Backend Serverless) se publica de forma automática en Vercel con certificados HTTPS y alta disponibilidad.
* **Facilidad de Mantenimiento:** El grupo puede clonar el repositorio y levantarlo en segundos con `npm install` y `npm run dev`, sin requerir motores Java complejos ni contenedores Docker pesados.

---

## 3. Alternativas Descartadas

* **Opción A (Continuar con Mocks en Memoria):** Descartada categóricamente para evitar observaciones académicas en la entrega final.
* **Opción B (Monolito en Java Spring Boot con Docker):** Descartada por complejidad innecesaria de despliegue en Vercel y mayor latencia de desarrollo.
* **Opción C (Conectar Frontend directamente a Supabase sin Backend Node):** Descartada porque se perdería la capa de lógica de negocio, validaciones clínicas y control de alertas en el servidor.
