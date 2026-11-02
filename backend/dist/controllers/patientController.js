"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePatientSettings = exports.getPatientSettings = exports.linkByFamilyCode = exports.getPatientById = exports.getPatients = void 0;
const db_1 = require("../config/db");
const getPatients = async (_req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT p.*, c.nombre_completo AS cuidador_nombre, c.telefono AS cuidador_telefono
      FROM pacientes p
      LEFT JOIN cuidadores c ON p.cuidador_id = c.id
      ORDER BY p.nombre_completo ASC
    `);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener pacientes', details: error.message });
    }
};
exports.getPatients = getPatients;
const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.pool.query(`SELECT p.*, c.nombre_completo AS cuidador_nombre, c.telefono AS cuidador_telefono
       FROM pacientes p
       LEFT JOIN cuidadores c ON p.cuidador_id = c.id
       WHERE p.id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener el paciente', details: error.message });
    }
};
exports.getPatientById = getPatientById;
// Enrolamiento del teléfono del anciano mediante Código Familiar (Sin Login)
const linkByFamilyCode = async (req, res) => {
    try {
        const { codigo } = req.body;
        if (!codigo) {
            return res.status(400).json({ error: 'El código de enlace familiar es requerido' });
        }
        const result = await db_1.pool.query(`SELECT p.*, c.nombre_completo AS cuidador_nombre, c.telefono AS cuidador_telefono, c.parentesco, c.codigo_cuidador
       FROM pacientes p
       LEFT JOIN cuidadores c ON p.cuidador_id = c.id
       WHERE UPPER(p.codigo_enlace_familiar) = UPPER($1) OR UPPER(c.codigo_cuidador) = UPPER($1)
       LIMIT 1`, [codigo.trim()]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Código familiar inválido o no encontrado en EsSalud' });
        }
        const patient = result.rows[0];
        res.json({
            message: 'Teléfono vinculado exitosamente en Modo Senior',
            patient,
            tokenPermanente: `senior_token_${patient.id}_${Date.now()}`
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al vincular con código familiar', details: error.message });
    }
};
exports.linkByFamilyCode = linkByFamilyCode;
// Obtener Ajustes Clínicos y Remotos del Paciente
const getPatientSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.pool.query(`SELECT id, modo_facil_activo, guia_voz_activa, configuracion_clinica
       FROM pacientes
       WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        const row = result.rows[0];
        const settings = {
            patientId: row.id,
            modoFacilActivo: row.modo_facil_activo ?? true,
            guiaVozActiva: row.guia_voz_activa ?? true,
            ...(row.configuracion_clinica || {
                systolicMaxNormal: 140,
                systolicMinNormal: 90,
                diastolicMaxNormal: 90,
                diastolicMinNormal: 60,
                notifyOnOutOfRange: true,
                notifyMissedDoseMinutes: 30
            })
        };
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al consultar ajustes', details: error.message });
    }
};
exports.getPatientSettings = getPatientSettings;
// Actualizar Ajustes Clínicos y Remotos del Paciente
const updatePatientSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { modoFacilActivo, guiaVozActiva, ...clinicalSettings } = req.body;
        const result = await db_1.pool.query(`UPDATE pacientes
       SET modo_facil_activo = COALESCE($1, modo_facil_activo),
           guia_voz_activa = COALESCE($2, guia_voz_activa),
           configuracion_clinica = COALESCE($3, configuracion_clinica)
       WHERE id = $4
       RETURNING id, nombre_completo, modo_facil_activo, guia_voz_activa, configuracion_clinica`, [
            modoFacilActivo !== undefined ? modoFacilActivo : null,
            guiaVozActiva !== undefined ? guiaVozActiva : null,
            clinicalSettings && Object.keys(clinicalSettings).length > 0 ? JSON.stringify(clinicalSettings) : null,
            id
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        const row = result.rows[0];
        res.json({
            message: 'Ajustes guardados y sincronizados exitosamente',
            patient: row,
            settings: {
                patientId: row.id,
                modoFacilActivo: row.modo_facil_activo,
                guiaVozActiva: row.guia_voz_activa,
                ...(row.configuracion_clinica || {})
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar ajustes', details: error.message });
    }
};
exports.updatePatientSettings = updatePatientSettings;
