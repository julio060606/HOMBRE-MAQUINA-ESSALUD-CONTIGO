export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CAREGIVER' | 'ROLE_CAREGIVER' | 'ROLE_CLINIC_ADMIN' | 'ROLE_SUPER_ADMIN';
  phone?: string;
  relationship?: string;
  codigoCuidador?: string;
  organizationId?: string;
}

export interface Patient {
  id: string;
  dni?: string;
  fullName: string;
  age: number;
  ipressEssalud?: string;
  emergencyPhone: string;
  medicalNotes?: string;
  relationship: string;
  codigoEnlaceFamiliar?: string;
  cuidadorNombre?: string;
  cuidadorTelefono?: string;
  isOnline: boolean;
  lastSyncAt: string;
  easyModeEnabled: boolean;
  voiceGuideEnabled: boolean;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  formFactor?: 'TABLET' | 'CAPSULE' | 'LIQUID' | 'DROPS' | 'INJECTION';
  imageUrl?: string;
  times?: string[];
  frequencyType?: 'DAILY' | 'INTERVAL' | 'SPECIFIC_DAYS';
  durationDays?: number;
  startDate?: string;
  specificDays?: (string | number)[];
  instructions?: string;
  isActive: boolean;
  // Campos oficiales de EsSalud Digital
  numeroRecetaEssalud?: string;
  medicoPrescriptor?: string;
  ipressFarmacia?: string;
  estadoDispensacion?: 'PENDIENTE_RECOJO' | 'DISPENSADA_EN_FARMACIA' | 'EN_USO_DOMICILIO' | 'AGOTADA' | 'DESABASTECIDO';
  currentStock?: number;
  prescribedQuantity?: number;
  frequencyHours?: number;
  expirationDate?: string;
}

export interface ClinicalSettings {
  id?: string;
  patientId: string;
  systolicMaxNormal: number;
  systolicMinNormal: number;
  diastolicMaxNormal: number;
  diastolicMinNormal: number;
  pulseMaxNormal?: number;
  pulseMinNormal?: number;
  voiceVolumeLevel?: number;
  repeatAlarmCount?: number;
  notifyOnOutOfRange: boolean;
  notifyMissedDoseMinutes: number;
  modoFacilActivo?: boolean;
  guiaVozActiva?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  specialty: string;
  doctorName: string;
  ipress: string;
  office?: string;
  dateTime: string;
  type: 'PRESENCIAL' | 'TELEMEDICINA';
  status: 'PROGRAMADA' | 'EN_ESPERA' | 'ATENDIDA' | 'CANCELADA';
  reason?: string;
}

export interface PillIntake {
  id: string;
  medicationId?: string;
  medicationName: string;
  dosage: string;
  imageUrl?: string;
  scheduledTime: string;
  scheduledDate?: string;
  takenAt?: string;
  status: 'TAKEN' | 'PENDING' | 'MISSED' | 'POSTPONED';
  instructions?: string;
  stockActual?: number;
}

export interface BloodPressureLog {
  id: string;
  patientId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  recordedAt: string;
  recordedVia: 'MANUAL_PATIENT' | 'VOICE_PATIENT' | 'CAREGIVER_WEB' | 'APP_PACIENTE';
  status: 'NORMAL' | 'HIGH' | 'CRITICAL';
  notes?: string;
}

export interface AlertEvent {
  id: string;
  patientId: string;
  patientName?: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'WARNING' | 'CRITICAL' | 'INFO';
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionReason?: string;
  resolutionNotes?: string;
}

export interface DashboardSummary {
  adherenciaHoy: number;
  dosisTomadas: number;
  totalDosisHoy: number;
  ultimaPresion: BloodPressureLog | null;
  proximaCita: Appointment | null;
  alertaCriticaActiva: AlertEvent | null;
  recetasStockBajo: number;
}
