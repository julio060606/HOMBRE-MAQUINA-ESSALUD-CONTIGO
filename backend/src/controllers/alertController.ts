import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getAlertsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      `SELECT * FROM alertas_clinicas 
       WHERE paciente_id = $1 
       ORDER BY atendida ASC, created_at DESC 
       LIMIT 50`,
      [patientId]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener alertas', details: error.message });
  }
};

// Disparo de auxilio inmediato desde el botón SOS del móvil
export const triggerSos = async (req: Request, res: Response) => {
  try {
    const { paciente_id, notas = 'Alerta de auxilio disparada desde el botón SOS móvil' } = req.body;

    const result = await pool.query(
      `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
       VALUES ($1, 'PANIC_BUTTON', 'CRITICAL', '🚨 ALERTA SOS DE AUXILIO INMEDIATO', $2)
       RETURNING *`,
      [paciente_id, notas]
    );

    res.status(201).json({
      message: 'Alerta SOS emitida y registrada en la base de datos',
      alerta: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al emitir alerta SOS', details: error.message });
  }
};

// Registro de alerta clínica general (retrasos en medicamentos, valores fuera de rango)
export const createAlert = async (req: Request, res: Response) => {
  try {
    const { paciente_id, tipo = 'MISSED_MEDICATION', severidad = 'WARNING', titulo, descripcion } = req.body;

    const result = await pool.query(
      `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [paciente_id, tipo, severidad, titulo, descripcion]
    );

    res.status(201).json({
      message: 'Alerta clínica registrada',
      alerta: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al registrar alerta', details: error.message });
  }
};

export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo = 'ATENDIDA_POR_CUIDADOR', resuelta_por = 'Cuidador Familiar', notas = '' } = req.body;

    const result = await pool.query(
      `UPDATE alertas_clinicas 
       SET atendida = TRUE,
           resuelta_at = NOW(),
           motivo_resolucion = $2,
           resuelta_por = $3,
           notas_resolucion = $4
       WHERE id = $1 
       RETURNING *`,
      [id, motivo, resuelta_por, notas]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json({ message: 'Alerta atendida y registrada en la auditoría clínica con éxito', alerta: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al actualizar alerta', details: error.message });
  }
};

export const dismissAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo = 'FALSA_ALARMA', notas = 'Descartada por el cuidador' } = req.body;

    const result = await pool.query(
      `UPDATE alertas_clinicas 
       SET atendida = TRUE,
           resuelta_at = NOW(),
           motivo_resolucion = $2,
           resuelta_por = 'Cuidador Familiar',
           notas_resolucion = $3
       WHERE id = $1 
       RETURNING *`,
      [id, motivo, notas]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    res.json({ message: 'Alerta descartada con éxito', alerta: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al descartar alerta', details: error.message });
  }
};

// Resolver todas las alertas SOS pendientes de un paciente de una sola vez
export const resolveAllSosAlerts = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { motivo = 'CONTACTO_TELEFONICO', resuelta_por = 'Cuidador Familiar', notas = 'Emergencia atendida por el cuidador' } = req.body;

    const result = await pool.query(
      `UPDATE alertas_clinicas 
       SET atendida = TRUE,
           resuelta_at = NOW(),
           motivo_resolucion = $2,
           resuelta_por = $3,
           notas_resolucion = $4
       WHERE paciente_id = $1 AND tipo = 'PANIC_BUTTON' AND atendida = FALSE
       RETURNING *`,
      [patientId, motivo, resuelta_por, notas]
    );

    res.json({
      message: `${result.rowCount} alertas de auxilio SOS atendidas con éxito`,
      alertas: result.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al resolver alertas SOS', details: error.message });
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM alertas_clinicas WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
    res.json({ message: 'Alerta eliminada con éxito', alerta: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al eliminar alerta', details: error.message });
  }
};

// Resumen unificado para el Dashboard del Cuidador
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // 1. Tomás de hoy para calcular adherencia
    const tomas = await pool.query(
      `SELECT estado FROM tomas_diarias WHERE paciente_id = $1 AND fecha_toma = CURRENT_DATE`,
      [patientId]
    );
    const totalDosis = tomas.rows.length;
    const tomadas = tomas.rows.filter(t => t.estado === 'TAKEN').length;
    const adherencia = totalDosis > 0 ? Math.round((tomadas / totalDosis) * 100) : 100;

    // 2. Última presión
    const presion = await pool.query(
      `SELECT * FROM registros_presion WHERE paciente_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [patientId]
    );

    // 3. Próxima cita de EsSalud
    const cita = await pool.query(
      `SELECT * FROM citas_medicas WHERE paciente_id = $1 AND fecha_hora >= NOW() AND estado_cita = 'PROGRAMADA' ORDER BY fecha_hora ASC LIMIT 1`,
      [patientId]
    );

    // 4. Alerta SOS activa no atendida
    const alertaCritica = await pool.query(
      `SELECT * FROM alertas_clinicas WHERE paciente_id = $1 AND atendida = FALSE AND severidad = 'CRITICAL' ORDER BY created_at DESC LIMIT 1`,
      [patientId]
    );

    // 5. Stock bajo en recetas
    const stockBajo = await pool.query(
      `SELECT COUNT(*) FROM recetas WHERE paciente_id = $1 AND stock_actual <= 5`,
      [patientId]
    );

    res.json({
      adherenciaHoy: adherencia,
      dosisTomadas: tomadas,
      totalDosisHoy: totalDosis,
      ultimaPresion: presion.rows[0] || null,
      proximaCita: cita.rows[0] || null,
      alertaCriticaActiva: alertaCritica.rows[0] || null,
      recetasStockBajo: parseInt(stockBajo.rows[0].count) || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener resumen de dashboard', details: error.message });
  }
};
