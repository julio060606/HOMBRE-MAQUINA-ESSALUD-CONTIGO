import { ENV } from '../config/env';
import { 
  User, 
  Patient, 
  Medication, 
  PillIntake, 
  BloodPressureLog, 
  AlertEvent, 
  Appointment, 
  DashboardSummary, 
  ClinicalSettings 
} from '../types';

type SyncListener = () => void;
const syncListeners = new Set<SyncListener>();

// Canal nativo del navegador para sincronización en tiempo real entre pestañas (Caregiver Web ↔ Senior App)
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('essalud_contigo_realtime_sync')
  : null;

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    // Cuando otra pestaña emite un cambio (ej: el anciano tomó una pastilla o disparó SOS)
    syncListeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('Error en listener de sincronización cross-tab:', e);
      }
    });
  };
}

export const syncEvents = {
  subscribe(fn: SyncListener) {
    syncListeners.add(fn);
    return () => {
      syncListeners.delete(fn);
    };
  },
  emit(payload?: any) {
    // 1. Notificar a la pestaña actual
    syncListeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('Error en listener local de sincronización:', e);
      }
    });

    // 2. Transmitir inmediatamente a todas las demás pestañas abiertas en tiempo real
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload || { type: 'SYNC_EVENT', timestamp: Date.now() });
      } catch (e) {
        console.error('Error al emitir en BroadcastChannel:', e);
      }
    }
  }
};

export const resetDemoData = async () => {
  syncEvents.emit();
};

/* ============================================================================
 * 1. SERVICIO DE AUTENTICACIÓN REAL (POST /api/v1/auth/...)
 * ============================================================================ */
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${ENV.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Credenciales incorrectas. Verifique correo y contraseña.');
    }
    return data;
  },

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${ENV.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar la cuenta en EsSalud Contigo.');
    }
    return data;
  }
};

/* ============================================================================
 * 2. SERVICIO DE PACIENTES Y ENLACE FAMILIAR (Zero Mocks)
 * ============================================================================ */
export const patientService = {
  async getPatients(): Promise<Patient[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudo conectar con el servidor de pacientes.`);
    }
    const data = await res.json();
    return data.map((p: any) => ({
      id: p.id,
      dni: p.dni,
      fullName: p.nombre_completo,
      age: p.edad,
      ipressEssalud: p.ipress_essalud,
      emergencyPhone: p.telefono_emergencia,
      relationship: p.parentesco || 'Familiar',
      codigoEnlaceFamiliar: p.codigo_enlace_familiar,
      cuidadorNombre: p.cuidador_nombre,
      cuidadorTelefono: p.cuidador_telefono,
      isOnline: true,
      lastSyncAt: p.created_at,
      easyModeEnabled: p.modo_facil_activo ?? true,
      voiceGuideEnabled: p.guia_voz_activa ?? true,
    }));
  },

  async getPatientById(id: string): Promise<Patient> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${id}`);
    if (!res.ok) {
      throw new Error(`No se encontró el paciente con ID ${id}`);
    }
    const p = await res.json();
    return {
      id: p.id,
      dni: p.dni,
      fullName: p.nombre_completo,
      age: p.edad,
      ipressEssalud: p.ipress_essalud,
      emergencyPhone: p.telefono_emergencia,
      relationship: p.parentesco || 'Familiar',
      codigoEnlaceFamiliar: p.codigo_enlace_familiar,
      cuidadorNombre: p.cuidador_nombre,
      cuidadorTelefono: p.cuidador_telefono,
      isOnline: true,
      lastSyncAt: p.created_at,
      easyModeEnabled: p.modo_facil_activo ?? true,
      voiceGuideEnabled: p.guia_voz_activa ?? true,
    };
  },

  async linkPatientByFamilyCode(codigo: string): Promise<{ patient: Patient; token: string }> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/link-family-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: codigo.trim() })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Código familiar no encontrado en la base de datos.');
    }

    syncEvents.emit({ type: 'PATIENT_LINKED', patientId: data.patient.id });

    return {
      patient: {
        id: data.patient.id,
        dni: data.patient.dni,
        fullName: data.patient.nombre_completo,
        age: data.patient.edad,
        ipressEssalud: data.patient.ipress_essalud,
        emergencyPhone: data.patient.telefono_emergencia,
        relationship: data.patient.parentesco || 'Familiar',
        codigoEnlaceFamiliar: data.patient.codigo_enlace_familiar,
        cuidadorNombre: data.patient.cuidador_nombre,
        cuidadorTelefono: data.patient.cuidador_telefono,
        isOnline: true,
        lastSyncAt: new Date().toISOString(),
        easyModeEnabled: true,
        voiceGuideEnabled: true,
      },
      token: data.tokenPermanente
    };
  },

  async linkPatientByPin(pin: string): Promise<Patient> {
    const res = await this.linkPatientByFamilyCode(pin);
    return res.patient;
  }
};

/* ============================================================================
 * 3. SERVICIO DE CITAS MÉDICAS OFICIALES ESSALUD (Zero Mocks)
 * ============================================================================ */
export const appointmentService = {
  async getAppointments(patientId: string): Promise<Appointment[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/appointments`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: Fallo al consultar citas en EsSalud.`);
    }
    const data = await res.json();
    return data.map((c: any) => ({
      id: c.id,
      patientId: c.paciente_id,
      specialty: c.especialidad,
      doctorName: c.medico_nombre,
      ipress: c.ipress,
      office: c.consultorio,
      dateTime: c.fecha_hora,
      type: c.tipo_cita,
      status: c.estado_cita,
      reason: c.motivo,
    }));
  },

  async scheduleAppointment(appointment: Omit<Appointment, 'id'> & { status?: 'PROGRAMADA' | 'EN_ESPERA' }): Promise<Appointment> {
    const res = await fetch(`${ENV.API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: appointment.patientId,
        especialidad: appointment.specialty,
        medico_nombre: appointment.doctorName,
        ipress: appointment.ipress,
        consultorio: appointment.office,
        fecha_hora: appointment.dateTime,
        tipo_cita: appointment.type,
        estado_cita: appointment.status || 'PROGRAMADA',
        motivo: appointment.reason
      })
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al agendar la cita médica.');
    }
    syncEvents.emit({ type: 'APPOINTMENT_SCHEDULED' });
    return data;
  },

  async confirmDoctorAvailability(id: string, details?: { doctorName?: string; office?: string; dateTime?: string }): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/appointments/${id}/confirm-availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medico_nombre: details?.doctorName,
        consultorio: details?.office,
        fecha_hora: details?.dateTime
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al confirmar disponibilidad médica.');
    }
    syncEvents.emit({ type: 'APPOINTMENT_SCHEDULED' });
    return data;
  },

  async cancelAppointment(id: string): Promise<void> {
    const res = await fetch(`${ENV.API_BASE_URL}/appointments/${id}/cancel`, { method: 'PATCH' });
    if (!res.ok) {
      throw new Error('Error al cancelar la cita en EsSalud.');
    }
    syncEvents.emit({ type: 'APPOINTMENT_CANCELLED' });
  }
};

/* ============================================================================
 * 4. SERVICIO DE RECETAS, FARMACIA Y TOMAS (Zero Mocks)
 * ============================================================================ */
export const medicationService = {
  async getMedications(patientId: string): Promise<Medication[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/prescriptions`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudieron obtener las recetas.`);
    }
    const data = await res.json();
    return data.map((r: any) => {
      const freq = Number(r.frecuencia_horas) || 24;
      let times = ['08:00'];
      if (freq <= 6) times = ['06:00', '12:00', '18:00', '23:00'];
      else if (freq <= 8) times = ['08:00', '14:00', '20:00'];
      else if (freq <= 12) times = ['08:00', '20:00'];
      else {
        if (r.medicamento_nombre?.toLowerCase().includes('atorvastatina')) times = ['20:00'];
        else if (r.medicamento_nombre?.toLowerCase().includes('vitamina d')) times = ['13:00'];
        else times = ['08:00'];
      }

      return {
        id: r.id,
        patientId: r.paciente_id,
        name: r.medicamento_nombre,
        dosage: r.dosis,
        instructions: r.instrucciones,
        imageUrl: r.imagen_pastilla_url,
        numeroRecetaEssalud: r.numero_receta_essalud,
        medicoPrescriptor: r.medico_prescriptor,
        ipressFarmacia: r.ipress_farmacia,
        estadoDispensacion: r.estado_dispensacion,
        currentStock: r.stock_actual,
        prescribedQuantity: r.cantidad_recetada,
        frequencyHours: freq,
        expirationDate: r.vigencia_hasta,
        isActive: r.estado_dispensacion !== 'AGOTADA',
        times,
        durationDays: 30,
        frequencyType: 'DAILY',
      };
    });
  },

  async saveMedication(med: {
    patientId: string;
    name: string;
    dosage: string;
    frequencyHours?: number;
    formFactor?: string;
    imageUrl?: string;
    times?: string[];
    frequencyType?: string;
    durationDays?: number;
    startDate?: string;
    instructions?: string;
    isActive?: boolean;
    ipressFarmacia?: string;
  }): Promise<Medication> {
    const res = await fetch(`${ENV.API_BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: med.patientId,
        medicamento_nombre: med.name,
        dosis: med.dosage,
        frecuencia_horas: med.frequencyHours || 24,
        instrucciones: med.instructions,
        imagen_pastilla_url: med.imageUrl,
        hora_programada: med.times?.[0] || '08:00',
        ipress_farmacia: med.ipressFarmacia || 'Policlínico Chincha - Farmacia',
        estado_dispensacion: 'EN_USO_DOMICILIO',
        cantidad_recetada: 30,
        stock_actual: 30
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar receta médica.');
    }
    syncEvents.emit({ type: 'MEDICATION_ADDED' });
    return {
      id: data.id,
      patientId: data.paciente_id,
      name: data.medicamento_nombre,
      dosage: data.dosis,
      instructions: data.instrucciones,
      imageUrl: data.imagen_pastilla_url,
      numeroRecetaEssalud: data.numero_receta_essalud,
      medicoPrescriptor: data.medico_prescriptor,
      ipressFarmacia: data.ipress_farmacia,
      estadoDispensacion: data.estado_dispensacion,
      currentStock: data.stock_actual,
      prescribedQuantity: data.cantidad_recetada,
      expirationDate: data.vigencia_hasta,
      isActive: true,
      times: med.times || ['08:00'],
      durationDays: med.durationDays || 30,
      frequencyType: 'DAILY'
    };
  },

  async toggleMedicationStatus(id: string): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/prescriptions/${id}/toggle`, { method: 'PATCH' });
    const data = await res.json();
    syncEvents.emit({ type: 'MEDICATION_TOGGLED' });
    return data;
  },

  async getTodayIntakes(patientId: string): Promise<PillIntake[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/intakes/today`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: Fallo al obtener tomas de hoy.`);
    }
    const data = await res.json();
    return data.map((t: any) => ({
      id: t.id,
      medicationId: t.receta_id,
      medicationName: t.medicamento_nombre,
      dosage: t.dosis,
      imageUrl: t.imagen_pastilla_url,
      scheduledTime: t.hora_programada?.slice(0, 5) || '08:00',
      scheduledDate: t.fecha_toma,
      takenAt: t.tomada_at,
      status: t.estado,
      instructions: t.instrucciones,
      stockActual: t.stock_actual
    }));
  },

  async confirmIntake(intakeId: string, confirmedVia: 'MANUAL_PATIENT' | 'VOICE_PATIENT' = 'MANUAL_PATIENT'): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/intakes/${intakeId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmado_por: confirmedVia })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al confirmar la toma de medicamento.');
    }
    syncEvents.emit({ type: 'INTAKE_CONFIRMED', intakeId });
    return data;
  },

  async omitIntake(intakeId: string, reason = 'Falta de medicamento en casa'): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/intakes/${intakeId}/omit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: reason })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al marcar la toma como omitida.');
    }
    syncEvents.emit({ type: 'INTAKE_OMITTED', intakeId });
    return data;
  },

  async confirmPickup(recetaId: string): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/prescriptions/${recetaId}/confirm-pickup`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al confirmar recojo en farmacia.');
    }
    syncEvents.emit({ type: 'PICKUP_CONFIRMED', recetaId });
    return data;
  },

  async markHomeAvailable(recetaId: string, stock = 30): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/prescriptions/${recetaId}/mark-home-available`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al indicar medicamento en casa.');
    }
    syncEvents.emit({ type: 'PICKUP_CONFIRMED', recetaId });
    return data;
  },

  async reportStockout(recetaId: string, motivo = 'Desabastecimiento en farmacia'): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/prescriptions/${recetaId}/report-stockout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al reportar desabastecimiento.');
    }
    syncEvents.emit({ type: 'MEDICATION_TOGGLED', recetaId });
    return data;
  },

  async simulatePrescriptionIssued(patientId: string, medData?: {
    name?: string;
    dosage?: string;
    frequencyHours?: number;
    instructions?: string;
    imageUrl?: string;
    doctor?: string;
    pharmacy?: string;
  }): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/prescriptions/simulate-issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: patientId,
        medicamento_nombre: medData?.name,
        dosis: medData?.dosage,
        frecuencia_horas: medData?.frequencyHours,
        instrucciones: medData?.instructions,
        imagen_pastilla_url: medData?.imageUrl,
        medico_prescriptor: medData?.doctor,
        ipress_farmacia: medData?.pharmacy
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al emitir prescripción médica.');
    }
    syncEvents.emit({ type: 'MEDICATION_ADDED' });
    return data;
  },

  async restock(recetaId: string, cantidad = 30): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/prescriptions/${recetaId}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al reponer stock de pastillas.');
    }
    syncEvents.emit({ type: 'RESTOCKED', recetaId });
    return data;
  },

  async resetTodayIntakes(patientId: string): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/intakes/reset-today`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al reiniciar tomas.');
    }
    syncEvents.emit({ type: 'INTAKES_RESET', patientId });
    return data;
  }
};

/* ============================================================================
 * 5. SIGNOS VITALES Y PRESIÓN ARTERIAL (Zero Mocks)
 * ============================================================================ */
export const vitalsService = {
  async getBloodPressureLogs(patientId: string): Promise<BloodPressureLog[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/vitals`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: Fallo al consultar registros de presión arterial.`);
    }
    const data = await res.json();
    return data.map((v: any) => ({
      id: v.id,
      patientId: v.paciente_id,
      systolic: v.sistolica,
      diastolic: v.diastolica,
      pulse: v.pulso,
      recordedAt: v.created_at,
      recordedVia: v.registrado_via,
      status: v.estado_clinico,
      notes: v.notas
    }));
  },

  async addBloodPressureLog(log: { 
    patientId: string; 
    systolic: number; 
    diastolic: number; 
    pulse?: number; 
    notes?: string; 
    recordedVia?: string; 
    recordedAt?: string 
  }): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: log.patientId,
        sistolica: log.systolic,
        diastolica: log.diastolic,
        pulso: log.pulse,
        notas: log.notes,
        registrado_via: log.recordedVia || 'APP_PACIENTE'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar presión arterial.');
    }
    syncEvents.emit({ type: 'VITALS_ADDED' });
    return data;
  }
};

/* ============================================================================
 * 6. ALERTAS CLÍNICAS, SOS Y RESUMEN DASHBOARD (Zero Mocks)
 * ============================================================================ */
export const alertService = {
  async getRecentAlerts(patientId: string): Promise<AlertEvent[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/alerts`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudieron cargar las alertas clínicas.`);
    }
    const data = await res.json();
    return data.map((a: any) => ({
      id: a.id,
      patientId: a.paciente_id,
      type: a.tipo,
      severity: a.severidad,
      title: a.titulo,
      description: a.descripcion,
      timestamp: a.created_at,
      isResolved: a.atendida,
      resolvedAt: a.resuelta_at,
      resolvedBy: a.resuelta_por,
      resolutionReason: a.motivo_resolucion,
      resolutionNotes: a.notas_resolucion
    }));
  },

  async triggerSosAlert(patientId: string, notes?: string): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/alerts/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paciente_id: patientId, notas: notes })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al enviar alerta SOS.');
    }
    syncEvents.emit({ type: 'SOS_TRIGGERED', patientId });
    return data;
  },

  async createClinicalAlert(alert: { 
    patientId: string; 
    title: string; 
    description: string; 
    severity?: 'INFO' | 'WARNING' | 'CRITICAL'; 
    type?: string 
  }): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: alert.patientId,
        titulo: alert.title,
        descripcion: alert.description,
        severidad: alert.severity || 'WARNING',
        tipo: alert.type || 'MISSED_MEDICATION'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al registrar alerta clínica.');
    }
    syncEvents.emit({ type: 'ALERT_CREATED', patientId: alert.patientId });
    return data;
  },

  async resolveAlert(alertId: string, details?: { motivo?: string; resueltaPor?: string; notas?: string }): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/alerts/${alertId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        motivo: details?.motivo || 'ATENDIDA_POR_CUIDADOR',
        resuelta_por: details?.resueltaPor || 'Cuidador Familiar',
        notas: details?.notas || ''
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al marcar alerta como atendida.');
    }
    syncEvents.emit({ type: 'ALERT_RESOLVED', alertId });
    return data;
  },

  async dismissAlert(alertId: string, motivo = 'FALSA_ALARMA', notas = 'Descartada por el cuidador'): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/alerts/${alertId}/dismiss`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo, notas })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al descartar alerta.');
    }
    syncEvents.emit({ type: 'ALERT_RESOLVED', alertId });
    return data;
  },

  async deleteAlert(alertId: string): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/alerts/${alertId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al eliminar alerta.');
    }
    syncEvents.emit({ type: 'ALERT_RESOLVED', alertId });
    return data;
  },

  async resolveAllSosAlerts(patientId: string, details?: { motivo?: string; resueltaPor?: string; notas?: string }): Promise<any> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/alerts/sos/resolve-all`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        motivo: details?.motivo || 'CONTACTO_TELEFONICO',
        resuelta_por: details?.resueltaPor || 'Cuidador Familiar',
        notas: details?.notas || 'Emergencia atendida por el cuidador'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al resolver las alertas de auxilio SOS.');
    }
    syncEvents.emit({ type: 'ALERT_RESOLVED' });
    return data;
  },

  async getDashboardSummary(patientId: string): Promise<DashboardSummary | null> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/dashboard`);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: Fallo al consultar resumen del dashboard.`);
    }
    const data = await res.json();
    return {
      adherenciaHoy: data.adherenciaHoy,
      dosisTomadas: data.dosisTomadas,
      totalDosisHoy: data.totalDosisHoy,
      ultimaPresion: data.ultimaPresion ? {
        id: data.ultimaPresion.id,
        patientId: data.ultimaPresion.paciente_id,
        systolic: data.ultimaPresion.sistolica,
        diastolic: data.ultimaPresion.diastolica,
        pulse: data.ultimaPresion.pulso,
        recordedAt: data.ultimaPresion.created_at,
        recordedVia: data.ultimaPresion.registrado_via,
        status: data.ultimaPresion.estado_clinico,
        notes: data.ultimaPresion.notas
      } : null,
      proximaCita: data.proximaCita ? {
        id: data.proximaCita.id,
        patientId: data.proximaCita.paciente_id,
        specialty: data.proximaCita.especialidad,
        doctorName: data.proximaCita.medico_nombre,
        ipress: data.proximaCita.ipress,
        office: data.proximaCita.consultorio,
        dateTime: data.proximaCita.fecha_hora,
        type: data.proximaCita.tipo_cita,
        status: data.proximaCita.estado_cita,
        reason: data.proximaCita.motivo
      } : null,
      alertaCriticaActiva: data.alertaCriticaActiva ? {
        id: data.alertaCriticaActiva.id,
        patientId: data.alertaCriticaActiva.paciente_id,
        type: data.alertaCriticaActiva.tipo,
        severity: data.alertaCriticaActiva.severidad,
        title: data.alertaCriticaActiva.titulo,
        description: data.alertaCriticaActiva.descripcion,
        timestamp: data.alertaCriticaActiva.created_at,
        isResolved: data.alertaCriticaActiva.atendida
      } : null,
      recetasStockBajo: data.recetasStockBajo
    };
  }
};

/* ============================================================================
 * 7. AJUSTES CLÍNICOS Y CONTROL REMOTO (Zero Mocks - Supabase PostgreSQL)
 * ============================================================================ */
export const settingsService = {
  async getSettings(patientId: string): Promise<ClinicalSettings> {
    try {
      const res = await fetch(`${ENV.API_BASE_URL}/patients/${patientId}/settings`);
      if (res.ok) {
        const data = await res.json();
        return {
          patientId: data.patientId,
          systolicMaxNormal: Number(data.systolicMaxNormal) || 140,
          systolicMinNormal: Number(data.systolicMinNormal) || 90,
          diastolicMaxNormal: Number(data.diastolicMaxNormal) || 90,
          diastolicMinNormal: Number(data.diastolicMinNormal) || 60,
          notifyOnOutOfRange: data.notifyOnOutOfRange ?? true,
          notifyMissedDoseMinutes: Number(data.notifyMissedDoseMinutes) || 30,
          modoFacilActivo: data.modoFacilActivo ?? true,
          guiaVozActiva: data.guiaVozActiva ?? true
        };
      }
    } catch (e) {
      console.warn('Fallo al obtener ajustes del backend, usando defaults:', e);
    }

    return {
      patientId,
      systolicMaxNormal: 140,
      systolicMinNormal: 90,
      diastolicMaxNormal: 90,
      diastolicMinNormal: 60,
      notifyOnOutOfRange: true,
      notifyMissedDoseMinutes: 30,
      modoFacilActivo: true,
      guiaVozActiva: true
    };
  },

  async updateSettings(settings: ClinicalSettings): Promise<ClinicalSettings> {
    const res = await fetch(`${ENV.API_BASE_URL}/patients/${settings.patientId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systolicMaxNormal: settings.systolicMaxNormal,
        systolicMinNormal: settings.systolicMinNormal,
        diastolicMaxNormal: settings.diastolicMaxNormal,
        diastolicMinNormal: settings.diastolicMinNormal,
        notifyOnOutOfRange: settings.notifyOnOutOfRange,
        notifyMissedDoseMinutes: settings.notifyMissedDoseMinutes,
        modoFacilActivo: settings.modoFacilActivo,
        guiaVozActiva: settings.guiaVozActiva
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al guardar los ajustes en el servidor.');
    }

    const data = await res.json();
    syncEvents.emit({ type: 'SETTINGS_UPDATED', patientId: settings.patientId, settings });
    return data.settings || settings;
  }
};
