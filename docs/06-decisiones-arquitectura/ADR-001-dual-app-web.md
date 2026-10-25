# ADR-001: Separación de Roles en Doble Plataforma (Móvil Paciente y Web Cuidador)

* **Estado:** Aceptado y Vigente.
* **Fecha:** Octubre 2026.
* **Contexto:** En el sistema de salud peruano (EsSalud), los adultos mayores con enfermedades crónicas suelen depender de familiares para gestionar recetas complejas, compras de farmacia y citas médicas. La aplicación oficial *EsSalud Mi Consulta* unifica todas estas tareas en una única interfaz móvil compleja, provocando sobrecarga cognitiva y abandono por parte del adulto mayor.

---

## 1. Decisión Tomada

Separar radicalmente las responsabilidades del sistema en dos factores de forma especializados comunicados por un único backend central:

1. **Cliente Móvil Asistido (Asegurado Mayor):**
   * Plataforma: Web Móvil / PWA optimizada para pantallas táctiles de teléfonos celulares.
   * Alcance funcional: Estrictamente 3 acciones (confirmar pastilla de la hora con botón de 64px, medir presión arterial en 1 toque y botón de auxilio SOS). Cero gestión burocrática.
2. **Portal Web de Escritorio (Familiar Cuidador / Médico):**
   * Plataforma: Single Page Application (SPA) para monitores de laptop o PC de escritorio.
   * Alcance funcional: Configuración de recetas de EsSalud, control de existencias de farmacia, gráficos de tendencias de presión arterial y generación de reportes clínicos en PDF.

---

## 2. Consecuencias Positivas

* **Cumplimiento WCAG 2.1 AAA:** Al eliminar menús anidados en el teléfono del anciano, la interfaz móvil puede dedicar todo su espacio a botones táctiles gigantes de $64\text{ px}$ y fotografías reales en alta resolución.
* **Reducción de Tiempo de Tarea ($90.75\%$):** El paciente completa su registro en $4.2\text{ segundos}$ frente a los más de $42\text{ segundos}$ que requería en la app base.
* **Facilidad para el Cuidador:** El familiar puede revisar el estado de salud de sus padres desde su trabajo en cualquier computadora sin necesidad de interrumpirlos ni pedirles contraseñas.

---

## 3. Alternativas Descartadas

* **Opción A (Aplicación Única Monolítica Móvil):** Descartada porque saturaba la pantalla del teléfono con tablas y gráficos ilegibles para un adulto mayor.
* **Opción B (Solo Portal Web para el Cuidador sin App para el Anciano):** Descartada porque eliminaba la autonomía del paciente y no permitía la confirmación visual de la toma con foto ni el botón de auxilio SOS.
