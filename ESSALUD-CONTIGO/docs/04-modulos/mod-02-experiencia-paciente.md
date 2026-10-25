# MOD-02: Experiencia Asistida del Paciente (App Móvil)
## Especificación de la Interfaz Táctil y Auditiva para el Asegurado Mayor

---

## 1. Filosofía de Interacción (HCI para la Tercera Edad)

Este módulo es el **corazón inclusivo** del proyecto. Está diseñado bajo los principios de la **Gerontotecnología** y las directrices **WCAG 2.1 AAA**, eliminando por completo los menús complejos, las barras de búsqueda y los textos diminutos.

El paciente asegurado únicamente interactúa con **tres decisiones visuales inmediatas**:
1. *"¿Qué pastilla me toca ahora y cómo es físicamente?"* $\rightarrow$ Foto real en alta resolución y botón gigante *"YA LA TOMÉ"*.
2. *"¿Cómo está mi presión arterial hoy?"* $\rightarrow$ Registro de presión en un solo toque.
3. *"¿Necesito auxilio urgente de mi familia?"* $\rightarrow$ Botón de auxilio SOS directo.

---

## 2. Componentes de la Pantalla del Paciente

```
┌────────────────────────────────────────────────────────┐
│ [08:05]                           [4G] [WiFi] [100%]   │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ MODO FÁCIL ASISTIDO              [ 🔊 Escuchar ]   │ │
│ │ Hola, Dacio                                        │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ⏰ 08:00 AM                        [ PENDIENTE ]   │ │
│ │ ┌────────────────────────────────────────────────┐ │ │
│ │ │                                                │ │ │
│ │ │      [ FOTOGRAFÍA REAL DEL COMPRIMIDO ]        │ │ │
│ │ │      (Pastilla redonda blanca ranurada)        │ │ │
│ │ │                                                │ │ │
│ │ └────────────────────────────────────────────────┘ │ │
│ │ Losartán Potásico (50 mg)                          │ │
│ │ Tomar después del desayuno con agua tibia.         │ │
│ │                                                    │ │
│ │ ┌────────────────────────────────────────────────┐ │ │
│ │ │                                                │ │ │
│ │ │            ✅ YA LA TOMÉ (64px)                 │ │ │
│ │ │                                                │ │ │
│ │ └────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ❤️ MEDIR PRESIÓN ARTERIAL                          │ │
│ │ [ Normal: 120 / 80 ]        [ Alta: 145 / 92 ]     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🚨 BOTÓN DE AUXILIO SOS (Emergencias)              │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 3. Especificaciones Técnicas y de Accesibilidad

### A. Botón Táctil Gigante "YA LA TOMÉ" (WCAG 2.5.5 AAA)
* **Dimensiones mínimas:** Ancho completo de la tarjeta ($100\%$) y **altura fija de $64\text{ px}$** (clase Tailwind `h-16`).
* **Espaciado perimetral:** Margen superior de $16\text{ px}$ para evitar toques accidentales con la fotografía o los textos.
* **Retroalimentación Doble:**
  1. Suena un chime médico suave y armonioso (**Web Audio API** con frecuencias en $523\text{ Hz}$ y $659\text{ Hz}$).
  2. Una voz pausada en español (**Web Speech API a 0.88x**) pronuncia: *"Muy bien, Dacio. Tu toma de Losartán ha sido confirmada y enviada a tu familiar."*
  3. El botón cambia a color verde esmeralda con icono de verificación y texto *"¡Dosis Registrada con Éxito!"*.

### B. Fotografía Real del Comprimido ($H_6$ de Nielsen)
* Sustituye la memorización de nombres químicos complejos.
* La imagen corresponde exactamente a la presentación dispensada por las farmacias de EsSalud (forma, color, ranura central).
* Posee texto alternativo descriptivo enriquecido (`alt="Comprimido blanco ranurado de Losartán 50mg"`).

### C. Botón de Pánico SOS Inmediato ($H_{10}$)
* **Color:** Rojo carmesí de alto contraste (`bg-rose-600` con texto blanco).
* **Acción:** Un solo toque dispara una sirena pulsante de emergencia de dos tonos ($800\text{ Hz} \leftrightarrow 1200\text{ Hz}$) y envía un evento crítico al backend con la geolocalización aproximada y la marca de tiempo.

---

## 4. Test IDs y Verificación Automatizada

* `data-testid="btn-patient-listen-tts"`: Botón de altavoz para escuchar la indicación en voz alta.
* `data-testid="btn-patient-take-pill"`: Botón gigante de confirmación de toma.
* `data-testid="btn-patient-quick-bp-normal"`: Registro rápido de presión normal.
* `data-testid="btn-patient-quick-bp-high"`: Registro rápido de presión alta (dispara alerta clínica).
* `data-testid="btn-patient-sos"`: Botón de auxilio inmediato.
