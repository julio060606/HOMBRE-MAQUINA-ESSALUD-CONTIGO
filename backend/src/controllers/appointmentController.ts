import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getAppointmentsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      `SELECT * FROM citas_medicas 
       WHERE paciente_id = $1 
       ORDER BY fecha_hora ASC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener citas médicas', details: error.message });
  }
};

export const scheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { 
      paciente_id, 
      especialidad, 
      medico_nombre, 
      ipress, 
      consultorio, 
      fecha_hora, 
      tipo_cita, 
      estado_cita = 'PROGRAMADA',
      motivo 
    } = req.body;

    if (!paciente_id || !especialidad || !fecha_hora) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para agendar la cita' });
    }

    const estadoFinal = estado_cita || 'PROGRAMADA';

    const result = await pool.query(
      `INSERT INTO citas_medicas 
       (paciente_id, especialidad, medico_nombre, ipress, consultorio, fecha_hora, tipo_cita, estado_cita, motivo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        paciente_id,
        especialidad,
        medico_nombre || (estadoFinal === 'EN_ESPERA' ? 'Por Asignar (EsSalud)' : 'Médico de Turno EsSalud'),
        ipress || 'Policlínico Chincha - EsSalud',
        consultorio || (estadoFinal === 'EN_ESPERA' ? 'Consultorio Pendiente' : 'Consultorio General'),
        fecha_hora,
        tipo_cita || 'PRESENCIAL',
        estadoFinal,
        motivo || 'Control médico'
      ]
    );

    const nuevaCita = result.rows[0];

    // Si entra como solicitud en espera, emitir alerta informativa
    if (estadoFinal === 'EN_ESPERA') {
      await pool.query(
        `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
         VALUES ($1, 'APPOINTMENT_REQUESTED', 'INFO', '📋 Solicitud de Cita Enviada a EsSalud', $2)`,
        [paciente_id, `Se envió solicitud de cita para la especialidad de ${especialidad}. En espera de confirmación de cupo y médico por la IPRESS.`]
      );
    }

    res.status(201).json(nuevaCita);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al agendar la cita médica', details: error.message });
  }
};

// Confirmar disponibilidad de médico de EsSalud para una cita en espera
export const confirmDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      medico_nombre = 'Dr. Manuel Flores Barreda (Geriatra)', 
      consultorio = 'Consultorio 204 (2do Piso)',
      fecha_hora
    } = req.body;

    // Buscar la cita actual
    const citaActual = await pool.query('SELECT * FROM citas_medicas WHERE id = $1', [id]);
    if (citaActual.rows.length === 0) {
      return res.status(404).json({ error: 'Cita médica no encontrada' });
    }

    const fechaFinal = fecha_hora || citaActual.rows[0].fecha_hora;

    const result = await pool.query(
      `UPDATE citas_medicas 
       SET estado_cita = 'PROGRAMADA',
           medico_nombre = $1,
           consultorio = $2,
           fecha_hora = $3
       WHERE id = $4
       RETURNING *`,
      [medico_nombre, consultorio, fechaFinal, id]
    );

    const citaConfirmada = result.rows[0];

    // Emitir alerta clínica de cita confirmada
    const fechaTexto = new Date(citaConfirmada.fecha_hora).toLocaleDateString('es-PE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    await pool.query(
      `INSERT INTO alertas_clinicas (paciente_id, tipo, severidad, titulo, descripcion)
       VALUES ($1, 'APPOINTMENT_CONFIRMED', 'INFO', '✅ Cita Médica Confirmada por EsSalud', $2)`,
      [
        citaConfirmada.paciente_id,
        `EsSalud confirmó su cita de ${citaConfirmada.especialidad} para el ${fechaTexto} con el ${citaConfirmada.medico_nombre} (${citaConfirmada.consultorio}). Sincronizada con el móvil del paciente.`
      ]
    );

    res.json({
      message: 'Cita confirmada y sincronizada con el asegurado',
      cita: citaConfirmada
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al confirmar disponibilidad médica', details: error.message });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE citas_medicas 
       SET estado_cita = 'CANCELADA' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita médica no encontrada' });
    }

    res.json({ message: 'Cita médica cancelada con éxito', cita: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al cancelar la cita', details: error.message });
  }
};
