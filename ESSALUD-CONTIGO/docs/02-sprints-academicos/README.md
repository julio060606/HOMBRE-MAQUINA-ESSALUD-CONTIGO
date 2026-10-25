# Roadmap de Sprints Académicos (IHM - UTP 2026-Ciclo 2 Agosto)
## Trazabilidad y Correspondencia con el Sílabo Oficial (100000S82T)

Este directorio documenta la evolución del proyecto **"EsSalud Contigo"** a lo largo de las 18 semanas académicas del curso de **Interacción Hombre-Máquina**, estructurado formalmente en **4 Sprints de Desarrollo e Investigación**.

---

## 📊 Matriz de Sprints y Evaluaciones

$$\text{Promedio Final} = 20\%\text{APF1} + 20\%\text{APF2} + 20\%\text{APF3} + 10\%\text{PA} + 30\%\text{PROY}$$

```
┌─────────┬──────────────┬───────────────────────────────┬───────────────────┬────────────────────────────────┐
│ Sprint  │ Semanas      │ Unidad de Aprendizaje         │ Tipo Evaluación   │ Foco Principal de IHM          │
├─────────┼──────────────┼───────────────────────────────┼───────────────────┼────────────────────────────────┤
│ SP-01   │ Semanas 1-4  │ Unidad 1: Fundamentos y       │ APF1 (20%)        │ - UCD (Diseño Centrado Usuario)│
│         │              │ Modelos de Interacción        │                   │ - Ciclo de Norman (7 etapas)   │
│         │              │                               │                   │ - Modelo GOMS y errores        │
│         │              │                               │                   │ - Auditoría a EsSalud Consulta │
├─────────┼──────────────┼───────────────────────────────┼───────────────────┼────────────────────────────────┤
│ SP-02   │ Semanas 5-9  │ Unidad 2: Metodologías de     │ APF2 (20%)        │ - Prototipado Interactivo      │
│         │              │ Diseño y Evaluación Interfaces│                   │ - Diseño Experimental A/B      │
│         │              │                               │                   │ - Métricas Eficiencia/Efectiv. │
│         │              │                               │                   │ - Escala SUS (Puntaje 95.83)   │
├─────────┼──────────────┼───────────────────────────────┼───────────────────┼────────────────────────────────┤
│ SP-03   │ Semanas 10-13│ Unidad 3: Accesibilidad       │ APF3 (20%)        │ - Accesibilidad Universal      │
│(ACTUAL) │              │ Universal y Diseño Inclusivo  │                   │ - WCAG 2.1 (A, AA, AAA)        │
│         │              │                               │                   │ - Discapacidad Sensorial/Motora│
│         │              │                               │                   │ - Botón 64px y Web Speech TTS  │
├─────────┼──────────────┼───────────────────────────────┼───────────────────┼────────────────────────────────┤
│ SP-04   │ Semanas 14-18│ Unidad 4: Interfaces Avanzadas│ PROYECTO FINAL    │ - Interfaces Emergentes de Voz │
│         │              │ y Nuevos Paradigmas           │ (30%) + PA (10%)  │ - Backend Node.js en la Nube   │
│         │              │                               │                   │ - Base de Datos Supabase Real  │
│         │              │                               │                   │ - Sustentación ante Jurado     │
└─────────┴──────────────┴───────────────────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 📁 Documentos Detallados por Sprint

1. **[Sprint 1: Fundamentos, Modelos Cognitivos y Norman](./sprint-01-fundamentos-norman.md)**  
   *Contenido:* Diagnóstico de *EsSalud Mi Consulta*, justificación UX vs GUI, análisis de carga cognitiva, modelo de Norman de 7 etapas y aplicación de las 10 heurísticas de Nielsen.
2. **[Sprint 2: Prototipado Interactivo y Evaluación SUS](./sprint-02-usabilidad-sus.md)**  
   *Contenido:* Variables del experimento (Tabla ISO 9241-11), definición de tareas T1/T2/T3, perfiles de simulación (Dacio, Elena, Gerson), matriz SUS detallada y trazabilidad de mejoras.
3. **[Sprint 3: Accesibilidad Universal y WCAG 2.1 (ACTUAL)](./sprint-03-accesibilidad-wcag.md)**  
   *Contenido:* Matriz de criterios WCAG 2.1 Niveles A, AA y AAA, adecuación sensorial (presbicia y Web Speech TTS), adecuación motora (Target Size 64px) y pruebas inclusivas.
4. **[Sprint 4: Interfaces Emergentes y Despliegue Cloud](./sprint-04-proyecto-final.md)**  
   *Contenido:* Interacción por voz multimodal, integración de Node.js Express REST con base de datos PostgreSQL en Supabase, despliegue en Vercel y checklist de sustentación final.
