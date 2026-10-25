# MOD-03: Dashboard Central del Cuidador (Web Escritorio)
## Especificación del Panel de Monitoreo Clínico y Supervisión en Tiempo Real

---

## 1. Propósito y Contexto de Negocio

El **Dashboard del Cuidador** es la herramienta de trabajo para los familiares y profesionales a cargo del adulto mayor. Ofrece un panorama clínico completo en **menos de 5 segundos de lectura**, respondiendo a las preguntas críticas:
1. *¿Mi familiar tomó sus medicinas hoy?*
2. *¿Cómo estuvo su presión arterial?*
3. *¿Hay alguna alerta de emergencia o falta de pastillas?*
4. *¿Cuándo es su próxima cita médica en el policlínico de EsSalud?*

---

## 2. Componentes de la Interfaz del Dashboard

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO ESSALUD CONTIGO]   Paciente Activo: [ Dacio Ramos Quispe (78a) ▼ ]  [ Perfil ]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚨 BANNER DE ALERTA CRÍTICA (Solo visible si hay evento SOS o crisis hipertensiva)      │
│ "ALERTA SOS DISPARADA DESDE EL MÓVIL A LAS 08:12 AM - CONTACTAR INMEDIATAMENTE"       │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ 📊 ADHERENCIA HOY │ ❤️ ÚLTIMA PRESIÓN │ 📅 PRÓXIMA CITA   │ 💊 EXISTENCIAS EN CASA     │
│       100%        │    120 / 80 mmHg  │ 28 Oct, 10:30 AM  │ 28 Comprimidos             │
│  3 de 3 dosis     │ Estado: Óptimo    │ Geriatría         │ Cobertura: 14 días         │
│  completadas      │ Pulso: 72 bpm     │ Policlínico Ch.   │ [ Ver Stock Detallado ]    │
├───────────────────┴───────────────────┴───────────────────┴────────────────────────────┤
│ 📋 CRONOGRAMA DE TOMAS DEL DÍA (HOY)                                                    │
│ ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 08:00 AM  •  Losartán Potásico (50 mg)    •  [ ✅ Tomada a las 08:05 AM por Dacio ] │ │
│ │ 01:00 PM  •  Metformina Clorhidrato (850 mg)  [ ✅ Tomada a las 01:10 PM por Dacio ] │ │
│ │ 08:00 PM  •  Atorvastatina (20 mg)            [ ⏳ Pendiente para la noche ]        │ │
│ └────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 📈 TENDENCIA DE PRESIÓN ARTERIAL (Últimos 7 días)                                      │
│ [ Gráfico de Líneas Interactivo con Recharts: Sistólica vs Diastólica con Línea 140/90]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Reglas de Negocio y Lógica del Sistema

1. **Cálculo de Adherencia en Tiempo Real:**  
   $$\text{Adherencia} = \left( \frac{\text{Dosis marcadas como TAKEN cuyo horario ya venció}}{\text{Total de dosis programadas hasta la hora actual}} \right) \times 100$$
2. **Banner de Emergencia SOS:**  
   Si en la tabla `alertas_clinicas` existe un registro no atendido con severidad `CRITICAL` o tipo `PANIC_BUTTON`, el encabezado de toda la plataforma web despliega un banner parpadeante en rojo carmesí con botón de llamada directa.
3. **Control de Prescripciones Médicas:**  
   El cuidador puede visualizar la ficha del paciente pero **no puede alterar dosis farmacológicas sin receta médica de EsSalud**. Solo puede registrar compras de reposición en farmacia y notas de acompañamiento.

---

## 4. Test IDs y Verificación Automatizada

* `data-testid="stat-adherence-card"`: Tarjeta de porcentaje de adherencia diaria.
* `data-testid="stat-vitals-card"`: Tarjeta con la última presión registrada.
* `data-testid="banner-sos-critical"`: Banner de alerta de auxilio en tiempo real.
* `data-testid="btn-mark-intake-manual"`: Botón de confirmación manual de toma por parte del cuidador.
