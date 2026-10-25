# Sprint 1: Fundamentos, Modelos Cognitivos y Modelo de Norman
## Entregable Académico: Avance de Proyecto Final 1 (APF1 - Semanas 1 a 4)

---

## 1. Fundamentación de IHC y Diferenciación UX vs. GUI

En el diseño de sistemas de salud para el adulto mayor, una interfaz gráfica tradicional (**GUI**) se limita a colocar botones, campos de texto y tablas sobre una pantalla, asumiendo que el usuario posee destreza técnica, agudeza visual y reflejos intactos. 

Por el contrario, la disciplina de **Interacción Humano-Computadora (IHC / IHM)** y el enfoque de **Experiencia de Usuario (UX)** analizan:
1. **La Carga Cognitiva:** La capacidad limitada de memoria de trabajo del adulto mayor ($7 \pm 2$ elementos según la ley de Miller, reducida a $4 \pm 1$ en pacientes con deterioro senil).
2. **Las Barreras Motoras:** Pérdida de precisión táctil por temblores esenciales o artrosis.
3. **El Contexto Emocional:** La ansiedad que genera en un jubilado el miedo a *"romper la aplicación"* o tomar una dosis equivocada de su pastilla para la presión.

---

## 2. Modelo Cognitivo del Asegurado Adulto Mayor en EsSalud

Se construyó el modelo mental del usuario meta considerando tres factores limitantes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               PROCESOS COGNITIVOS Y LIMITACIONES EN EL ADULTO MAYOR                    │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Proceso Cognitivo             │ Limitación Real y Decisión de Diseño en "Contigo"      │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Memoria de Trabajo            │ Olvido recurrente de si ya tomó la pastilla matutina.   │
│                               │ Solución: Estado visual explícito persistente          │
│                               │ (Checkmark verde "Tomada a las 08:05 AM").            │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Percepción Visual             │ Presbicia, cataratas y pérdida de contraste.           │
│                               │ Solución: Textos agrandados (>= 16px), contraste       │
│                               │ cromático superior a 7:1 y foto real del comprimido.   │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Percepción Auditiva           │ Presbiacusia (dificultad para oír tonos agudos).       │
│                               │ Solución: Frecuencias de audio controladas (500-800Hz) │
│                               │ y lectura pausada por voz (TTS en español a 0.88x).    │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Motricidad Fina               │ Temblores y dedos rígidos por artritis.                │
│                               │ Solución: Botón gigante de 64x64 px (WCAG 2.5.5 AAA).  │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Interacción de Norman (7 Etapas de la Acción)

Se desglosó el flujo crítico de la toma de medicamentos (**Tarea T1**) a través del ciclo de acción-evaluación de Donald Norman (2013):

```
                                  [ 1. META ]
                 "Estar seguro de haber tomado mi medicina de la presión"
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
          [ GOLFO DE EJECUCIÓN ]               [ GOLFO DE EVALUACIÓN ]
                   │                                     │
         2. Formar la Intención                5. Percibir el Estado
      "Quiero registrar que ya tomé"        "Veo la pantalla cambiar a verde"
                   │                                     │
         3. Especificar la Acción              6. Interpretar el Estado
      "Presionar el botón verde"            "Entiendo que el sistema guardó"
                   │                                     │
         4. Ejecutar la Acción                 7. Evaluar el Resultado
    "Tocar botón YA LA TOMÉ de 64px"       "Siento alivio de no haber fallado"
```

### Reducción del Golfo de Ejecución y Evaluación:
* **En EsSalud Mi Consulta (Antes):** El paciente debía navegar entre 4 menús, ingresar a recetas, buscar la fecha y no había forma de confirmar la toma (Golfo de Ejecución insalvable).
* **En EsSalud Contigo (Después):** Al abrir la app, la pastilla de la hora está visible en primer plano con su foto. El botón *"YA LA TOMÉ"* mide $64\text{ px}$. Al presionarlo, suena una campanita, una voz dice *"Toma confirmada"* y el botón se transforma en un sello verde (Golfo de Evaluación cerrado en menos de 1 segundo).

---

## 4. Análisis de Tareas GOMS (Card, Moran & Newell)

Se aplicó el modelo **GOMS** (Goals, Operators, Methods, Selection Rules) comparando el tiempo cognitivo estimado:

* **Meta Principal:** Confirmar toma matutina de Losartán 50mg.
  * **Método en EsSalud Consulta:**  
    $$T = T_{\text{login}} (18\text{ s}) + T_{\text{menú}} (12\text{ s}) + T_{\text{búsqueda}} (14\text{ s}) = 44\text{ segundos (con alta probabilidad de abandono)}$$
  * **Método en EsSalud Contigo:**  
    $$T = T_{\text{mirar foto}} (1.2\text{ s}) + T_{\text{presionar botón}} (0.8\text{ s}) + T_{\text{escuchar voz}} (1.5\text{ s}) = 3.5\text{ segundos (0\% de error)}$$
