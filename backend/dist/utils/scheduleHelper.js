"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScheduleTimes = calculateScheduleTimes;
/**
 * Helper clínico para cálculo de horarios diarios según frecuencia de dosificación.
 * Basado en las guías farmacológicas geriátricas de EsSalud (rutinas de desayuno, almuerzo y cena).
 */
function calculateScheduleTimes(frecuenciaHoras, horaBase = '08:00') {
    const freq = Number(frecuenciaHoras) || 24;
    if (freq <= 6) {
        // 4 tomas al día (cada 6 horas): Mañana, Mediodía, Tarde, Noche
        return ['06:00:00', '12:00:00', '18:00:00', '23:00:00'];
    }
    if (freq <= 8) {
        // 3 tomas al día (cada 8 horas): Desayuno (08:00), Almuerzo (14:00), Cena (20:00)
        return ['08:00:00', '14:00:00', '20:00:00'];
    }
    if (freq <= 12) {
        // 2 tomas al día (cada 12 horas): Desayuno (08:00) y Cena (20:00)
        return ['08:00:00', '20:00:00'];
    }
    // 1 toma al día (cada 24 horas): Respeta la hora programada específica
    const formattedHour = horaBase.length === 5 ? `${horaBase}:00` : (horaBase || '08:00:00');
    return [formattedHour];
}
