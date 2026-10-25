# MOD-00: Landing Institucional y Acceso Unificado
## Especificación Funcional de Entrada al Ecosistema

---

## 1. Propósito y Contexto de Negocio

La Landing Institucional actúa como el **puente de confianza** entre el portal oficial del Seguro Social de Salud (EsSalud) y el ecosistema especializado "EsSalud Contigo".

Su objetivo es:
1. Validar la procedencia institucional ante el usuario mediante la identidad gráfica de EsSalud (colores `#005696`, tipografía clara, logos oficiales).
2. Orientar al visitante en un embudo simple de dos vías:
   * **Vía A (Adulto Mayor):** Instrucciones claras para abrir la app móvil asistida.
   * **Vía B (Cuidador Familiar):** Acceso al portal web de monitoreo para registrarse o iniciar sesión.

---

## 2. Componentes de la Interfaz

* **Header Institucional:**  
  Logo de EsSalud + texto *"Programa Nacional de Teleasistencia para el Asegurado Crónico"*. Enlaces rápidos a *"Servicios"*, *"Accesibilidad"* y botón *"Iniciar Sesión Cuidador"*.
* **Hero Section:**  
  * Titular: *"Cuidando a quienes nos cuidaron: Telemonitoreo y pastillero digital para el adulto mayor"*.
  * Subtítulo explicativo: *"Sincroniza el tratamiento médico de tus padres o abuelos directamente con las recetas de tu policlínico de EsSalud."*
  * Call to Action (CTA) dual:
    * `[ 📱 Probar Modo Asistido Móvil ]` (abre `/patient-simulator` o el instalador PWA).
    * `[ 💻 Ingresar al Portal del Cuidador ]` (abre `/login`).
* **Sección de Justificación IHM / Accesibilidad:**  
  Tres tarjetas informativas destacando:
  1. *Botón Gigante de 64px:* Sin errores por temblor ni artritis.
  2. *Reconocimiento por Foto:* La pastilla real sin confusiones de nombres químicos.
  3. *Voz Asistiva en Español:* Lectura automática de indicaciones para personas con presbicia.

---

## 3. Criterios de Aceptación (Testing)

* `data-testid="landing-btn-patient-mobile"`: Redirige fluidamente a la experiencia del paciente.
* `data-testid="landing-btn-caregiver-portal"`: Redirige al login seguro de cuidadores.
* Contraste cromático en todos los textos de la landing con ratio superior a **$7:1$** (WCAG AAA).
