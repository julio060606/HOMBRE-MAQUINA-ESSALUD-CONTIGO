# Especificación de Módulos Funcionales: EsSalud Contigo
## Catálogo y Reglas de Negocio del Ecosistema

Este directorio contiene las especificaciones detalladas de cada módulo del sistema, definiendo sus reglas de negocio, validaciones, componentes visuales e interacción Humano-Computadora (IHM).

---

## 🗺️ Mapa de Módulos

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ECOSISTEMA ESSALUD CONTIGO                             │
├─────────┬───────────────────────────────────┬──────────────────────────────────────────┤
│ Código  │ Nombre del Módulo                 │ Rol Principal y Plataforma               │
├─────────┼───────────────────────────────────┼──────────────────────────────────────────┤
│ MOD-00  │ Landing Institucional y Acceso    │ Público / Asegurados (Web Responsive)    │
│ MOD-01  │ Onboarding y Vinculación por PIN  │ Cuidador Familiar (Web Escritorio)       │
│ MOD-02  │ Experiencia del Paciente Asistida │ Asegurado Adulto Mayor (Móvil PWA)       │
│ MOD-03  │ Dashboard Central de Monitoreo    │ Cuidador Familiar (Web Escritorio)       │
│ MOD-04  │ Recetas, Pastillero y Existencias │ Cuidador Familiar (Web Escritorio)       │
│ MOD-05  │ Históricos Biométricos y Reportes │ Cuidador / Médico EsSalud (Web)          │
│ MOD-06  │ Ajustes, Umbrales y Accesibilidad │ Administrador / Cuidador (Web)           │
└─────────┴───────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 📑 Lista de Especificaciones

* **[MOD-00: Landing Institucional y Acceso](./mod-00-landing-acceso.md)**: Entrada desde el portal oficial de EsSalud, selección de rol y descarga/acceso.
* **[MOD-01: Onboarding y Vinculación](./mod-01-onboarding-vinculacion.md)**: Emparejamiento seguro entre el teléfono del anciano y la laptop del cuidador mediante PIN de 6 dígitos.
* **[MOD-02: Experiencia del Paciente](./mod-02-experiencia-paciente.md)**: La interfaz móvil para el anciano con botón gigante de $64\text{ px}$, foto real, Web Speech TTS y SOS.
* **[MOD-03: Dashboard del Cuidador](./mod-03-dashboard-cuidador.md)**: Vista en tiempo real de adherencia, última presión, alertas activas y próximas citas.
* **[MOD-04: Medicamentos y Recetas](./mod-04-medicamentos-recetas.md)**: Registro de recetas de EsSalud, control de stock y cálculo de días restantes.
* **[MOD-05: Históricos y Reportes PDF](./mod-05-historicos-reporte.md)**: Gráficos de tendencias de presión arterial y generación de ficha clínica en PDF para la cita médica.
* **[MOD-06: Ajustes y Accesibilidad](./mod-06-ajustes-accesibilidad.md)**: Configuración de umbrales clínicos de hipertensión y selector de voz TTS en español.
