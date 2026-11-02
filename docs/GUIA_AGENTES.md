# Guía Para Agentes De IA y Desarrolladores
## Ecosistema ESSALUD CONTIGO (IHM - UTP 2026-2)

Este documento define el protocolo de trabajo obligatorio para cualquier agente de Inteligencia Artificial y desarrollador que participe en el diseño, documentación o implementación del proyecto **"EsSalud Contigo"**.

---

## 1. Lectura Obligatoria Previa

Antes de proponer, estructurar o escribir código en cualquier módulo, el agente **DEBE** asimilar:

1. `docs-migracion/00-contexto-maestro.md` (Identidad, problema de EsSalud Mi Consulta, solución de doble rol, arquitectura Node.js + Supabase).
2. `docs-migracion/01-investigacion-essalud/01-analisis-essalud-consulta.md` (Diagnóstico del producto base).
3. `docs-migracion/02-sprints-academicos/` (El Sprint actual en desarrollo según el sílabo UTP).
4. `docs-migracion/03-arquitectura/01-arquitectura-sistema.md` (Contratos de datos, API REST y persistencia en Supabase).
5. `docs-migracion/05-ux-ui-accesibilidad/02-matriz-wcag-2-1.md` (Criterios WCAG 2.1 AAA y Heurísticas de Nielsen).

---

## 2. Reglas Estrictas e Inviolables

1. 🚫 **Prohibido el uso de Mocks Fantasma en memoria:**  
   Todo cambio de estado debe tener un endpoint REST en Node.js y reflejarse en la base de datos PostgreSQL de Supabase. La anterior crítica del docente radicaba en que *"todo era simulado"*; esa debilidad está erradicada.
2. 🚫 **Prohibido la sobreingeniería monolítica:**  
   No se implementarán frameworks pesados de backend (como Java Spring Boot con Redis) que compliquen la ejecución o el despliegue. Usamos **Node.js con Express, TypeScript y Supabase**, garantizando despliegue directo en **Vercel**.
3. 🎯 **Estándar WCAG 2.5.5 AAA en Móvil:**  
   Los botones táctiles del paciente deben tener un área mínima de **$64\times64\text{ px}$** (o clase Tailwind `h-16 w-full`) con separación suficiente para evitar pulsaciones erróneas por temblores o artritis.
4. 🔊 **Doble Canal Multimodal (Voz y Sonido):**  
   Toda acción crítica (toma confirmada, botón SOS, alerta de presión) debe contar con retroalimentación visual inmediata y soporte auditivo mediante **Web Speech API** (TTS en español pausado a 0.88x) y **Web Audio API** (chime y sirena sintetizados).
5. 🧪 **Atributos `data-testid` en todo componente:**  
   Todos los botones, campos de entrada y tarjetas deben portar un `data-testid` descriptivo (ej. `data-testid="btn-take-pill-64px"`, `data-testid="btn-sos-emergency"`).
6. 📐 **Límite de tamaño por archivo:**  
   Ningún componente React o archivo de servicio backend debe superar las **300 líneas**. Si crece, modularizar en subcomponentes o utilidades.

---

## 3. Protocolo de Trabajo por Tarea (Ciclo TDD & UCD)

Cada intervención técnica o de documentación debe seguir 5 pasos:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. ALCANCE  │ ──> │ 2. CONTRATO  │ ──> │ 3. CÓDIGO    │ ──> │ 4. VERIFICA- │ ──> │  5. RESUMEN  │
│  Validar rol │     │ Definir DTO  │     │ Implementar  │     │ CIÓN         │     │ Documentar   │
│ (Paciente o  │     │ o esquema    │     │ modularmente │     │ Compilación  │     │ cambios y    │
│  Cuidador)   │     │ Zod / SQL    │     │ en TS        │     │ npm run build│     │ métricas     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

1. **Alcance:** Identificar si la tarea afecta la experiencia móvil del adulto mayor o el dashboard web del cuidador.
2. **Contrato:** Definir el esquema de datos Zod y la ruta REST antes de codificar la interfaz.
3. **Código:** Escribir código tipado con TypeScript, respetando la paleta institucional y la accesibilidad.
4. **Verificación:** Ejecutar `npm run build` en frontend y backend para certificar cero errores de compilación.
5. **Resumen:** Documentar la justificación IHM/HCI del cambio y el criterio WCAG atendido.

---

## 4. Prompts Preconfigurados para Agentes Especializados

### A. Prompt para Agente Frontend & Accesibilidad (React 18 + TS + Tailwind)
```text
Actúa como Tech Lead Frontend y Especialista en Accesibilidad Universal (WCAG 2.1 AAA).
Trabajarás en el cliente de "EsSalud Contigo" (React 18, TypeScript, Vite, Tailwind CSS).

Directrices clave:
- Vista Móvil Paciente: botones de 64x64 px (h-16), tipografías grandes (text-base/text-lg), foto real de pastilla y Web Speech TTS (0.88x).
- Vista Web Cuidador: dashboards limpios, tablas de recetas, gráficas Recharts de presión arterial y exportador PDF.
- Todos los elementos interactivos deben tener 'data-testid'.
- Valida con Zod en formularios y consume la API REST de Node.js.
```

### B. Prompt para Agente Backend & Supabase (Node.js + Express + PostgreSQL)
```text
Actúa como Arquitecto Backend Senior y Especialista en Cloud Data con Node.js, Express y Supabase (PostgreSQL).
Diseña endpoints REST limpios, seguros y de alto rendimiento:

Directrices clave:
- TypeScript estricto con validaciones Zod.
- Controladores delegando a servicios de dominio clínico (cálculo de adherencia, alertas de presión >140/90, stock de farmacia EsSalud).
- Conexión SSL segura a la base de datos PostgreSQL de Supabase.
- Compatible para despliegue serverless en Vercel.
```

### C. Prompt para Agente de Investigación Académica e IHM (Sílabo UTP)
```text
Actúa como Investigador Académico en Interacción Humano-Computadora (HCI / IHM).
Tu tarea es redactar y actualizar los informes de Sprints (APF1, APF2, APF3 y PROYECTO FINAL):

Directrices clave:
- Utiliza terminología científica formal: Modelo de Norman, GOMS, Heurísticas de Nielsen, ISO 9241-11, SUS de Brooke.
- Basa los análisis en el caso real de "EsSalud Mi Consulta" frente a "EsSalud Contigo".
- Incluye matrices de variables, protocolos con perfiles de adultos mayores y cálculos paso a paso del puntaje SUS.
- Redacta con citas en formato APA 7.
```
