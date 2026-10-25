# Plan del Backend: Node.js, Express y Supabase
## Especificación de Endpoints REST, Lógica de Negocio y Conexión Cloud

---

## 1. Justificación y Objetivos Técnicos

El backend tiene como propósito primordial **centralizar la lógica de negocio clínica** y **garantizar persistencia real en la nube**, eliminando de forma definitiva cualquier simulación o dato en memoria:

1. **Recepción Unificada:** Procesa las interacciones originadas tanto en la app del paciente como en el dashboard del cuidador.
2. **Cómputo Clínico:** Ejecuta las reglas de salud (adherencia, control de crisis hipertensivas, inventario).
3. **Persistencia Garantizada:** Almacena cada registro en la base de datos PostgreSQL de Supabase en tiempo real.

---

## 2. Contrato de Endpoints REST API

El backend expone rutas bajo el prefijo `/api/v1/`:

### 2.1 Módulo de Tomas y Adherencia Farmacológica
* `GET /api/v1/patients/:id/intakes/today`  
  * **Descripción:** Retorna el cronograma de tomas programadas para el día de hoy, con nombre, dosis, horario, foto real del medicamento y estado (`PENDING` / `TAKEN`).
* `POST /api/v1/intakes/:id/confirm`  
  * **Descripción:** Registra la confirmación de la toma por parte del paciente (cuando presiona *"YA LA TOMÉ"*).
  * **Cuerpo (JSON):** `{ "confirmedVia": "MANUAL_PATIENT" | "VOICE_PATIENT" }`
  * **Lógica del Servidor:**  
    1. Marca el estado de la toma como `TAKEN` y guarda la marca de tiempo `takenAt` (ISO 8601).
    2. Descuenta en 1 unidad el stock de pastillas disponible en la receta asociada.
    3. Si el stock restante es $\le 3$, genera automáticamente una notificación de reposición: *"Quedan pocas pastillas de Losartán"*.
    4. Recalcula el porcentaje de adherencia del paciente para el día actual.

### 2.2 Módulo de Signos Vitales y Biometría
* `GET /api/v1/patients/:id/vitals`  
  * **Descripción:** Retorna el historial de mediciones de presión arterial y pulso ordenadas cronológicamente.
* `POST /api/v1/patients/:id/vitals`  
  * **Descripción:** Registra una nueva toma de presión arterial.
  * **Cuerpo (JSON):** `{ "systolic": 145, "diastolic": 92, "pulse": 85, "notes": "Medición matutina" }`
  * **Lógica del Servidor:**  
    1. Valida que los valores estén en rangos fisiológicos posibles ($70 \le \text{sistólica} \le 240$, $40 \le \text{diastólica} \le 150$).
    2. Clasifica el estado: `NORMAL`, `HIGH` o `CRITICAL`.
    3. Si la presión es $\ge 140/90\text{ mmHg}$, inserta de inmediato un evento en la tabla de `alertas_clinicas` con severidad `CRITICAL` para alertar al cuidador.

### 2.3 Módulo de Seguridad y Botón de Pánico SOS
* `POST /api/v1/patients/:id/alerts/sos`  
  * **Descripción:** Disparo de auxilio inmediato desde el celular del anciano.
  * **Cuerpo (JSON):** `{ "notes": "Botón de pánico presionado por el paciente" }`
  * **Lógica del Servidor:**  
    1. Registra el evento crítico en la tabla de alertas con severidad `PANIC_BUTTON`.
    2. Emite la señal en tiempo real al canal WebSocket de Supabase para que el dashboard del cuidador comience a parpadear en rojo de inmediato.

---

## 3. Conexión con Supabase PostgreSQL

El servidor Node.js se conecta a Supabase mediante el cliente oficial `@supabase/supabase-js` con variables de entorno protegidas:

```typescript
// backend/src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Advertencia: Variables de entorno de Supabase no configuradas.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

### Configuración de Variables de Entorno (`.env`)
```bash
PORT=4000
NODE_ENV=production
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
