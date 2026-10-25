# MOD-05: Históricos Biométricos y Generador de Reporte Médico PDF
## Especificación de Visualización de Datos y Exportación Clínica

---

## 1. Propósito y Contexto de Negocio

Cuando un adulto mayor asegurado acude a su consulta médica en el policlínico de EsSalud, el geriatra o cardiólogo suele preguntar:  
*—"¿Cómo ha estado su presión este último mes y qué días se le subió?"*

En la realidad peruana, el paciente no recuerda las cifras o lleva papeles arrugados e incompletos. 

Este módulo permite:
1. **Visualizar interactivamente las tendencias de presión arterial y pulso** a lo largo del tiempo.
2. **Generar con 1 clic un Reporte Médico Oficial en PDF** con el membrete institucional de EsSalud Contigo, listo para imprimir o enviar por WhatsApp al médico tratante.

---

## 2. Componentes de la Interfaz

* **Selector de Periodo Temporal:**  
  Botones para filtrar el rango de análisis: `[ 7 Días ]`, `[ 30 Días ]`, `[ Todo el Historial ]`.
* **Gráfico Biométrico Interactivo (Recharts):**  
  * Eje X: Fechas cronológicas de medición.
  * Eje Y: Presión arterial en milímetros de mercurio ($\text{mmHg}$).
  * Línea Roja: Presión Sistólica.
  * Línea Azul: Presión Diastólica.
  * **Línea de Referencia Clínica Guía (140/90 mmHg):** Marca el umbral límite de hipertensión según las guías clínicas del MINSA y EsSalud. Puntos por encima de esta línea se destacan en rojo.
* **Tabla Detallada de Lecturas:**  
  Columnas con fecha, hora, sistólica/diastólica, pulso ($\text{bpm}$), estado clínico (`NORMAL`, `ALTO`, `CRÍTICO`) y notas de contexto (ej. *"Después del almuerzo"*).
* **Botón de Descarga del Reporte Médico:**  
  `[ 📄 Descargar Reporte PDF para el Médico ]`

---

## 3. Estructura del Reporte Médico PDF Generado

El documento generado incluye:
1. **Encabezado Institucional:** Logotipo de EsSalud Contigo, fecha de emisión, nombre del paciente, DNI, edad e IPRESS adscrita.
2. **Resumen Ejecutivo:** Promedio mensual de presión arterial, porcentaje global de adherencia a medicamentos y número de eventos de alarma.
3. **Tabla Cronológica de Tomas y Presiones:** Listado tabular certificado de todas las mediciones del periodo.
4. **Espacio para Sello y Firma:** Área reservada para la firma y sello del médico tratante de EsSalud.

---

## 4. Test IDs y Verificación Automatizada

* `data-testid="filter-vitals-7d"`: Filtro de últimos 7 días.
* `data-testid="filter-vitals-30d"`: Filtro de últimos 30 días.
* `data-testid="chart-blood-pressure"`: Contenedor del gráfico SVG de Recharts.
* `data-testid="btn-download-pdf-report"`: Botón que dispara la compilación y descarga del PDF.
