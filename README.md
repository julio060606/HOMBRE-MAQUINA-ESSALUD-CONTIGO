# EsSalud Contigo: Ecosistema de Teleasistencia Geriátrica y Accesibilidad Universal
## Asignatura: Interacción Hombre-Máquina (100000S82T) - UTP 2026-Ciclo 2 Agosto

Este repositorio contiene el código fuente y la documentación técnica del proyecto **"EsSalud Contigo"**, una solución de doble rol diseñada para mejorar la adherencia farmacológica, monitoreo de signos vitales y respuesta a emergencias de adultos mayores con enfermedades crónicas adscritos al Seguro Social de Salud del Perú (**EsSalud**).

---

## 🏛️ Arquitectura del Proyecto

El sistema está estructurado en capas desacopladas, simples y sin sobreingeniería:

* **`/frontend`**: Aplicación web y móvil desarrollada en **React 18 + Vite + TypeScript + Tailwind CSS**, con soporte de síntesis de voz (Web Speech API) y efectos auditivos (Web Audio API).
* **`/backend`**: Servidor REST en **Node.js + Express + TypeScript** con lógica de negocio clínica (cálculo de adherencia, alertas de presión $>140/90$ y control de stock de pastillas).
* **`/supabase`**: Base de datos relacional PostgreSQL 15 en la nube de **Supabase**, garantizando persistencia real en todas las operaciones.
* **`/docs`**: Documentación académica estructurada en Sprints alineados al sílabo de la UTP.
* **`/.agents`**: Skills y reglas de Antigravity para mantener código limpio (< 200 líneas por archivo) y auditar la accesibilidad WCAG 2.1 AAA.

---

## 🚀 Inicio Rápido (Desarrollo Local)

### 1. Requisitos Previos
* Node.js v18 o superior.
* npm v9 o superior.

### 2. Instalación de Dependencias
```bash
npm run install:all
```

### 3. Ejecutar en Modo Desarrollo (Frontend + Backend simultáneos)
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend REST API:** `http://localhost:4000/api/v1`
* **Base de Datos:** Conectada directamente a Supabase Cloud (`db.liozqlizpovzlgmzjiic.supabase.co:5432`).
