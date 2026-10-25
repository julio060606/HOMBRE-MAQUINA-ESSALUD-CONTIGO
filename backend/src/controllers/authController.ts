import { Request, Response } from 'express';
import { query } from '../config/db';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Debe ingresar correo y contraseña.' });
    }

    const result = await query(
      'SELECT id, nombre_completo, email, password, telefono, parentesco, codigo_cuidador FROM cuidadores WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No existe una cuenta registrada con este correo electrónico.' });
    }

    const caregiver = result.rows[0];

    // Validación de contraseña
    if (caregiver.password !== password.trim()) {
      return res.status(401).json({ error: 'Contraseña incorrecta. Por favor intente nuevamente.' });
    }

    // Retornar perfil y token de sesión
    return res.json({
      user: {
        id: caregiver.id,
        email: caregiver.email,
        name: caregiver.nombre_completo,
        role: 'CAREGIVER',
        phone: caregiver.telefono,
        relationship: caregiver.parentesco,
        codigoCuidador: caregiver.codigo_cuidador,
      },
      token: `essalud_sess_${caregiver.id}_${Date.now()}`
    });
  } catch (err: any) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno en el servidor de autenticación.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, relationship } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
    }

    // Verificar si ya existe el correo
    const existing = await query(
      'SELECT id FROM cuidadores WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con este correo.' });
    }

    // Generar código de cuidador único (CUID-XXXX)
    const randomCode = 'CUID-' + Math.floor(1000 + Math.random() * 9000);

    const insertResult = await query(
      `INSERT INTO cuidadores (nombre_completo, email, password, telefono, parentesco, codigo_cuidador)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre_completo, email, telefono, parentesco, codigo_cuidador`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        password.trim(),
        phone?.trim() || '987654321',
        relationship?.trim() || 'Familiar',
        randomCode
      ]
    );

    const newCaregiver = insertResult.rows[0];

    return res.status(201).json({
      user: {
        id: newCaregiver.id,
        email: newCaregiver.email,
        name: newCaregiver.nombre_completo,
        role: 'CAREGIVER',
        phone: newCaregiver.telefono,
        relationship: newCaregiver.parentesco,
        codigoCuidador: newCaregiver.codigo_cuidador,
      },
      token: `essalud_sess_${newCaregiver.id}_${Date.now()}`
    });
  } catch (err: any) {
    console.error('Error en register:', err);
    return res.status(500).json({ error: 'Error al registrar la cuenta en la base de datos.' });
  }
};
