import { Request, Response } from 'express';
import { pool } from '../config/db';
import { calculateScheduleTimes } from '../utils/scheduleHelper';

export const getTodayIntakes = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // 1. Consultar tomas de hoy para recetas en uso domiciliario
    let result = await pool.query(
      `SELECT t.*, r.medicamento_nombre, r.dosis, r.instrucciones, r.imagen_pastilla_url, r.stock_actual
       FROM tomas_diarias t
       JOIN recetas r ON t.receta_id = r.id
       WHERE t.paciente_id = $1 AND t.fecha_toma = CURRENT_DATE AND r.estado_dispensacion = 'EN_USO_DOMICILIO'
       ORDER BY t.hora_programada ASC`,
      [patientId]
    );

    // 2. Si no hay tomas generadas para hoy, crearlas según la frecuencia de cada receta activa
    if (result.rows.length === 0) {
      const recetas = await pool.query(
        `SELECT id, frecuencia_horas, medicamento_nombre FROM recetas WHERE paciente_id = $1 AND estado_dispensacion = 'EN_USO_DOMICILIO'`,
        [patientId]
      );

      for (const rec of recetas.rows) {
        let baseHour = '08:00';
        if (rec.medicamento_nombre?.toLowerCase().includes('atorvastatina')) {
          baseHour = '20:00';
        } else if (rec.medicamento_nombre?.toLowerCase().includes('vitamina d')) {
          baseHour = '13:00';
        }

        const times = calculateScheduleTimes(rec.frecuencia_horas, baseHour);
        for (const t of times) {
          await pool.query(
            `INSERT INTO tomas_diarias (receta_id, paciente_id, hora_programada, estado, fecha_toma)
             VALUES ($1, $2, $3, 'PENDING', CURRENT_DATE)`,
            [rec.id, patientId, t]
          );
        }
      }

      result = await pool.query(
        `SELECT t.*, r.medicamento_nombre, r.dosis, r.instrucciones, r.imagen_pastilla_url, r.stock_actual
         FROM tomas_diarias t
         JOIN recetas r ON t.receta_id = r.id
         WHERE t.paciente_id = $1 AND t.fecha_toma = CURRENT_DATE AND r.estado_dispensacion = 'EN_USO_DOMICILIO'
         ORDER BY t.hora_programada ASC`,
        [patientId]
      );
    }

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener tomas de hoy', details: error.message });
  }
};

// Confirmación de toma: "YA LA TOMÉ" (64px)
export const confirmIntake = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { confirmado_por = 'MANUAL_PATIENT' } = req.body;

    await client.query('BEGIN');

    // 1. Actualizar estado de la toma
    const updateToma = await client.query(
      `UPDATE tomas_diarias 
       SET estado = 'TAKEN', tomada_at = NOW(), confirmado_por = $1
       WHERE id = $2
       RETURNING *`,
      [confirmado_por, id]
    );

    if (updateToma.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Toma no encontrada' });
    }

    const toma = updateToma.rows[0];

    // 2. Descontar 1 unidad del stock en recetas
    const updateStock = await client.query(
      `UPDATE recetas 
       SET stock_actual = GREATEST(0, stock_actual - 1)
       WHERE id = $1
       RETURNING *`,
      [toma.receta_id]
    );

    const receta = updateStock.rows[0];

    // 3. Si el stock es <= 5, generar alerta automática de reposición
    if (receta && receta.stock_actual <= 5) {
      await client.query(
        `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
         VALUES ($1, 'LOW_STOCK', 'WARNING', $2, $3)`,
        [
          toma.paciente_id,
          `Aviso de Stock Bajo: ${receta.medicamento_nombre}`,
          `Quedan solo ${receta.stock_actual} pastillas de ${receta.medicamento_nombre}. Solicitar cita de renovación en EsSalud.`
        ]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Toma confirmada exitosamente',
      toma,
      stockRestante: receta?.stock_actual ?? 0
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al confirmar la toma', details: error.message });
  } finally {
    client.release();
  }
};

// Omitir toma por falta de medicamento (Botón "No tengo esta pastilla")
export const omitIntake = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo = 'Falta de medicamento en casa' } = req.body;

    const result = await pool.query(
      `UPDATE tomas_diarias 
       SET estado = 'OMITTED', tomada_at = NOW(), confirmado_por = 'PATIENT_OMITTED'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Toma no encontrada' });
    }

    const toma = result.rows[0];

    // Consultar nombre del medicamento en recetas
    const recResult = await pool.query(`SELECT medicamento_nombre, dosis FROM recetas WHERE id = $1`, [toma.receta_id]);
    const rec = recResult.rows[0];

    // Generar alerta médica de omisión/falta de stock para el cuidador
    await pool.query(
      `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
       VALUES ($1, 'LOW_STOCK', 'WARNING', $2, $3)`,
      [
        toma.paciente_id,
        `Dosis no tomada: ${rec?.medicamento_nombre || 'Medicamento'}`,
        `El asegurado reportó no tener su dosis de ${rec?.medicamento_nombre || ''} (${rec?.dosis || ''}) programada a las ${toma.hora_programada}. Motivo: ${motivo}.`
      ]
    );

    res.json({ message: 'Toma marcada como omitida y alerta enviada al cuidador', toma });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al omitir la toma', details: error.message });
  }
};

// Restablecer todas las tomas de hoy a PENDIENTE según las recetas activas del paciente
export const resetTodayIntakes = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // 1. Limpiar tomas del día para regenerar según las recetas activas actuales
    await pool.query(
      `DELETE FROM tomas_diarias WHERE paciente_id = $1 AND fecha_toma = CURRENT_DATE`,
      [patientId]
    );

    // 2. Obtener todas las recetas activas en uso domiciliario
    const recetas = await pool.query(
      `SELECT id, frecuencia_horas, medicamento_nombre FROM recetas WHERE paciente_id = $1 AND estado_dispensacion = 'EN_USO_DOMICILIO'`,
      [patientId]
    );

    for (const rec of recetas.rows) {
      let baseHour = '08:00';
      if (rec.medicamento_nombre?.toLowerCase().includes('atorvastatina')) {
        baseHour = '20:00';
      } else if (rec.medicamento_nombre?.toLowerCase().includes('vitamina d')) {
        baseHour = '13:00';
      }

      const times = calculateScheduleTimes(rec.frecuencia_horas, baseHour);
      for (const t of times) {
        await pool.query(
          `INSERT INTO tomas_diarias (receta_id, paciente_id, hora_programada, estado, fecha_toma)
           VALUES ($1, $2, $3, 'PENDING', CURRENT_DATE)`,
          [rec.id, patientId, t]
        );
      }
    }

    // 3. Limpiar alertas de retraso de prueba de hoy
    await pool.query(
      `DELETE FROM alertas_clinicas
       WHERE paciente_id = $1 AND tipo IN ('MISSED_MEDICATION', 'LOW_STOCK') AND created_at >= CURRENT_DATE`,
      [patientId]
    );

    res.json({ message: 'Tomas de hoy regeneradas y restablecidas exitosamente a PENDING' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al restablecer tomas de hoy', details: error.message });
  }
};
