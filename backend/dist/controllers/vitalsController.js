"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVitals = exports.getVitalsByPatient = void 0;
const db_1 = require("../config/db");
const getVitalsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const result = await db_1.pool.query(`SELECT * FROM registros_presion 
       WHERE paciente_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`, [patientId]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener signos vitales', details: error.message });
    }
};
exports.getVitalsByPatient = getVitalsByPatient;
const addVitals = async (req, res) => {
    try {
        const { paciente_id, sistolica, diastolica, pulso, registrado_via = 'APP_PACIENTE', notas } = req.body;
        if (!paciente_id || !sistolica || !diastolica) {
            return res.status(400).json({ error: 'Presión sistólica y diastólica son obligatorias' });
        }
        // Consultar umbrales clínicos personalizados del paciente en la BD
        const patResult = await db_1.pool.query(`SELECT configuracion_clinica FROM pacientes WHERE id = $1`, [paciente_id]);
        const cfg = patResult.rows[0]?.configuracion_clinica || {};
        const maxSys = Number(cfg.systolicMaxNormal) || 140;
        const minSys = Number(cfg.systolicMinNormal) || 90;
        const maxDia = Number(cfg.diastolicMaxNormal) || 90;
        const minDia = Number(cfg.diastolicMinNormal) || 60;
        const notifyOutOfRange = cfg.notifyOnOutOfRange !== false;
        // Clasificación clínica dinámica según los umbrales configurados por el médico/cuidador
        let estado = 'NORMAL';
        if (sistolica >= maxSys + 20 || diastolica >= maxDia + 15 || sistolica <= 70) {
            estado = 'CRITICAL';
        }
        else if (sistolica > maxSys || diastolica > maxDia || sistolica < minSys || diastolica < minDia) {
            estado = 'HIGH';
        }
        const result = await db_1.pool.query(`INSERT INTO registros_presion 
       (paciente_id, sistolica, diastolica, pulso, estado_clinico, registrado_via, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [paciente_id, sistolica, diastolica, pulso || 72, estado, registrado_via, notas || 'Medición de control']);
        const log = result.rows[0];
        // Si sale de los rangos médicos configurados y las alertas están activas, generar alerta médica
        if (estado !== 'NORMAL' && notifyOutOfRange) {
            await db_1.pool.query(`INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
         VALUES ($1, 'CRITICAL_VITALS', $2, $3, $4)`, [
                paciente_id,
                estado === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
                `Presión ${estado === 'CRITICAL' ? 'Crítica' : 'Fuera de Rango'}: ${sistolica}/${diastolica} mmHg`,
                `Lectura fuera del rango configurado (${minSys}-${maxSys} / ${minDia}-${maxDia} mmHg). Registrado vía ${registrado_via}.`
            ]);
        }
        res.status(201).json({
            registro: log,
            alertaGenerada: estado !== 'NORMAL'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al registrar signos vitales', details: error.message });
    }
};
exports.addVitals = addVitals;
