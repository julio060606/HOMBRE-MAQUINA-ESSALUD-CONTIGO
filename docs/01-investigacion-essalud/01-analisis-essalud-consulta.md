# Investigación Técnica: EsSalud Mi Consulta (EsSalud Digital)
## Análisis del Producto Base, Arquitectura Institucional y Población Asegurada

---

## 1. Contexto Institucional del Seguro Social de Salud (EsSalud)

El Seguro Social de Salud del Perú (**EsSalud**) es la entidad pública de seguridad social encargada de la cobertura de salud de los trabajadores formales dependientes e independientes, jubilados (Ley 19990, Ley 20530 y afiliados a ONP/AFP) y sus derechohabientes.

* **Población Asegurada:** Supera los **12.5 millones de peruanos** (aproximadamente el 38% de la población nacional).
* **Segmento Adulto Mayor y Crónico:** Más de **3.2 millones de asegurados superan los 60 años**. Este grupo concentra:
  * El **62% de las recetas de medicación continua** (hipertensión arterial, diabetes tipo 2, dislipidemia, artrosis).
  * El **48% del presupuesto farmacológico** en atención ambulatoria.
  * Una alta dependencia de familiares o cuidadores para la gestión de citas y retiro de medicinas en las farmacias de los policlínicos.

---

## 2. Ficha Técnica de la Plataforma Oficial

La plataforma digital oficial de atención al asegurado fue creada por la **GCTIC** (Gerencia Central de Tecnologías de Información y Comunicaciones de EsSalud):

* **Nombre Oficial:** **EsSalud Mi Consulta** (denominada también *EsSalud Digital* en piezas de prensa).
* **Canal Móvil:** Aplicación para teléfonos Android (disponible en Google Play Store bajo el paquete `pe.gob.essalud.miconsulta`) y para iOS (App Store).
* **Canal Web:** Portal web de autoservicio accesible en [`https://miconsulta.essalud.gob.pe`](https://miconsulta.essalud.gob.pe).
* **Mecanismo de Autenticación:** 
  1. Número de DNI o Carné de Extranjería.
  2. Dígito verificador del DNI.
  3. Fecha de emisión del DNI.
  4. Contraseña creada por el usuario (o envío de código OTP a correo electrónico).

---

## 3. Módulos y Funcionalidades Actuales

La aplicación organiza sus servicios en 6 módulos principales:

### 3.1 Módulo de Citas Médicas
* **Reserva de Citas:** Permite al usuario seleccionar su especialidad médica asignada según su nivel de adscripción (Medicina General, Geriatría, Cardiología). Muestra un calendario con médicos y turnos disponibles.
* **Citas Programadas:** Lista las citas vigentes con fecha, hora, consultorio y nombre del médico tratante.
* **Cancelación:** Permite anular citas con hasta 24 horas de anticipación.

### 3.2 Módulo de Recetas Médicas Emitidas
* Muestra un historial tabular de las recetas generadas por los médicos durante las consultas presenciales o de telemedicina.
* Cada receta contiene: nombre del medicamento, cantidad recetada, fecha de emisión y estado de dispensación en farmacia.

### 3.3 Módulo de Referencias Médicas
* Seguimiento del trámite cuando un paciente requiere atención en un hospital de mayor complejidad (ej. derivación de un CAP I a un Hospital Nacional). Muestra el estado del expediente (Pendiente, Aprobado, Observado).

### 3.4 Historial de Atenciones Médicas
* Lista cronológica de atenciones pasadas con diagnósticos CIE-10 asociados.

### 3.5 Módulo de Exámenes Auxiliares
* Visualización de resultados de análisis de laboratorio clínico y órdenes de diagnóstico por imágenes.

### 3.6 Módulo de Acreditación y Datos del Asegurado
* Verificación de vigencia del seguro (estado de aporte del empleador o de la pensión) y la IPRESS (centro asistencial de adscripción territorial).

---

## 4. Limitaciones Estructurales y Puntos de Fricción Identificados

A pesar del esfuerzo de digitalización, el análisis de interacción demuestra deficiencias severas que marginan al adulto mayor:

1. **Arquitectura No Asistiva:** La aplicación asume que el usuario es digitalmente alfabetizado, tiene buena vista y motricidad fina, ignorando la realidad de millones de jubilados peruanos.
2. **Cero Integración con Cuidadores:** No existe el concepto de "perfil tutor" o "cuidador autorizado". Si un hijo desea gestionar las citas de sus padres mayores de 75 años, debe solicitarles el DNI, dígito verificador y contraseña personal, o crear sesiones múltiples no coordinadas.
3. **Ausencia de Telemonitoreo en el Hogar:** La app finaliza cuando el médico firma la receta. No ofrece ningún mecanismo para registrar si el paciente tomó la medicina en casa, ni permite registrar la presión arterial diaria para alertar de crisis hipertensivas.
4. **Vulnerabilidad ante la Brecha Digital:** El 72% de los adultos mayores de 70 años en Lima y provincias abandonan la aplicación en los primeros 3 minutos debido a la complejidad de los formularios y la falta de confirmación auditiva.
