# Sprint 3: Accesibilidad Universal, Diseño Inclusivo y Normativa WCAG 2.1
## Entregable Académico: Avance de Proyecto Final 3 (APF3 - Semanas 10 a 13) [SPRINT ACTUAL]

---

## 1. Fundamentos de Accesibilidad Universal y Marco Normativo

El objetivo pedagógico de la **Unidad 3 del Sílabo** es capacitar al estudiante en la integración de criterios de accesibilidad para personas con limitaciones funcionales:

* **Estándar Internacional:** *Web Content Accessibility Guidelines* (**WCAG 2.1** - W3C Recommendation).
* **Marco Legal Nacional:** Ley General de la Persona con Discapacidad (**Ley N° 29973**) y directivas de accesibilidad digital del Estado Peruano (PCM / SGTD).
* **Principio Rector:** **Diseño Universal (Diseño para Todos)**: Una interfaz diseñada pensando en el adulto mayor de 80 años con limitaciones sensoriales y motoras resulta infinitamente más fácil de usar para cualquier ciudadano asegurado.

---

## 2. Diagnóstico y Adecuación por Tipo de Discapacidad

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               ADECUACIÓN INCLUSIVA: ESSALUD MI CONSULTA vs. ESSALUD CONTIGO             │
├─────────────────────┬───────────────────────────────┬──────────────────────────────────┤
│ Tipo Discapacidad   │ Barrera en EsSalud Consulta   │ Adecuación en EsSalud Contigo    │
├─────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ Sensorial Visual    │ Tipografía de 11px, bajo      │ Tipografía escalable (16-20px),  │
│ (Presbicia/Catarata)│ contraste (< 3:1) y sin voz.  │ contraste > 7:1 y Web Speech TTS.│
├─────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ Sensorial Auditiva  │ Alertas de texto silenciosas  │ Doble canal multimodal: banners  │
│ (Hipoacusia)        │ fáciles de ignorar.           │ parpadeantes + tonos en 800Hz.   │
├─────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ Motora              │ Botones pequeños de 36-40px;  │ Botón gigante de 64x64 px        │
│ (Artritis/Temblor)  │ deslices involuntarios.       │ (Supera WCAG 2.5.5 Nivel AAA).   │
├─────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ Cognitiva           │ Nombres químicos abstractos   │ Foto real del comprimido (H6) y  │
│ (Pérdida memoria)   │ en listados alfabéticos.      │ confirmación de toma en 1 toque. │
└─────────────────────┴───────────────────────────────┴──────────────────────────────────┘
```

---

## 3. Matriz de Cumplimiento WCAG 2.1 (Niveles A, AA y AAA)

Se evaluaron los 4 principios fundamentales de accesibilidad web sobre la interfaz del paciente:

### Principio 1: Perceptible
* **1.1.1 Contenido No Textual (Nivel A):**  
  Todas las imágenes de medicamentos tienen atributos `alt` descriptivos y enriquecidos (ej. `alt="Comprimido redondo blanco ranurado de Losartán Potásico 50 miligramos"`).
* **1.4.3 Contraste Mínimo (Nivel AA) y 1.4.6 Contraste Aumentado (Nivel AAA):**  
  El texto principal sobre fondo blanco mantiene una relación de contraste cromático de **$14.2:1$** (superando el umbral de $7:1$ para Nivel AAA).
* **1.4.12 Espaciado de Texto (Nivel AA):**  
  Interlineado de $1.5$ y separación entre párrafos de $2.0$ para evitar fatiga en lectura con vista cansada.

### Principio 2: Operable
* **2.1.1 Accesibilidad por Teclado (Nivel A):**  
  Toda acción del prototipo es ejecutable mediante navegación por teclado (`Tab`, `Enter`, `Space`) con indicador visual de foco claramente contrastado.
* **2.2.1 Tiempo Ajustable (Nivel A):**  
  A diferencia de la app oficial de EsSalud (que cierra la sesión a los 3 minutos de inactividad provocando frustración), Contigo no impone límites de tiempo en la toma de decisiones del paciente.
* **2.5.5 Tamaño del Objetivo Táctil - Target Size (Nivel AAA):**  
  Mientras WCAG 2.5.5 exige un área de toque de al menos $44\times44\text{ px}$ en Nivel AA, **EsSalud Contigo implementa botones de $64\times64\text{ px}$**, garantizando tolerancia ante temblores seniles o artritis reumatoide.

### Principio 3: Comprensible
* **3.1.2 Idioma de las Partes (Nivel AA):**  
  El sintetizador de voz está configurado explícitamente en español neutro/peruano (`es-PE` / `es-419`) a cadencia lenta ($0.88\times$).
* **3.3.4 Prevención de Errores Médicos (Nivel AAA):**  
  El sistema impide registrar dos tomas seguidas en un lapso menor a 1 hora y ofrece la opción reversible *"Corregir"* si el usuario presionó por equivocación.

### Principio 4: Robusto
* **4.1.2 Nombre, Función y Valor (Nivel A):**  
  Uso de roles ARIA y componentes semánticos HTML5 (`<main>`, `<nav>`, `<article>`, `<button>`) compatibles con lectores de pantalla de Android (TalkBack) y Windows (NVDA/JAWS).

---

## 4. Taller Práctico de Validación Inclusiva con Adultos Mayores

Se ejecutó una sesión de validación enfocada en la adaptación sensorial y motora con los participantes del estudio:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                  EVIDENCIA EXPERIMENTAL DEL TALLER DE ACCESIBILIDAD                     │
├─────────┬───────────────────────────────┬──────────────────────────────────────────────┤
│ Sujeto  │ Condición de Accesibilidad    │ Comportamiento Observado y Validación        │
├─────────┼───────────────────────────────┼──────────────────────────────────────────────┤
│ Dacio   │ Presbicia severa. No utilizó  │ El sistema leyó automáticamente por voz:     │
│ (78a)   │ sus anteojos de lectura.      │ "Hola Dacio, tu pastilla es Losartán a las   │
│         │                               │ 8:00 AM". Presionó el botón guiado por la    │
│         │                               │ foto y el color verde sin dudar.             │
├─────────┼───────────────────────────────┼──────────────────────────────────────────────┤
│ Elena   │ Temblor involuntario en mano  │ En la app base de EsSalud falló 5 veces al   │
│ (72a)   │ derecha por artrosis.         │ tocar botones de 38px. En Contigo, acertó en │
│         │                               │ el primer intento gracias al botón de 64px.  │
└─────────┴───────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 5. Conclusiones del Sprint 3

1. **Cumplimiento Integral de la Unidad 3:** El rediseño demuestra con métricas y código cómo se resuelven barreras sensoriales, auditivas, motoras y cognitivas.
2. **Superioridad frente a la App Oficial:** *EsSalud Mi Consulta* viola sistemáticamente 6 de las pautas elementales de la WCAG 2.1, mientras que *EsSalud Contigo* alcanza el **Nivel AAA en Target Size (2.5.5)** y **Contraste (1.4.6)**.
