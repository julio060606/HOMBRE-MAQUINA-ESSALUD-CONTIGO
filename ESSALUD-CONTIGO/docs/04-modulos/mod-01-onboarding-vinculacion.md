# MOD-01: Onboarding y Vinculación por PIN/DNI
## Especificación Funcional de Autenticación y Emparejamiento

---

## 1. Propósito y Contexto de Negocio

Este módulo resuelve la mayor debilidad de *EsSalud Mi Consulta*: **la imposibilidad de que un familiar supervise formalmente a su adulto mayor sin quitarle el celular o usar sus contraseñas privadas**.

Permite que el cuidador (hijo, nieto, cónyuge o enfermero) cree una cuenta segura y vincule el perfil clínico del asegurado anciano mediante un **código PIN de 6 dígitos** o el **número de DNI del paciente**.

---

## 2. Flujo de Vinculación Paso a Paso

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     PORTAL WEB DEL CUIDADOR     │           │   CELULAR DEL ADULTO MAYOR      │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │ 1. Hace clic en "Vincular Paciente"         │
                 │ 2. Ingresa DNI del paciente                 │
                 ▼                                             │
      [ Petición de Emparejamiento ] ──> [ Muestra PIN de 6 dígitos en pantalla ]
                 │                                             │
                 │ 3. Cuidador introduce el PIN                │
                 │    mostrado en el celular del abuelo        │
                 ▼                                             ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                 BACKEND VALIDA PIN Y ASOCIA REGISTROS EN SUPABASE             │
│            UPDATE pacientes SET cuidador_id = :cuidador_id                    │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        ▼
                 [ ¡Vinculación Confirmada! Recetas y Signos Sincronizados ]
```

---

## 3. Reglas de Negocio y Validaciones

1. **Unicidad de DNI:** El DNI del paciente debe ser un número válido de 8 dígitos registrado en la base de datos de asegurados de EsSalud.
2. **Expiración de PIN:** El código PIN generado en el celular del paciente tiene una vigencia máxima de **10 minutos** para prevenir accesos no autorizados.
3. **Múltiples Pacientes por Cuidador:** Un solo cuidador puede tener asociados varios familiares (ej. a su padre y a su madre), pudiendo alternar entre ellos con un selector en el encabezado del dashboard.
4. **Respeto a la Privacidad:** El paciente siempre puede ver en su teléfono el nombre de la persona vinculada como su cuidador principal (ej. *"Cuidado supervisado por: Gerson Vega (Hijo)"*).

---

## 4. Componentes Visuales y Test IDs

* `data-testid="input-link-patient-pin"`: Campo de texto con auto-foco y formato de bloques para el código de 6 dígitos.
* `data-testid="btn-confirm-link-patient"`: Botón de confirmación de vinculación.
* `data-testid="select-active-patient"`: Menú desplegable en la barra de navegación para alternar de paciente activo.
