import { Request, Response } from 'express';
import { pool } from '../config/db';
import { calculateScheduleTimes } from '../utils/scheduleHelper';

export const getPrescriptionsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      `SELECT * FROM recetas 
       WHERE paciente_id = $1 
       ORDER BY created_at DESC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener recetas de EsSalud', details: error.message });
  }
};

// Confirmar recojo en farmacia de EsSalud y entrada al hogar
export const confirmPharmacyPickup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE recetas 
       SET estado_dispensacion = 'EN_USO_DOMICILIO',
           fecha_dispensacion = NOW(),
           stock_actual = cantidad_recetada
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const rec = result.rows[0];

    // Asegurar que existan tomas programadas para hoy en el móvil del paciente según frecuencia
    const existing = await pool.query(
      `SELECT id FROM tomas_diarias WHERE receta_id = $1 AND fecha_toma = CURRENT_DATE`,
      [id]
    );
    if (existing.rows.length === 0) {
      let baseHour = '08:00';
      if (rec.medicamento_nombre?.toLowerCase().includes('atorvastatina')) baseHour = '20:00';
      else if (rec.medicamento_nombre?.toLowerCase().includes('vitamina d')) baseHour = '13:00';

      const times = calculateScheduleTimes(rec.frecuencia_horas, baseHour);
      for (const t of times) {
        await pool.query(
          `INSERT INTO tomas_diarias (receta_id, paciente_id, hora_programada, estado, fecha_toma)
           VALUES ($1, $2, $3, 'PENDING', CURRENT_DATE)`,
          [rec.id, rec.paciente_id, t]
        );
      }
    }

    // Registrar alerta clínica informativa
    await pool.query(
      `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
       VALUES ($1, 'PRESCRIPTION_DISPENSED', 'INFO', '🏥 Medicamento Recogido de Farmacia', $2)`,
      [rec.paciente_id, `Se confirmó el recojo de ${rec.medicamento_nombre} (${rec.dosis}) en Farmacia EsSalud. Stock cargado (${rec.cantidad_recetada || 30} comp.) e incorporado al pastillero del asegurado.`]
    );

    res.json({ message: 'Medicamento recogido de farmacia y disponible en el pastillero', receta: rec });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al confirmar recojo en farmacia', details: error.message });
  }
};

// Cuidador indica: Ya tengo este medicamento en casa
export const markHomeAvailable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock = 30 } = req.body;

    const result = await pool.query(
      `UPDATE recetas 
       SET estado_dispensacion = 'EN_USO_DOMICILIO',
           stock_actual = $1
       WHERE id = $2 
       RETURNING *`,
      [stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const rec = result.rows[0];

    // Asegurar tomas diarias para hoy según frecuencia
    const existing = await pool.query(
      `SELECT id FROM tomas_diarias WHERE receta_id = $1 AND fecha_toma = CURRENT_DATE`,
      [id]
    );
    if (existing.rows.length === 0) {
      let baseHour = '08:00';
      if (rec.medicamento_nombre?.toLowerCase().includes('atorvastatina')) baseHour = '20:00';
      else if (rec.medicamento_nombre?.toLowerCase().includes('vitamina d')) baseHour = '13:00';

      const times = calculateScheduleTimes(rec.frecuencia_horas, baseHour);
      for (const t of times) {
        await pool.query(
          `INSERT INTO tomas_diarias (receta_id, paciente_id, hora_programada, estado, fecha_toma)
           VALUES ($1, $2, $3, 'PENDING', CURRENT_DATE)`,
          [rec.id, rec.paciente_id, t]
        );
      }
    }

    await pool.query(
      `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
       VALUES ($1, 'MEDICATION_RESTOCKED', 'INFO', '🏠 Medicamento Disponible en el Hogar', $2)`,
      [rec.paciente_id, `El cuidador confirmó disponibilidad de ${rec.medicamento_nombre} (${rec.dosis}) en el domicilio. Disponible en el pastillero del asegurado.`]
    );

    res.json({ message: 'Medicamento marcado como disponible en casa', receta: rec });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al marcar disponibilidad en el hogar', details: error.message });
  }
};

// Cuidador o farmacia reporta desabastecimiento
export const reportStockout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo = 'Desabastecimiento en la farmacia del policlínico' } = req.body;

    const result = await pool.query(
      `UPDATE recetas 
       SET estado_dispensacion = 'DESABASTECIDO',
           stock_actual = 0
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const rec = result.rows[0];

    await pool.query(
      `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
       VALUES ($1, 'LOW_STOCK', 'WARNING', '⚠️ Desabastecimiento en Farmacia EsSalud', $2)`,
      [rec.paciente_id, `Se reportó desabastecimiento de ${rec.medicamento_nombre} en la farmacia de la IPRESS. Motivo: ${motivo}. Requiere coordinación con el médico tratante.`]
    );

    res.json({ message: 'Desabastecimiento reportado con éxito', receta: rec });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al reportar desabastecimiento', details: error.message });
  }
};

// Simular emisión de nueva receta electrónica desde EsSalud
export const simulatePrescriptionIssued = async (req: Request, res: Response) => {
  try {
    const {
      paciente_id,
      medicamento_nombre = 'Atorvastatina 20mg',
      dosis = '1 tableta',
      frecuencia_horas = 24,
      instrucciones = 'Tomar 1 comprimido por la noche con un vaso con agua.',
      imagen_pastilla_url = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=60',
      ipress_farmacia = 'Policlínico Chincha - Farmacia EsSalud',
      medico_prescriptor = 'Dr. Manuel Flores Barreda (Geriatría)'
    } = req.body;

    if (!paciente_id) {
      return res.status(400).json({ error: 'paciente_id es obligatorio' });
    }

    const nroReceta = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await pool.query(
      `INSERT INTO recetas (
        paciente_id, numero_receta_essalud, medico_prescriptor, ipress_farmacia,
        medicamento_nombre, dosis, frecuencia_horas, instrucciones, imagen_pastilla_url,
        cantidad_recetada, stock_actual, estado_dispensacion, vigencia_hasta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 30, 0, 'PENDIENTE_RECOJO', NOW() + INTERVAL '30 days')
      RETURNING *`,
      [
        paciente_id, nroReceta, medico_prescriptor, ipress_farmacia,
        medicamento_nombre, dosis, frecuencia_horas, instrucciones, imagen_pastilla_url
      ]
    );

    const nuevaReceta = result.rows[0];

    // Registrar alerta clínica oficial para el cuidador
    await pool.query(
      `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
       VALUES ($1, 'PRESCRIPTION_ISSUED', 'INFO', '💊 Nueva Receta Electrónica Emitida', $2)`,
      [
        paciente_id,
        `El médico tratante ${medico_prescriptor} emitió la receta electrónica ${nroReceta} de ${medicamento_nombre} (${dosis}). Disponible para recojo en ${ipress_farmacia}.`
      ]
    );

    res.status(201).json({
      message: 'Receta emitida desde el policlínico y notificada al cuidador',
      receta: nuevaReceta
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al simular emisión de receta', details: error.message });
  }
};

// Reposición o ajuste de stock en casa
export const restockMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const result = await pool.query(
      `UPDATE recetas 
       SET stock_actual = stock_actual + $1 
       WHERE id = $2 
       RETURNING *`,
      [cantidad || 30, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    res.json({ message: 'Stock actualizado con éxito', receta: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al reponer stock', details: error.message });
  }
};

// Crear nueva receta médica vinculada a EsSalud
export const createPrescription = async (req: Request, res: Response) => {
  try {
    const {
      paciente_id,
      medicamento_nombre,
      dosis,
      frecuencia_horas = 12,
      instrucciones,
      imagen_pastilla_url,
      numero_receta_essalud,
      medico_prescriptor = 'Dr. Médico Tratante EsSalud',
      ipress_farmacia = 'Policlínico Chincha - Farmacia',
      cantidad_recetada = 30,
      stock_actual = 30,
      estado_dispensacion = 'EN_USO_DOMICILIO',
      hora_programada = '08:00'
    } = req.body;

    const nroReceta = numero_receta_essalud || `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await pool.query(
      `INSERT INTO recetas (
        paciente_id, numero_receta_essalud, medico_prescriptor, ipress_farmacia,
        medicamento_nombre, dosis, frecuencia_horas, instrucciones, imagen_pastilla_url,
        cantidad_recetada, stock_actual, estado_dispensacion, vigencia_hasta
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW() + INTERVAL '30 days')
      RETURNING *`,
      [
        paciente_id, nroReceta, medico_prescriptor, ipress_farmacia,
        medicamento_nombre, dosis, frecuencia_horas, instrucciones,
        imagen_pastilla_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
        cantidad_recetada, stock_actual, estado_dispensacion
      ]
    );

    const nuevaReceta = result.rows[0];

    // Crear tomas automáticas en tomas_diarias para hoy si está en uso domiciliario según frecuencia
    if (estado_dispensacion === 'EN_USO_DOMICILIO') {
      const times = calculateScheduleTimes(frecuencia_horas, hora_programada);
      for (const t of times) {
        await pool.query(
          `INSERT INTO tomas_diarias (receta_id, paciente_id, hora_programada, estado, fecha_toma)
           VALUES ($1, $2, $3, 'PENDING', CURRENT_DATE)`,
          [nuevaReceta.id, paciente_id, t]
        );
      }
    }

    res.status(201).json(nuevaReceta);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al registrar receta', details: error.message });
  }
};

// Alternar estado activo / agotado de la receta
export const togglePrescriptionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const current = await pool.query('SELECT * FROM recetas WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Receta no encontrada' });

    const rec = current.rows[0];
    const nuevoEstado = rec.estado_dispensacion === 'AGOTADA' ? 'EN_USO_DOMICILIO' : 'AGOTADA';
    const result = await pool.query(
      `UPDATE recetas SET estado_dispensacion = $1 WHERE id = $2 RETURNING *`,
      [nuevoEstado, id]
    );

    // Si se pausa (AGOTADA), retirar tomas pendientes de hoy
    if (nuevoEstado === 'AGOTADA') {
      await pool.query(
        `DELETE FROM tomas_diarias WHERE receta_id = $1 AND fecha_toma = CURRENT_DATE AND estado = 'PENDING'`,
        [id]
      );
    } else {
      // Si se reactiva a EN_USO_DOMICILIO, generar tomas para hoy si no hay
      const existing = await pool.query(
        `SELECT id FROM tomas_diarias WHERE receta_id = $1 AND fecha_toma = CURRENT_DATE`,
        [id]
      );
      if (existing.rows.length === 0) {
        const times = calculateScheduleTimes(rec.frecuencia_horas);
        for (const t of times) {
          await pool.query(
            `INSERT INTO tomas_diarias (receta_id, paciente_id, hora_programada, estado, fecha_toma)
             VALUES ($1, $2, $3, 'PENDING', CURRENT_DATE)`,
            [rec.id, rec.paciente_id, t]
          );
        }
      }
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al alternar estado de la receta', details: error.message });
  }
};
