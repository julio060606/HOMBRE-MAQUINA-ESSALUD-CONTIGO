# Catálogo de Componentes y Patrones de Accesibilidad
## Guía de Componentes Atómicos para el Adulto Mayor y el Cuidador

---

## 1. Componentes de la Interfaz Móvil del Paciente

### 1.1 Botón Gigante "YA LA TOMÉ" (64px)
* **Objetivo IHM:** Mitigar deslices por temblores involuntarios y artritis (WCAG 2.5.5 AAA).
* **Clases Tailwind:** `w-full h-16 bg-forest-700 hover:bg-forest-800 text-white rounded-2xl font-heading font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all`.
* **Comportamiento:** Dispara el sonido chime en Web Audio API, ejecuta la locución por voz en Web Speech API y envía la petición `POST` al backend.

### 1.2 Tarjeta de Medicamento con Foto Real ($H_6$)
* **Objetivo IHM:** Reconocimiento antes que recuerdo.
* **Estructura:**
  * Contenedor de imagen en alta resolución de $112\text{ px}$ de altura (`h-28`) con borde redondeado y etiqueta flotante *"Foto Real del Comprimido"*.
  * Título del fármaco en `text-lg font-bold` y dosis en `text-xs font-semibold`.
  * Indicación clara en lenguaje natural (ej. *"Tomar después del desayuno con agua tibia"*).

### 1.3 Botón de Auxilio Inmediato SOS ($H_{10}$)
* **Objetivo IHM:** Acceso a socorro en 1 toque sin pantallas intermedias.
* **Clases Tailwind:** `w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all`.
* **Comportamiento:** Activa animación parpadeante (`animate-pulse`), sirena acústica de dos tonos en bucle breve y envía la alerta crítica a la base de datos Supabase.

---

## 2. Componentes del Dashboard del Cuidador

### 2.1 Tarjeta de Adherencia Farmacológica
* **Objetivo IHM:** Visibilidad instantánea del cumplimiento terapéutico ($H_1$).
* **Visual:** Medidor de porcentaje diario en tipografía destacada (`text-3xl font-bold`) con indicador de dosis completadas (ej. *"3 de 3 tomas realizadas"*).

### 2.2 Gráfico Biométrico Recharts
* **Objetivo IHM:** Detección visual de anomalías en la presión arterial.
* **Visual:** Gráfico de dos líneas continuas (rojo sistólica, azul diastólica) complementado con una línea horizontal punteada de referencia clínica en $140\text{ mmHg}$.

### 2.3 Banner de Emergencia Parpadeante
* **Objetivo IHM:** Alerta visual imperdible cuando el anciano activa el botón SOS.
* **Visual:** Barra superior en rojo intenso (`bg-rose-600`) con texto blanco en mayúsculas, icono parpadeante de campana y botón de llamada directa.
