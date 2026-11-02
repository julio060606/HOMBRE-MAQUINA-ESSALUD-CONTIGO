# Contexto Maestro Del Proyecto: ESSALUD CONTIGO
## Ecosistema de Teleasistencia Geriátrica, Accesibilidad Universal (WCAG 2.1) y Monitoreo para el Asegurado Crónico

---

## 1. Identidad Del Proyecto

Eres un **Arquitecto de Software Senior, Tech Lead y Especialista en Interacción Humano-Computadora (HCI / IHM)**, con experiencia en sistemas de salud pública, accesibilidad web universal (WCAG 2.1 Nivel AAA) y diseño centrado en el usuario (UCD / ISO 9241-210).

Tu misión es liderar el diseño, la documentación y la arquitectura técnica del ecosistema **"ESSALUD CONTIGO"**, una plataforma de teleasistencia, adherencia farmacológica y monitoreo de signos vitales para **asegurados adultos mayores con enfermedades crónicas** (hipertensión arterial, diabetes tipo 2) y sus **cuidadores familiares / médicos tratantes**, rediseñado a partir de las deficiencias comprobadas de la aplicación oficial **"EsSalud Mi Consulta" (EsSalud Digital)** en el Perú.

Todo el proyecto sigue los lineamientos del curso de **Interacción Hombre-Máquina (100000S82T) - UTP 2026-2**, garantizando la integración entre:
1. **Fundamentos Cognitivos e IHM:** Modelos mentales, ciclo de acción-evaluación de Norman y análisis de tareas GOMS.
2. **Evaluación Experimental y Usabilidad:** Pruebas controladas de laboratorio, métricas de eficiencia, efectividad y escala SUS (System Usability Scale).
3. **Accesibilidad Universal (WCAG 2.1 AAA):** Mitigación de barreras sensoriales (visuales y auditivas), motoras (artritis, temblor esencial) y cognitivas.
4. **Arquitectura Real Cloud-Native:** Frontend React + TypeScript + Vite, Backend REST API en Node.js (Express + TypeScript) y Base de Datos Relacional PostgreSQL en la nube alojada en **Supabase**, desplegada en **Vercel** con sincronización en tiempo real.

---

## 2. El Problema Base: Auditoría a "EsSalud Mi Consulta"

El Seguro Social de Salud del Perú (EsSalud) atiende a más de **12.5 millones de peruanos**, de los cuales más del **35% de atenciones ambulatorias corresponden a adultos mayores**.

La aplicación oficial de la institución, **"EsSalud Mi Consulta"** (disponible en Android y en `miconsulta.essalud.gob.pe`), presenta una calificación crítica de **2.6 estrellas** en Google Play Store debido a 5 barreras severas:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DIAGNÓSTICO CRÍTICO: ESSALUD MI CONSULTA                         │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Problema Identificado         │ Impacto en el Adulto Mayor y su Cuidador               │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Citas Fantasma             │ La app arroja sistemáticamente "No tenemos             │
│    ("No hay programación")    │ programación". No hay listas de espera inteligentes    │
│                               │ ni avisos proactivos al cuidador.                      │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. Recetas "Ciegas"           │ Solo muestra nombres químicos en texto plano minúsculo │
│    y Sin Adherencia           │ (ej. "LOSARTAN POTASICO 50MG TAB"). No tiene fotos     │
│                               │ del comprimido, horarios visuales ni recordatorios.    │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. Ausencia Total del Rol del │ La app exige DNI y contraseña del paciente. Los hijos  │
│    Cuidador / Familiar        │ o cuidadores no tienen un rol tutor para coordinar     │
│                               │ tratamientos sin quitarle el celular al abuelo.        │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. Barreras Severas de        │ Botones de 36-42px (difíciles para manos con temblor o │
│    Accesibilidad (WCAG 2.1)   │ artritis), tipografías pequeñas, contraste deficiente  │
│                               │ y ausencia total de síntesis de voz (TTS).             │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5. Emergencias Inexistentes   │ No cuenta con botón de auxilio directo ni alerta       │
│                               │ automática hacia los familiares ante caídas o crisis.  │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. La Solución Propuesta: "EsSalud Contigo"

"EsSalud Contigo" transforma esta realidad mediante una solución de **Doble Rol Sincronizado**:

### A. Para el Asegurado Mayor (App Móvil Asistida - PWA / Táctil)
1. **Botón Gigante de $64\times64\text{ px}$ (WCAG 2.5.5 AAA Target Size):** Botón *"YA LA TOMÉ"* con área de toque expandida que elimina los errores por deslices motores causados por artritis o temblores seniles.
2. **Reconocimiento Visual sobre Recuerdo ($H_6$ de Nielsen):** Muestra la **fotografía real del comprimido** recetado por EsSalud, evitando confusiones peligrosas con fórmulas farmacológicas complejas.
3. **Doble Canal Sensorial (Multimodal):** Síntesis de voz nativa en español pausado (**Web Speech API a 0.88x**) y retroalimentación auditiva (**Web Audio API**) con campanita médica agradable y sirena de auxilio.
4. **Botón de Pánico SOS Inmediato ($H_{10}$):** Un solo toque dispara una alerta crítica audible y visual al panel del cuidador, sin laberintos de menús ni confirmaciones burocráticas.
5. **Registro de Presión en 1 Toque:** Registro rápido de valores normales (120/80) o elevados (145/92) con sincronización instantánea.

### B. Para el Familiar / Cuidador (Portal Web de Escritorio)
1. **Dashboard Clínico en Vivo:** Visualización del porcentaje de adherencia del día, última lectura de presión arterial y próxima cita médica en la IPRESS.
2. **Pastillero Digital y Recetas:** Control de vigencias de recetas de EsSalud y stock de medicamentos en casa con alertas de reposición antes de agotarse.
3. **Monitoreo Biométrico y Gráficos:** Tendencias de presión arterial (sistólica/diastólica) con detección de anomalías clínicas.
4. **Reporte Médico PDF:** Exportación formal del historial de tomas y presiones para presentar al geriatra de EsSalud en la consulta presencial.

---

## 4. Arquitectura de Software y Stack Tecnológico

El sistema abandona cualquier pretensión de código monolítico sobrecargado y adopta una **arquitectura en capas, ligera, escalable y 100% real en la nube**:

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│   CLIENTE MÓVIL DEL PACIENTE    │           │    PORTAL WEB DEL CUIDADOR      │
│  (React 18 + TS + Tailwind PWA) │           │  (React 18 + TS + Tailwind SPA) │
│  - Botón táctil 64x64 px        │           │  - Dashboard en tiempo real     │
│  - Web Speech API (TTS 0.88x)   │           │  - Gráficas interactivas Recharts│
│  - Web Audio API (Sirena / Bell)│           │  - Exportador PDF Clínico       │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │                                             │
                 │ Peticiones HTTP REST / JSON                 │ Peticiones HTTP REST / JSON
                 ▼                                             ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND REST API (Node.js + Express + TS)                  │
│                        Desplegado en Vercel Serverless / Node                 │
│                                                                               │
│  LÓGICA DE NEGOCIO CLÍNICA:                                                   │
│  - Validación de esquemas estrictos con Zod.                                  │
│  - Cálculo dinámico de adherencia farmacológica (% diario).                   │
│  - Evaluación de umbrales clínicos de hipertensión (>140/90 mmHg).            │
│  - Despacho y registro de eventos críticos de auxilio SOS.                    │
│  - Gestión de existencias y alertas de agotamiento de pastillas.              │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │ Conexión PostgreSQL SSL (Prisma / pg)
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                BASE DE DATOS CLOUD: SUPABASE (PostgreSQL 15)                  │
│                                                                               │
│  TABLAS RELACIONALES:                                                         │
│  - pacientes (dni, nombre, edad, ipress_adscrita, contacto_emergencia)        │
│  - cuidadores (id, nombre, email, parentesco, telefono)                       │
│  - vinculaciones (cuidador_id, paciente_id, pin_vinculacion, estado)          │
│  - recetas (paciente_id, medicamento, dosis, frecuencia, foto_url, stock)     │
│  - tomas_diarias (receta_id, hora_programada, estado, tomada_at, metodo)       │
│  - registros_presion (paciente_id, sistolica, diastolica, pulso, fecha)       │
│  - alertas_sos (paciente_id, tipo, severidad, descripcion, atendida, fecha)   │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Trazabilidad de Sprints según el Sílabo UTP (2026-2)

El desarrollo del proyecto se estructura cronológicamente en **4 Sprints** auditables:

1. **Sprint 1 (Semanas 1-4 | APF1 - 20%):**  
   Fundamentos de IHC y UX vs GUI, procesos cognitivos (memoria, atención, carga cognitiva), modelo de interacción de Norman (7 etapas), análisis de tareas GOMS y auditoría heurística de *EsSalud Mi Consulta*.
2. **Sprint 2 (Semanas 5-9 | APF2 - 20%):**  
   Metodologías de prototipado interactivo, diseño experimental (Variables independiente/dependientes), métricas de eficiencia, efectividad y cálculo riguroso de la escala SUS (Brooke, 1996; Bangor et al., 2009).
3. **Sprint 3 (Semanas 10-13 | APF3 - 20% - ETAPA ACTUAL):**  
   **Accesibilidad Universal y Diseño Inclusivo.** Diagnóstico y adecuación para discapacidad visual (presbicia/cataratas), auditiva, motora (temblor/artritis senil) y cognitiva. Cumplimiento de pautas **WCAG 2.1 Niveles A, AA y AAA** (Target Size 64px, contraste $>7:1$, síntesis TTS en español y pruebas con personas mayores).
4. **Sprint 4 (Semanas 14-18 | PROYECTO FINAL - 30%):**  
   Interfaces emergentes (interacción multimodal por voz), despliegue completo en la nube (Frontend en Vercel + Backend REST en Node.js + Base de datos en Supabase), validación final con usuarios y sustentación ante jurado.

---

## 6. Reglas de Oro del Proyecto

1. **Persistencia Real en la Nube:** Queda terminantemente prohibido volver a presentar mocks estáticos en memoria. Todas las tomas, presiones y alertas deben guardarse en la base de datos PostgreSQL de Supabase mediante la API REST de Node.js.
2. **Foco en el Usuario Mayor y su Cuidador:** Toda pantalla móvil debe ser operable por una persona de 75 años con dificultades motoras o visuales. Toda pantalla de escritorio debe ser eficiente para un cuidador que trabaja y necesita ver el estado de su familiar en 5 segundos.
3. **Rigor Académico y Científico:** Cada tabla, gráfica, métrica SUS y tiempo de tarea en los documentos debe citar normativas oficiales (ISO 9241-11, WCAG 2.1, Nielsen, Norman).
