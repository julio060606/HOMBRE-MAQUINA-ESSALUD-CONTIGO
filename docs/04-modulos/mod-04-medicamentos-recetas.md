# MOD-04: Gestión de Medicamentos, Recetas y Existencias
## Especificación del Pastillero Digital y Control de Farmacia EsSalud

---

## 1. Propósito y Contexto de Negocio

En el Perú, uno de los mayores problemas que sufren los asegurados crónicos de EsSalud es el **desabastecimiento periódico de medicamentos** y la falta de control sobre cuántas pastillas quedan en el hogar.

Este módulo permite:
1. Digitalizar las recetas emitidas por los médicos de EsSalud con su posología exacta.
2. Asociar a cada receta la **fotografía real del comprimido** dispensado para alimentar la interfaz visual del anciano ($H_6$).
3. Llevar un conteo matemático estricto del stock disponible en casa, descontando una unidad por cada toma confirmada y calculando la fecha estimada de agotamiento.

---

## 2. Componentes de la Interfaz

* **Barra de Filtros y Búsqueda:**  
  Filtro por pestañas: `[ Todos ]`, `[ Activos ]`, `[ Próximos a Vencer ]` y buscador en tiempo real por nombre comercial o genérico.
* **Tarjeta de Medicamento:**
  * Fotografía del comprimido en alta resolución con etiqueta *"Foto Real Verificada"*.
  * Nombre del fármaco, concentración y presentación (ej. *Losartán Potásico 50 mg - Comprimido*).
  * Horarios programados (ej. *Cada 12 horas: 08:00 AM y 08:00 PM*).
  * Barra de existencias: Indicador de pastillas restantes y días de cobertura (ej. *28 pastillas restantes / 14 días de cobertura*).
  * Botón de acción rápida: `[ + Registrar Reposición Farmacéutica ]`.
* **Modal de Registro de Nueva Receta EsSalud:**  
  Formulario validado con Zod para ingresar nombre, dosis, médico prescriptor, centro asistencial (IPRESS) y carga de foto.

---

## 3. Reglas de Negocio y Lógica del Sistema

1. **Alerta de Stock Crítico:**  
   Cuando `stock_actual <= 5`, el sistema cambia la etiqueta de existencias a color ámbar/rojo y genera una notificación: *"Aviso de Reposición: Quedan menos de 3 días de Losartán. Tramitar receta en EsSalud"*.
2. **Validación de Frecuencias:**  
   El sistema admite intervalos estandarizados (cada 8, 12 o 24 horas) calculando automáticamente las horas del día recomendadas (08:00, 14:00, 20:00).
3. **Persistencia en Base de Datos:**  
   Las altas, bajas y reposiciones se guardan directamente en la tabla `recetas` de PostgreSQL en Supabase.

---

## 4. Test IDs y Verificación Automatizada

* `data-testid="input-search-medication"`: Campo de búsqueda reactivo.
* `data-testid="tab-filter-active"`: Pestaña para filtrar recetas activas.
* `data-testid="btn-add-medication-modal"`: Botón para abrir el formulario de nueva receta.
* `data-testid="badge-stock-warning"`: Etiqueta de aviso de pocas existencias.
