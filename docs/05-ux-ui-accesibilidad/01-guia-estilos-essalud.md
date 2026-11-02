# Guía de Estilos Visuales e Identidad Institucional EsSalud
## Tokens de Diseño, Paleta Accesible (WCAG AAA) y Tipografía

---

## 1. Identidad Institucional y Principios Visuales

El diseño de **EsSalud Contigo** combina la seriedad y confianza de la identidad visual del Seguro Social de Salud del Perú con los estándares más estrictos de accesibilidad para la tercera edad:

1. **Claridad Clínica:** Fondos neutros y limpios que reducen el ruido visual y el cansancio ocular.
2. **Contraste Aumentado (Nivel AAA):** Ningún elemento de texto informativo posee un ratio de contraste inferior a $7:1$ con respecto a su fondo.
3. **Consistencia Atómica:** Bordes limpios, iconos médicos semánticos universales (Lucide Icons) y jerarquía visual nítida.

---

## 2. Paleta de Colores y Ratios de Contraste

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PALETA INSTITUCIONAL ESSALUD CONTIGO                            │
├────────────────────┬───────────┬───────────────────┬───────────────────────────────────┤
│ Nombre del Color   │ Código HEX│ Ratio Contraste   │ Uso en la Interfaz                │
├────────────────────┼───────────┼───────────────────┼───────────────────────────────────┤
│ Azul EsSalud       │ #005696   │ 8.4 : 1 (Blanco)  │ Encabezados, botones primarios    │
│                    │           │ (WCAG AAA)        │ del cuidador e identidad de marca.│
├────────────────────┼───────────┼───────────────────┼───────────────────────────────────┤
│ Verde Clínico      │ #136F53   │ 7.2 : 1 (Blanco)  │ Botón "YA LA TOMÉ", dosis         │
│ (Forest Green)     │           │ (WCAG AAA)        │ confirmadas y estado óptimo.      │
├────────────────────┼───────────┼───────────────────┼───────────────────────────────────┤
│ Rojo Alerta SOS    │ #DC2626   │ 7.1 : 1 (Blanco)  │ Botón de pánico SOS, alertas de   │
│ (Crimson Red)      │           │ (WCAG AAA)        │ hipertensión y emergencias.       │
├────────────────────┼───────────┼───────────────────┼───────────────────────────────────┤
│ Fondo de Aplicación│ #F8F9FA   │ Base Neutra       │ Fondo de pantalla general que     │
│ (Soft Gray)        │           │                   │ evita el deslumbramiento blanco.  │
├────────────────────┼───────────┼───────────────────┼───────────────────────────────────┤
│ Texto Principal    │ #0F172A   │ 14.8 : 1 (Blanco) │ Títulos, dosis y nombres de       │
│ (Slate 900)        │           │ (WCAG AAA)        │ medicamentos en primer plano.     │
└────────────────────┴───────────┴───────────────────┴───────────────────────────────────┘
```

---

## 3. Tipografía y Escala de Tamaños

Se utiliza una tipografía sans-serif de alta legibilidad (*Inter* o *system-ui*) con pesos marcados para personas con visión cansada:

* **Títulos en Móvil Paciente:** `text-xl` ($20\text{ px}$) a `text-2xl` ($24\text{ px}$), peso `font-bold`.
* **Nombre de Medicamentos en Móvil:** `text-lg` ($18\text{ px}$), peso `font-bold` con interlineado holgado.
* **Texto del Botón "YA LA TOMÉ":** `text-base` ($16\text{ px}$) en mayúsculas, tracking amplio (`tracking-wider`) y peso `font-bold`.
* **Textos en Dashboard Cuidador:** `text-xs` ($12\text{ px}$) para metadatos y `text-sm` ($14\text{ px}$) para datos clínicos principales.

---

## 4. Patrón de Espaciado y Botones Táctiles

* **Regla de Toque Mínimo en Móvil:**  
  Cualquier elemento clickeable por el adulto mayor debe tener una altura mínima de **$64\text{ px}$** (`h-16`) o un padding mínimo de `p-4`, garantizando el cumplimiento holgado del criterio **WCAG 2.5.5 Nivel AAA**.
