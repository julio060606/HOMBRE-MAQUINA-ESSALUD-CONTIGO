"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const patientController_1 = require("../controllers/patientController");
const appointmentController_1 = require("../controllers/appointmentController");
const medicationController_1 = require("../controllers/medicationController");
const intakeController_1 = require("../controllers/intakeController");
const vitalsController_1 = require("../controllers/vitalsController");
const alertController_1 = require("../controllers/alertController");
const router = (0, express_1.Router)();
// 0. Autenticación Real de Cuidadores
router.post('/auth/login', authController_1.login);
router.post('/auth/register', authController_1.register);
// Pacientes y Enrolamiento Familiar sin Login
router.get('/patients', patientController_1.getPatients);
router.get('/patients/:id', patientController_1.getPatientById);
router.post('/patients/link-family-code', patientController_1.linkByFamilyCode);
router.get('/patients/:id/settings', patientController_1.getPatientSettings);
router.patch('/patients/:id/settings', patientController_1.updatePatientSettings);
// Citas Médicas Oficiales de EsSalud
router.get('/patients/:patientId/appointments', appointmentController_1.getAppointmentsByPatient);
router.post('/appointments', appointmentController_1.scheduleAppointment);
router.patch('/appointments/:id/confirm-availability', appointmentController_1.confirmDoctorAvailability);
router.patch('/appointments/:id/cancel', appointmentController_1.cancelAppointment);
// Recetas de EsSalud y Control de Farmacia
router.get('/patients/:patientId/prescriptions', medicationController_1.getPrescriptionsByPatient);
router.post('/prescriptions', medicationController_1.createPrescription);
router.post('/prescriptions/simulate-issue', medicationController_1.simulatePrescriptionIssued);
router.patch('/prescriptions/:id/toggle', medicationController_1.togglePrescriptionStatus);
router.post('/prescriptions/:id/confirm-pickup', medicationController_1.confirmPharmacyPickup);
router.post('/prescriptions/:id/mark-home-available', medicationController_1.markHomeAvailable);
router.post('/prescriptions/:id/report-stockout', medicationController_1.reportStockout);
router.post('/prescriptions/:id/restock', medicationController_1.restockMedication);
// Tomas Diarias de Medicamentos (Móvil Paciente)
router.get('/patients/:patientId/intakes/today', intakeController_1.getTodayIntakes);
router.post('/patients/:patientId/intakes/reset-today', intakeController_1.resetTodayIntakes);
router.post('/intakes/:id/confirm', intakeController_1.confirmIntake);
router.post('/intakes/:id/omit', intakeController_1.omitIntake);
// Signos Vitales y Presión Arterial
router.get('/patients/:patientId/vitals', vitalsController_1.getVitalsByPatient);
router.post('/vitals', vitalsController_1.addVitals);
// Alertas Clínicas, Botón SOS y Dashboard
router.get('/patients/:patientId/alerts', alertController_1.getAlertsByPatient);
router.post('/alerts', alertController_1.createAlert);
router.post('/alerts/sos', alertController_1.triggerSos);
router.patch('/patients/:patientId/alerts/sos/resolve-all', alertController_1.resolveAllSosAlerts);
router.patch('/alerts/:id/resolve', alertController_1.resolveAlert);
router.patch('/alerts/:id/dismiss', alertController_1.dismissAlert);
router.delete('/alerts/:id', alertController_1.deleteAlert);
router.get('/patients/:patientId/dashboard', alertController_1.getDashboardSummary);
exports.default = router;
