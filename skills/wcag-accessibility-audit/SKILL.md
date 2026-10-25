---
name: wcag-accessibility-audit
description: Guía y verificación de conformidad con las pautas de accesibilidad universal WCAG 2.1 (Niveles A, AA y AAA) para adultos mayores en interfaces de salud.
---

# Skill: Auditoría de Accesibilidad Universal WCAG 2.1 (Adulto Mayor)

Este skill define la lista de comprobación (*checklist*) que debe cumplir toda pantalla o componente en **EsSalud Contigo** para la entrega del **APF3 (Semana 13)**.

---

## 1. Criterios Críticos de Accesibilidad para el Adulto Mayor

### A. Dimensión Táctil (WCAG 2.5.5 - Target Size AAA)
* **Regla:** El botón principal para la confirmación de medicamentos (*"YA LA TOMÉ"*) debe medir al menos **$64\times64\text{ px}$** (`h-16`).
* **Espaciado:** Separación perimetral de al menos $16\text{ px}$ con otros elementos interactivos para evitar toques accidentales por artritis o temblores esenciales.

### B. Contraste Cromático (WCAG 1.4.3 / 1.4.6 - AAA)
* **Ratio de Contraste para Texto:** Mínimo **$7:1$** sobre fondos claros.
* **Paleta Certificada:**
  * Texto `#0F172A` sobre `#FFFFFF`: Ratio **14.8:1** (Pasa AAA).
  * Azul EsSalud `#005696` sobre `#FFFFFF`: Ratio **8.4:1** (Pasa AAA).
  * Verde Clínico `#136F53` sobre `#FFFFFF`: Ratio **7.2:1** (Pasa AAA).

### C. Soporte Multimodal Auditivo (WCAG 3.1.2)
* Toda confirmación debe respaldarse con:
  * Campanita médica sintética en Web Audio API ($523\text{ Hz} \leftrightarrow 659\text{ Hz}$).
  * Locución por voz nativa en español (`es-PE` / `es-419`) a cadencia lenta ($0.88\times$).

### D. Reconocimiento Visual sobre Recuerdo (Heurística H6 de Nielsen)
* Toda pastilla en la vista del paciente debe mostrar la **fotografía real del comprimido** en alta definición con su atributo `alt` enriquecido.
