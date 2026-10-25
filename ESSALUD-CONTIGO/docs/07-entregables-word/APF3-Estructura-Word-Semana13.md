# Guía y Plantilla para el Documento Word: Avance de Proyecto Final 3 (APF3)
## Semana 13 - Unidad 3: Accesibilidad Universal y Diseño Inclusivo (IHM - UTP 2026-2)

Esta guía contiene la estructura completa, redacción académica y tablas estandarizadas para elaborar el documento oficial en **Microsoft Word** para la entrega del **APF3**.

---

# PORTADA INSTITUCIONAL

```
UNIVERSIDAD TECNOLÓGICA DEL PERÚ (UTP)
FACULTAD DE INGENIERÍA DE SISTEMAS E INFORMÁTICA

ASIGNATURA:
INTERACCIÓN HOMBRE-MÁQUINA (100000S82T)
CICLO: 2026 - CICLO 2 AGOSTO
MODALIDAD: VIRTUAL EN VIVO

TÍTULO DEL PROYECTO:
AUDITORÍA DE ACCESIBILIDAD UNIVERSAL (WCAG 2.1) Y REDISEÑO CENTRADO EN EL USUARIO:
MÓDULO DE TELEASISTENCIA GERIÁTRICA "ESSALUD CONTIGO" A PARTIR DE LA APP "ESSALUD MI CONSULTA"

DOCENTE:
[NOMBRE DEL DOCENTE DE TU SECCIÓN VIRTUAL]

INTEGRANTES:
- MINAYA URDANIVIA, Julio Rodrigo
- PUMA PARAVE, Andres Benjamin
- VEGA CISNEROS, Gerson David

LIMA – PERÚ
OCTUBRE 2026
```

---

# ÍNDICE GENERAL DEL INFORME

```text
1. INTRODUCCIÓN Y DIAGNÓSTICO DEL CASO DE ESTUDIO ("ESSALUD MI CONSULTA")
   1.1 Problemática de los adultos mayores con enfermedades crónicas en EsSalud
   1.2 Análisis del producto base oficial y limitaciones funcionales
   1.3 Justificación desde el Diseño Centrado en el Usuario (UCD / ISO 9241-210)

2. AUDITORÍA DE ACCESIBILIDAD UNIVERSAL Y MARCO NORMATIVO (WCAG 2.1) [EJE APF3]
   2.1 Adecuación para Discapacidad Sensorial Visual (Presbicia, contraste alto y TTS)
   2.2 Adecuación para Discapacidad Sensorial Auditiva (Doble canal y retroalimentación)
   2.3 Adecuación para Discapacidad Motora (WCAG 2.5.5 Target Size de 64x64 px)
   2.4 Adecuación para Discapacidad Cognitiva (Heurística H6 con foto real del comprimido)
   2.5 Matriz de Cumplimiento WCAG 2.1 (Niveles A, AA y AAA)

3. MODELOS DE INTERACCIÓN Y MODELO CONCEPTUAL
   3.1 Ciclo de Norman de 7 etapas aplicado a la confirmación de medicamentos
   3.2 Modelo GOMS y reducción de tiempos de ejecución
   3.3 Modelo conceptual y arquitectura de Doble Rol (Móvil Paciente y Web Cuidador)

4. DESCRIPCIÓN DEL PROTOTIPO FUNCIONAL INTERACTIVO ("ESSALUD CONTIGO")
   4.1 Arquitectura del sistema (Frontend React + Backend Node.js + Supabase Cloud)
   4.2 Módulos desarrollados y flujos de interacción
   4.3 Enlace de acceso público desplegado en Vercel

5. EVALUACIÓN EXPERIMENTAL Y VALIDACIÓN INCLUSIVA CON USUARIOS
   5.1 Diseño experimental y variables operacionales (ISO 9241-11)
   5.2 Perfiles evaluados (P1 Dacio 78a, P2 Elena 72a, P3 Gerson 42a)
   5.3 Tareas clave de prueba (T1 Toma, T2 SOS, T3 Monitoreo Cuidador)
   5.4 Resultados comparativos de eficiencia y efectividad (Antes vs Después)
   5.5 Medición y cálculo de la Escala de Usabilidad del Sistema (SUS = 95.83 / 100)

6. CONCLUSIONES Y RECOMENDACIONES
7. DECLARACIÓN DE USO ÉTICO DE INTELIGENCIA ARTIFICIAL
8. REFERENCIAS BIBLIOGRÁFICAS (FORMATO APA 7)
```

---

# TEXTO BASE REDACTADO POR CAPÍTULOS

## 1. Introducción y Diagnóstico del Caso de Estudio

El Seguro Social de Salud del Perú (**EsSalud**) atiende a más de 12.5 millones de asegurados, concentrando en la población mayor de 60 años más del 62% de los tratamientos farmacológicos crónicos (hipertensión arterial y diabetes tipo 2).

A pesar del lanzamiento de la plataforma **"EsSalud Mi Consulta"** (disponible en Android y web), los reportes de la Defensoría del Asegurado y las más de 35,000 opiniones en Google Play Store (donde mantiene una calificación deficiente de **2.6 estrellas**) demuestran que la herramienta excluye sistemáticamente al adulto mayor debido a tipografías pequeñas, saturación de trámites burocráticos y la ausencia total de un rol formal para el cuidador familiar.

Este proyecto aplica la metodología del **Diseño Centrado en el Usuario (UCD)** para auditar dicha herramienta y desarrollar **"EsSalud Contigo"**, una solución accesible que conecta al paciente mayor en su hogar con el familiar a través de un panel de monitoreo clínico en tiempo real.

---

## 2. Auditoría de Accesibilidad Universal (WCAG 2.1) [Eje Central APF3]

### 2.1 Adecuación Sensorial Visual
Los adultos mayores sufren comúnmente de presbicia y opacidad corneal. *EsSalud Mi Consulta* utiliza textos en gris con ratios de contraste inferiores a $3:1$. En *EsSalud Contigo*, todos los textos informativos superan el ratio de **$7:1$ (Nivel AAA)**, y se incorpora el soporte nativo de **Web Speech API** para lectura en voz alta en español pausado ($0.88\times$).

### 2.2 Adecuación Motora: Botón Gigante de $64\times64\text{ px}$ (WCAG 2.5.5 AAA)
La artrosis y el temblor senil hacen que presionar botones estándar de $36\text{ px}$ sea frustrante. Siguiendo el criterio WCAG 2.5.5, el botón *"YA LA TOMÉ"* tiene una altura de $64\text{ px}$ ($h-16$) abarcando todo el ancho del chasis móvil, eliminando los errores por pulsación fallida a cero.

### 2.3 Adecuación Cognitiva: Heurística H6 de Nielsen
En lugar de forzar al jubilado a memorizar códigos como *"LOSARTAN POTASICO 50MG COMP"*, la interfaz presenta la **fotografía en alta definición del comprimido real** dispensado por la farmacia de EsSalud, facilitando el reconocimiento visual instantáneo.

---

## 3. Matriz de Variables y Resultados Experimentales

### Variables del Experimento (ISO 9241-11)
* **Variable Independiente:** Interfaz A (*EsSalud Mi Consulta*) vs. Interfaz B (*EsSalud Contigo*).
* **Variables Dependientes:**
  * *Eficiencia:* Tiempo de tarea en segundos ($s$).
  * *Efectividad:* Tasa de éxito autónomo sin asistencia ($0\% \rightarrow 100\%$).
  * *Satisfacción:* Puntaje estandarizado SUS ($0$ a $100$).

### Comparativa de Tiempos y Resultados en Tarea T1 (Confirmar Toma)
* **P1 Dacio Ramos (78 años):** Pasó de $42.4\text{ s}$ (con 3 errores y ayuda) a **$4.2\text{ s}$ (0 errores, sin ayuda)**.
* **P2 Elena Morales (72 años):** Pasó de $58.1\text{ s}$ (abandono por temblor motor) a **$5.1\text{ s}$ (completado autónomo)**.
* **Reducción de Tiempo Promedio:** Disminución del **$90.75\%$** en el tiempo de interacción.

### Cálculo de la Escala de Usabilidad del Sistema (SUS)
Con las 10 preguntas estandarizadas aplicadas a los 3 perfiles:
* $P_1$: 97.5 | $P_2$: 92.5 | $P_3$: 97.5
* **Media SUS:** $$\frac{97.5 + 92.5 + 97.5}{3} = \mathbf{95.83 / 100}$$  
  *(Clasificación: "Mejor Imaginable" / Grado A+ según Bangor et al., 2009)*.

---

## 4. Enlace del Prototipo Desplegado en la Nube

El prototipo funcional se encuentra desplegado y accesible públicamente en Vercel con soporte responsivo y base de datos en la nube:
* **URL Pública:** `https://hombre-maquina-apliacion-contigo.vercel.app`
* **Acceso Directo al Simulador Móvil Asistido:** `/patient-simulator`
* **Acceso al Dashboard del Cuidador:** `/dashboard`
