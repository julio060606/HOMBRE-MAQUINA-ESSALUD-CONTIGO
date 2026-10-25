---
name: ihm-sus-testing
description: Metodología experimental de evaluación de usabilidad, diseño de tareas T1, T2 y T3, y cálculo formal de la Escala de Usabilidad del Sistema (SUS).
---

# Skill: Evaluación Experimental IHM y Escala SUS

Este skill documenta la metodología formal de pruebas experimentales y cálculo de métricas para los informes académicos (APF2 y APF3) del curso de **Interacción Hombre-Máquina**.

---

## 1. Tareas Experimentales Evaluadas

1. **Tarea T1 (Asegurado Mayor):** Confirmar toma matutina de Losartán 50mg con botón de 64px.
2. **Tarea T2 (Asegurado Mayor):** Activar el botón de auxilio SOS ante descompensación.
3. **Tarea T3 (Cuidador Familiar):** Consultar en el dashboard el porcentaje de adherencia, existencias de pastillas y próxima cita médica en EsSalud.

---

## 2. Fórmula de Cálculo de la Escala SUS (Brooke, 1996)

El cuestionario SUS consta de 10 afirmaciones puntuadas del 1 (*Totalmente en desacuerdo*) al 5 (*Totalmente de acuerdo*):

1. **Para preguntas impares (1, 3, 5, 7, 9):**
   $$\text{Aporte} = \text{Puntuación} - 1$$
2. **Para preguntas pares (2, 4, 6, 8, 10):**
   $$\text{Aporte} = 5 - \text{Puntuación}$$
3. **Puntuación Final por Usuario:**
   $$\text{Puntaje SUS} = \left(\sum \text{Aportes}\right) \times 2.5$$

### Escala de Interpretación (Bangor, Kortum & Miller, 2009)
* $\ge 85.5$: Excelente / Grado A
* $\ge 90.9$: Mejor Imaginable / Grado A+ (**EsSalud Contigo obtuvo 95.83**)
* $\ge 71.4$: Bueno / Aceptable
* $< 68.0$: Por debajo del promedio de la industria
