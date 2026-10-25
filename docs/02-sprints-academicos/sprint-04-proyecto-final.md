# Sprint 4: Interfaces Emergentes, Backend Cloud y Proyecto Final
## Entregable Académico: Proyecto Final (PROY - Semanas 14 a 18) [30% Nota Final]

---

## 1. Alcance de la Unidad 4: Nuevos Paradigmas de Interacción

La **Unidad 4 del Sílabo** aborda las tecnologías emergentes en la interacción humano-computadora:
1. **Diseño de interfaces táctiles para dispositivos móviles** (patrones de interacción móvil y ergonomía).
2. **Interfaces de voz e interacción multimodal** (interfaces auditivas conversacionales y síntesis de voz).
3. **Diseño de interfaces web responsivas y accesibles** (navegación en múltiples factores de forma).
4. **Despliegue e integración en la nube** (solución completa 100% operativa y persistente).

---

## 2. Paradigma Multimodal e Interacción por Voz (VUI)

"EsSalud Contigo" incorpora una **interfaz de voz multimodal (Voice User Interface)** diseñada específicamente para reducir la brecha de alfabetización digital en la tercera edad:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FLUJO MULTIMODAL DE INTERACCIÓN POR VOZ                         │
│                                                                                        │
│   [ Disparo del Recordatorio ] ──> [ Chime de Atención (Web Audio API) ]               │
│                                                   │                                    │
│                                                   ▼                                    │
│   [ Lectura del Mensaje ] <─────── [ Síntesis de Voz Asistiva (Web Speech API) ]       │
│   "Hola Dacio, son las 8:00 AM.                     │                                  │
│    Te toca tomar tu Losartán de 50 mg."             ▼                                  │
│                                      [ Espera del Toque Háptico (Botón 64px) ]         │
│                                                   │                                    │
│                                                   ▼                                    │
│   [ Confirmación Inmediata ] <──── [ Voz: "¡Excelente! Toma registrada y avisada" ]   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Independencia de APIs Externas:** Al ejecutarse de forma nativa en el navegador mediante la **Web Speech API**, no genera costos por consumo de tokens ni depende de una conexión a internet de alta velocidad.
* **Tolerancia a Ambientes Ruidosos:** La interfaz combina el canal auditivo con el visual (colores de alto contraste) para garantizar que el paciente capte el mensaje incluso con ruido ambiental en el hogar.

---

## 3. Integración Cloud-Native: Node.js + Supabase + Vercel

Para la entrega final, el sistema cuenta con una arquitectura de despliegue en la nube que garantiza **cero mocks y 100% persistencia real**:

1. **Frontend Hosting (Vercel):** La aplicación React + Vite se compila y aloja en la red global de distribución (CDN) de Vercel con certificados SSL automáticos.
2. **Backend Serverless / REST (Node.js en Vercel):** Maneja las rutas HTTP REST (`/api/pacientes`, `/api/recetas`, `/api/tomas`, `/api/presion`, `/api/alertas`) con lógica clínica estricta.
3. **Base de Datos Relacional (Supabase Cloud):** Motor PostgreSQL 15 en la nube donde los datos persisten indefinidamente y se sincronizan en tiempo real mediante WebSockets.

---

## 4. Guía de Sustentación Oral y Demostración en Vivo ante el Jurado

Para la exposición final de 15 minutos, el equipo utilizará la siguiente secuencia de alto impacto:

1. **Minutos 0 a 3: El Problema de EsSalud.**  
   Mostrar capturas de *EsSalud Mi Consulta* y las reseñas reales de la Play Store ("2.6 estrellas, jubilados haciendo cola de madrugada, nombres químicos incomprensibles").
2. **Minutos 3 a 6: Fundamentos IHM y Accesibilidad.**  
   Explicar la reducción del Golfo de Norman, el análisis de tareas GOMS y cómo el botón de $64\times64\text{ px}$ junto con la foto real del comprimido cumplen la norma **WCAG 2.1 AAA**.
3. **Minutos 6 a 12: Demostración en Vivo (Live Demo Multi-Dispositivo).**  
   - Abrir la **App Móvil del Paciente** en un teléfono físico (o emulador) y el **Portal Web del Cuidador** en la laptop del profesor.
   - En el teléfono: presionar el altavoz para escuchar la voz en español y presionar *"YA LA TOMÉ"*.
   - En la laptop: mostrar cómo el dashboard del cuidador actualiza la adherencia instantáneamente en la base de datos Supabase.
   - En el teléfono: activar el botón *"🚨 SOS"*, disparando la sirena y la notificación en la laptop.
4. **Minutos 12 a 15: Métricas SUS (95.83) y Conclusiones.**  
   Presentar la tabla experimental de tiempos de tarea (de $50.25\text{ s}$ a $4.65\text{ s}$) y responder preguntas del docente.
