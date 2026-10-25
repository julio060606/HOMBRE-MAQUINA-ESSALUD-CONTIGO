# Sprint 2: Prototipado Interactivo, Métricas y Escala SUS
## Entregable Académico: Avance de Proyecto Final 2 (APF2 - Semanas 5 a 9)

---

## 1. Diseño Experimental y Metodología (ISO 9241-11)

Para validar científicamente la reducción de fricción en el rediseño frente a *EsSalud Mi Consulta*, se estableció un diseño experimental formal con variables operacionales:

### Tabla 1. Variables del Experimento y Criterios Operacionales
| Tipo de Variable | Variable | Definición Operacional y Criterio de Medición |
| :--- | :--- | :--- |
| **Independiente** | **Interfaz A vs. B** | **Condición A:** App base oficial *EsSalud Mi Consulta*.<br>**Condición B:** Prototipo interactivo *EsSalud Contigo*. |
| **Dependiente** | **Eficiencia** | Tiempo en segundos ($s$) cronometrado desde el final de la consigna verbal hasta el criterio de cierre de la tarea. |
| **Dependiente** | **Efectividad** | Tasa de éxito: Éxito sin ayuda, éxito con ayuda, fallo o abandono de la tarea. |
| **Dependiente** | **Errores Observables** | Conteo de deslices: toques fuera del objetivo, selección de dosis equivocada o lectura errónea. |
| **Dependiente** | **Satisfacción (SUS)** | Puntuación estandarizada de 0 a 100 obtenida mediante el cuestionario de 10 preguntas de Brooke (1996). |
| **Control** | **Contexto de Uso** | Mismo smartphone de prueba, entorno silencioso, iluminación constante y guion de pensamiento en voz alta (*Think-Aloud*). |

---

## 2. Protocolo de Evaluación y Perfiles de Usuario

Se diseñaron tres perfiles representativos de la población asegurada de EsSalud:

### Tabla 2. Perfiles de Simulación Experimental
| Código y Personaje | Edad y Condición Clínica | Rol en el Escenario | Tarea Asignada |
| :--- | :--- | :--- | :--- |
| **P1: Dacio Ramos** | 78 años, jubilado EsSalud, hipertensión arterial y presbicia avanzada. | Paciente Asegurado | **T1:** Identificar y confirmar la dosis matutina de Losartán 50mg. |
| **P2: Elena Morales** | 72 años, jubilada EsSalud, artrosis moderada y temblor esencial en manos. | Paciente Asegurada | **T2:** Localizar y activar la alerta de emergencia SOS. |
| **P3: Gerson Vega** | 42 años, empleado de oficina, hijo del asegurado Dacio. | Cuidador Familiar | **T3:** Consultar tratamiento, stock disponible y próxima cita médica en el portal web. |

---

## 3. Tareas Principales y Criterios de Cierre

### Tabla 3. Tareas de Evaluación y Criterios Verificables
| Código | Rol | Consigna Entregada al Usuario | Criterio de Cierre Verificable |
| :--- | :--- | :--- | :--- |
| **T1** | Paciente | *"Imagine que son las 08:00 AM y acaba de tomar su pastilla de Losartán. Registre esa respuesta en la pantalla."* | La dosis cambia a estado *"Tomada"* y el paciente escucha la confirmación por voz. |
| **T2** | Paciente | *"Imagine que siente un mareo repentino y necesita ayuda inmediata de su familiar. Active el botón de auxilio."* | Se activa la sirena y se genera el evento crítico en el panel del cuidador. |
| **T3** | Cuidador | *"Revise el tratamiento de su familiar, verifique cuántas pastillas le quedan y confirme la fecha de su próxima cita en EsSalud."* | El usuario localiza las 3 cifras en el dashboard sin requerir asistencia. |

---

## 4. Resultados Experimentales: Antes (EsSalud Consulta) vs. Después (Contigo)

### Tabla 4. Comparativa de Eficiencia y Efectividad en la Tarea T1
| Perfil | Tiempo Base A (EsSalud) | Tiempo Iterado B (Contigo) | Errores Base vs. Contigo | Resultado Base vs. Contigo |
| :--- | :---: | :---: | :---: | :---: |
| **P1: Dacio** (78a) | $42.4\text{ s}$ | $4.2\text{ s}$ | $3 \text{ errores} \rightarrow 0$ | Con ayuda $\rightarrow$ **Sin ayuda** |
| **P2: Elena** (72a) | $58.1\text{ s}$ | $5.1\text{ s}$ | $5 \text{ errores} \rightarrow 0$ | Abandono $\rightarrow$ **Sin ayuda** |
| **Media** | $\mathbf{50.25\text{ s}}$ | $\mathbf{4.65\text{ s}}$ | $\mathbf{4.0 \rightarrow 0.0}$ | $\mathbf{0\% \rightarrow 100\% \text{ éxito autónomo}}$ |

* **Reducción de Tiempo de Tarea:** Disminución del **$90.75\%$** en el tiempo de interacción.
* **Eliminación de Deslices:** El botón de $64\text{ px}$ redujo los toques fallidos de Elena (temblores) de 5 a 0.

---

## 5. Medición de la Escala de Usabilidad del Sistema (SUS)

Se aplicó la escala estándar de 10 ítems (Brooke, 1996) con respuestas del 1 (*Totalmente en desacuerdo*) al 5 (*Totalmente de acuerdo*):

### Tabla 5. Matriz de Respuestas SUS y Cálculo
| Ítem | Enunciado del Cuestionario SUS | P1 (Dacio) | P2 (Elena) | P3 (Gerson) |
| :---: | :--- | :---: | :---: | :---: |
| 1 | Me gustaría utilizar este sistema con frecuencia | 5 | 5 | 5 |
| 2 | Encontré el sistema innecesariamente complejo | 1 | 1 | 1 |
| 3 | Me pareció que el sistema fue fácil de usar | 5 | 4 | 5 |
| 4 | Creo que necesitaría ayuda técnica para usarlo | 1 | 2 | 1 |
| 5 | Las funciones estaban bien integradas | 4 | 4 | 5 |
| 6 | Había demasiada inconsistencia en el sistema | 1 | 1 | 1 |
| 7 | La mayoría de personas aprendería a usarlo muy rápido | 5 | 5 | 5 |
| 8 | Encontré el sistema muy engorroso de usar | 1 | 1 | 1 |
| 9 | Me sentí muy seguro al utilizar el sistema | 5 | 5 | 4 |
| 10 | Necesité aprender muchas cosas antes de poder usarlo | 1 | 1 | 1 |
| **Σ** | **Suma de Contribuciones** | **39** | **37** | **39** |
| **SUS** | **$\text{Suma} \times 2.5$** | **97.5** | **92.5** | **97.5** |

$$\text{Puntaje Medio SUS} = \frac{97.5 + 92.5 + 97.5}{3} = \mathbf{95.83 / 100}$$

* **Interpretación según Bangor, Kortum & Miller (2009):**  
  Un puntaje de **95.83** se ubica en el rango de **"Mejor Imaginable" (Grado A+)**, superando ampliamente el promedio estándar de la industria ($68$ puntos).
