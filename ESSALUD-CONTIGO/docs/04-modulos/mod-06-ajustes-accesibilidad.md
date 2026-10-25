# MOD-06: Ajustes del Sistema, Umbrales y Accesibilidad
## Especificación de Configuración Clínica y Personalización Asistiva

---

## 1. Propósito y Contexto de Negocio

Este módulo permite a los cuidadores y profesionales personalizar la experiencia asistiva y adaptar los parámetros de control a la condición de salud específica de cada asegurado.

---

## 2. Componentes de la Interfaz

* **Sección de Umbrales Clínicos de Alarma:**
  * Control deslizante (*slider*) o campo numérico para fijar el límite máximo de presión sistólica (por defecto $140\text{ mmHg}$) y diastólica (por defecto $90\text{ mmHg}$).
  * Al superar estos valores en una medición, el sistema genera automáticamente una alerta de severidad crítica.
* **Configuración del Asistente de Voz (TTS - Web Speech API):**
  * Selector desplegable de voces en español detectadas en el sistema (ej. *Google español*, *Microsoft Sabina*, *Microsoft Elena*).
  * Control de velocidad de habla (fijado por defecto en $0.88\times$ para máxima claridad en personas mayores).
  * Botón `[ 🔊 Probar Voz Ahora ]` para validar la pronunciación antes de activar en el teléfono del anciano.
* **Datos de Contacto de Emergencia:**
  * Teléfono celular del cuidador principal que recibirá los avisos del botón SOS.
* **Herramientas de Respaldo y Demostración:**
  * Botón `[ 💾 Descargar Respaldo JSON ]` para exportar el historial completo de mediciones.
  * Botón `[ 🔄 Reiniciar Datos Demo ]` para restablecer el entorno de prueba a un estado limpio durante exposiciones académicas.

---

## 3. Test IDs y Verificación Automatizada

* `data-testid="select-tts-voice"`: Selector de voz en español.
* `data-testid="btn-test-tts-voice"`: Botón de prueba sonora de voz.
* `data-testid="input-threshold-systolic"`: Campo de umbral de presión sistólica.
* `data-testid="btn-reset-demo-data"`: Botón de reinicio de datos de demostración.
