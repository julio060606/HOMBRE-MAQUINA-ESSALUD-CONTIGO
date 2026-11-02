# Documentación del Ecosistema ESSALUD CONTIGO
## Plataforma de Teleasistencia, Accesibilidad Universal (WCAG 2.1) y Monitoreo del Asegurado Crónico

Bienvenido al repositorio de documentación técnica, arquitectónica y experimental de **"EsSalud Contigo"**, desarrollado para la asignatura de **Interacción Hombre-Máquina (100000S82T) - UTP 2026-Ciclo 2 Agosto**.

Esta documentación constituye la **fuente única de verdad (Single Source of Truth)** para el desarrollo de software y la elaboración de los informes académicos de evaluación continua (APF1, APF2, APF3 y Proyecto Final).

---

## 🧭 Orden de Lectura Obligatorio

1. **[00. Contexto Maestro del Proyecto](./00-contexto-maestro.md)**: Visión, justificación clínica de EsSalud, roles (Paciente / Cuidador) y arquitectura técnica.
2. **[Guía para Agentes de IA y Desarrolladores](./GUIA_AGENTES.md)**: Reglas de oro, directrices de clean code y prompts especializados.
3. **[01. Investigación y Diagnóstico de EsSalud Mi Consulta](./01-investigacion-essalud/01-analisis-essalud-consulta.md)**: Módulos, arquitectura base, fallas de usabilidad y quejas reales en Play Store.
4. **[02. Roadmap de Sprints Académicos (Sílabo UTP)](./02-sprints-academicos/README.md)**:
   - `SP-01`: Fundamentos, UCD, Ciclo de Norman y Heurísticas (Semanas 1-4 | APF1).
   - `SP-02`: Métricas experimentales, Tareas T1-T3 y Escala SUS (Semanas 5-9 | APF2).
   - `SP-03`: **Accesibilidad Universal y WCAG 2.1 AAA (Semanas 10-13 | APF3 - ACTUAL)**.
   - `SP-04`: Interfaces emergentes por voz, Backend Cloud y Demo Final (Semanas 14-18 | PROY).
5. **[03. Arquitectura Técnica y Cloud](./03-arquitectura/01-arquitectura-sistema.md)**: Frontend React 18, Backend Node.js / Express y Base de Datos PostgreSQL en Supabase.
6. **[04. Especificación Funcional de Módulos](./04-modulos/README.md)**:
   - `MOD-00`: Landing Page Institucional y Acceso Unificado.
   - `MOD-01`: Onboarding y Vinculación Cuidador-Asegurado.
   - `MOD-02`: App Móvil del Paciente (Botón 64px, TTS 0.88x, Foto real y SOS).
   - `MOD-03`: Dashboard Web del Cuidador (Adherencia, Vitals y Alertas).
   - `MOD-04`: Gestión de Recetas Crónicas y Existencias en Farmacia.
   - `MOD-05`: Históricos Biométricos y Generador de Reporte PDF.
   - `MOD-06`: Ajustes de Accesibilidad y Configuración Clínica.
7. **[05. UX/UI y Accesibilidad Universal](./05-ux-ui-accesibilidad/01-guia-estilos-essalud.md)**: Tokens de color institucional de EsSalud (`#005696`), tipografía escalable y matriz WCAG 2.1.
8. **[06. Decisiones de Arquitectura (ADRs)](./06-decisiones-arquitectura/ADR-001-dual-app-web.md)**: Justificación técnica del desacoplamiento dual y la selección de Supabase + Node.js.
9. **[07. Plantilla del Informe Word APF3](./07-entregables-word/APF3-Estructura-Word-Semana13.md)**: Guía estructurada para redactar y exportar la entrega de Semana 13.

---

## 📁 Estructura del Directorio

```text
docs-migracion/
├── 00-contexto-maestro.md              # Documento fundacional y rector
├── GUIA_AGENTES.md                     # Manual y protocolo de trabajo
├── README.md                           # Índice maestro y orden de lectura
│
├── 01-investigacion-essalud/           # Investigación del producto base oficial
│   ├── 01-analisis-essalud-consulta.md # Arquitectura, módulos y población asegurada
│   └── 02-auditoria-heuristica-playstore.md # Evaluación heurística y quejas en Play Store
│
├── 02-sprints-academicos/              # Sprints sincronizados con el sílabo UTP
│   ├── README.md                       # Matriz general de Sprints
│   ├── sprint-01-fundamentos-norman.md # APF1: UCD, ciclo de Norman, modelos mentales
│   ├── sprint-02-usabilidad-sus.md     # APF2: Variables experimentales, pruebas SUS
│   ├── sprint-03-accesibilidad-wcag.md # APF3: Accesibilidad sensorial, motora y cognitiva
│   └── sprint-04-proyecto-final.md     # PROY: Paradigmas emergentes y sustentación
│
├── 03-arquitectura/                    # Arquitectura técnica y datos
│   ├── 01-arquitectura-sistema.md      # Dual App (Web Escritorio + Web Móvil/PWA)
│   ├── 02-plan-backend-node-supabase.md# Servidor REST Node.js + Supabase PostgreSQL
│   └── 03-modelo-datos.md              # Esquema SQL relacional
│
├── 04-modulos/                         # Especificaciones funcionales detalladas
│   ├── README.md
│   ├── mod-00-landing-acceso.md
│   ├── mod-01-onboarding-vinculacion.md
│   ├── mod-02-experiencia-paciente.md
│   ├── mod-03-dashboard-cuidador.md
│   ├── mod-04-medicamentos-recetas.md
│   ├── mod-05-historicos-reporte.md
│   └── mod-06-ajustes-accesibilidad.md
│
├── 05-ux-ui-accesibilidad/             # Guía visual y accesibilidad universal
│   ├── 01-guia-estilos-essalud.md      # Colores institucionales y tipografía
│   ├── 02-matriz-wcag-2-1.md           # Matriz WCAG 2.1 Niveles A, AA y AAA
│   └── 03-componentes-y-patrones.md    # Catálogo de componentes táctiles y auditivos
│
├── 06-decisiones-arquitectura/         # Architectural Decision Records (ADRs)
│   ├── ADR-001-dual-app-web.md         # Separación de roles Móvil vs Escritorio
│   └── ADR-002-backend-node-supabase.md# Node.js + Supabase en la nube
│
└── 07-entregables-word/                # Plantillas y guías de redacción para Word
    └── APF3-Estructura-Word-Semana13.md# Estructura del Informe APF3 (Semana 13)
```
