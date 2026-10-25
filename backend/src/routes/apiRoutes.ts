import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { getPatients, getPatientById, linkByFamilyCode, getPatientSettings, updatePatientSettings } from '../controllers/patientController';
import { getAppointmentsByPatient, scheduleAppointment, cancelAppointment, confirmDoctorAvailability } from '../controllers/appointmentController';
import { 
  getPrescriptionsByPatient, 
  confirmPharmacyPickup, 
  restockMedication,
  createPrescription,
  togglePrescriptionStatus,
  markHomeAvailable,
  reportStockout,
  simulatePrescriptionIssued
} from '../controllers/medicationController';
import { getTodayIntakes, confirmIntake, omitIntake, resetTodayIntakes } from '../controllers/intakeController';
import { getVitalsByPatient, addVitals } from '../controllers/vitalsController';
import { getAlertsByPatient, triggerSos, resolveAlert, dismissAlert, deleteAlert, resolveAllSosAlerts, getDashboardSummary, createAlert } from '../controllers/alertController';

const router = Router();

// 0. Autenticación Real de Cuidadores
router.post('/auth/login', login);
router.post('/auth/register', register);

// Pacientes y Enrolamiento Familiar sin Login
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientById);
router.post('/patients/link-family-code', linkByFamilyCode);
router.get('/patients/:id/settings', getPatientSettings);
router.patch('/patients/:id/settings', updatePatientSettings);

// Citas Médicas Oficiales de EsSalud
router.get('/patients/:patientId/appointments', getAppointmentsByPatient);
router.post('/appointments', scheduleAppointment);
router.patch('/appointments/:id/confirm-availability', confirmDoctorAvailability);
router.patch('/appointments/:id/cancel', cancelAppointment);

// Recetas de EsSalud y Control de Farmacia
router.get('/patients/:patientId/prescriptions', getPrescriptionsByPatient);
router.post('/prescriptions', createPrescription);
router.post('/prescriptions/simulate-issue', simulatePrescriptionIssued);
router.patch('/prescriptions/:id/toggle', togglePrescriptionStatus);
router.post('/prescriptions/:id/confirm-pickup', confirmPharmacyPickup);
router.post('/prescriptions/:id/mark-home-available', markHomeAvailable);
router.post('/prescriptions/:id/report-stockout', reportStockout);
router.post('/prescriptions/:id/restock', restockMedication);

// Tomas Diarias de Medicamentos (Móvil Paciente)
router.get('/patients/:patientId/intakes/today', getTodayIntakes);
router.post('/patients/:patientId/intakes/reset-today', resetTodayIntakes);
router.post('/intakes/:id/confirm', confirmIntake);
router.post('/intakes/:id/omit', omitIntake);

// Signos Vitales y Presión Arterial
router.get('/patients/:patientId/vitals', getVitalsByPatient);
router.post('/vitals', addVitals);

// Alertas Clínicas, Botón SOS y Dashboard
router.get('/patients/:patientId/alerts', getAlertsByPatient);
router.post('/alerts', createAlert);
router.post('/alerts/sos', triggerSos);
router.patch('/patients/:patientId/alerts/sos/resolve-all', resolveAllSosAlerts);
router.patch('/alerts/:id/resolve', resolveAlert);
router.patch('/alerts/:id/dismiss', dismissAlert);
router.delete('/alerts/:id', deleteAlert);
router.get('/patients/:patientId/dashboard', getDashboardSummary);

export default router;
