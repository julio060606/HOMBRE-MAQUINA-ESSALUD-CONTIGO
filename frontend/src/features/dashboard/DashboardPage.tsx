import React, { useEffect, useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useToast } from '../../context/ToastContext';
import { medicationService, vitalsService, alertService, appointmentService, syncEvents } from '../../services/apiClient';
import { PillIntake, BloodPressureLog, AlertEvent, Appointment } from '../../types';
import { PillThumbnail } from '../../components/common/PillThumbnail';
import { 
  Heart, 
  Pill, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  Calendar,
  Smartphone,
  FileText,
  Stethoscope,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { activePatient } = usePatient();
  const toast = useToast();
  const [intakes, setIntakes] = useState<PillIntake[]>([]);
  const [latestVitals, setLatestVitals] = useState<BloodPressureLog | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [upcomingAppt, setUpcomingAppt] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para modal rápido de medición de presión
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [systolicInput, setSystolicInput] = useState(120);
  const [diastolicInput, setDiastolicInput] = useState(80);
  const [pulseInput, setPulseInput] = useState(72);
  const [vitalsNotes, setVitalsNotes] = useState('');
  const [isSubmittingVitals, setIsSubmittingVitals] = useState(false);

  // Estado para gestión y resolución de alertas / SOS
  const [selectedAlertForResolution, setSelectedAlertForResolution] = useState<AlertEvent | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionReason, setResolutionReason] = useState('CONTACTO_TELEFONICO');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [alertsTab, setAlertsTab] = useState<'PENDING' | 'RESOLVED'>('PENDING');

  const handleConfirmResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertForResolution) return;
    setIsSubmittingResolution(true);
    try {
      const reasonLabel = 
        resolutionReason === 'CONTACTO_TELEFONICO' ? 'Contacto Telefónico Exitoso' :
        resolutionReason === 'VISITA_DOMICILIARIA' ? 'Visita Presencial Domiciliaria' :
        resolutionReason === 'SAMU_COORDINADO' ? 'SAMU 106 / IPRESS Coordinado' : 'Falsa Alarma / Pulsación Accidental';

      if (selectedAlertForResolution.type === 'PANIC_BUTTON' || selectedAlertForResolution.title.includes('SOS')) {
        await alertService.resolveAllSosAlerts(activePatient!.id, {
          motivo: resolutionReason,
          resueltaPor: 'Cuidador Familiar',
          notas: resolutionNotes || `Atención confirmada: ${reasonLabel}`
        });
      } else {
        await alertService.resolveAlert(selectedAlertForResolution.id, {
          motivo: resolutionReason,
          resueltaPor: 'Cuidador Familiar',
          notas: resolutionNotes || `Atención confirmada: ${reasonLabel}`
        });
      }

      toast.success(
        '✅ Emergencia / Alerta Atendida',
        `Se registró la atención de la alerta (${reasonLabel}) en la auditoría clínica.`
      );
      setIsResolveModalOpen(false);
      setSelectedAlertForResolution(null);
      setResolutionNotes('');
      loadDashboardData();
    } catch (err: any) {
      toast.error('Error al atender alerta', err.message);
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const handleQuickDismiss = async (alertId: string) => {
    if (!window.confirm('¿Desea descartar esta alerta como falsa alarma?')) return;
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (alert && (alert.type === 'PANIC_BUTTON' || alert.title.includes('SOS'))) {
        await alertService.resolveAllSosAlerts(activePatient!.id, {
          motivo: 'FALSA_ALARMA',
          resueltaPor: 'Cuidador Familiar',
          notas: 'Descartada por el cuidador'
        });
      } else {
        await alertService.dismissAlert(alertId, 'FALSA_ALARMA', 'Descartada por el cuidador');
      }
      toast.info('Alerta Descartada', 'La alerta ha sido cerrada como falsa alarma.');
      loadDashboardData();
    } catch (err: any) {
      toast.error('Error al descartar', err.message);
    }
  };

  const handleQuickAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setIsSubmittingVitals(true);
    try {
      await vitalsService.addBloodPressureLog({
        patientId: activePatient.id,
        systolic: systolicInput,
        diastolic: diastolicInput,
        pulse: pulseInput,
        recordedAt: new Date().toISOString(),
        recordedVia: 'PORTAL_CUIDADOR',
        notes: vitalsNotes || 'Registro rápido desde Dashboard'
      });
      toast.success(
        '🩺 Presión Arterial Registrada',
        `Se guardó la lectura ${systolicInput}/${diastolicInput} mmHg para ${activePatient.fullName}.`
      );
      setIsVitalsModalOpen(false);
      setVitalsNotes('');
      loadDashboardData();
    } catch (err: any) {
      toast.error('Error al registrar presión', err.message);
    } finally {
      setIsSubmittingVitals(false);
    }
  };

  const loadDashboardData = () => {
    if (!activePatient) return;
    Promise.all([
      medicationService.getTodayIntakes(activePatient.id),
      vitalsService.getBloodPressureLogs(activePatient.id),
      alertService.getRecentAlerts(activePatient.id),
      appointmentService.getAppointments(activePatient.id)
    ]).then(([intakesData, vitalsData, alertsData, apptsData]) => {
      setIntakes(intakesData);
      setLatestVitals(vitalsData[0] || null);
      setAlerts(alertsData);
      const next = apptsData.find(a => a.status === 'PROGRAMADA') || apptsData[0] || null;
      setUpcomingAppt(next);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadDashboardData();
    const unsub = syncEvents.subscribe(() => {
      loadDashboardData();
    });

    // Heartbeat de sincronización periódica en vivo (cada 3.5 segundos) con Supabase
    const interval = setInterval(loadDashboardData, 3500);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [activePatient]);

  if (!activePatient) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-10 p-8">
        <div className="w-14 h-14 bg-blue-50 text-[#005CA9] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="font-heading font-bold text-slate-900 text-lg">No hay asegurado seleccionado</h3>
        <p className="text-slate-500 font-light text-sm mt-1.5 leading-relaxed">
          Selecciona o vincula un asegurado desde la barra superior para acceder al panel de teleasistencia de EsSalud.
        </p>
      </div>
    );
  }

  const takenCount = intakes.filter(i => i.status === 'TAKEN').length;
  const adherencePercent = intakes.length > 0 ? Math.round((takenCount / intakes.length) * 100) : 100;

  const pendingAlerts = alerts.filter(a => !a.isResolved);
  const resolvedAlerts = alerts.filter(a => a.isResolved);
  const activeSosAlert = pendingAlerts.find(a => a.severity === 'CRITICAL' && (a.type === 'PANIC_BUTTON' || a.title.includes('SOS')));
  const hasCriticalSosAlert = !!activeSosAlert;

  return (
    <div className="space-y-6 font-sans antialiased pb-12">
      
      {/* Alerta Crítica SOS Si Existe */}
      {hasCriticalSosAlert && activeSosAlert && (
        <div className="bg-rose-50 border-2 border-rose-500 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-rose-950 shadow-lg animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-heading font-black uppercase tracking-wider">
                  EMERGENCIA ACTIVA
                </span>
                <span className="text-[11px] text-rose-700 font-medium">
                  {new Date(activeSosAlert.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h4 className="font-heading font-bold text-base text-rose-950 mt-0.5">
                ¡BOTÓN SOS ACTIVADO POR {activePatient.fullName.toUpperCase()}!
              </h4>
              <p className="text-xs text-rose-800 font-light mt-0.5">
                El paciente ha solicitado auxilio inmediato desde el móvil. Llame de inmediato o confirme la atención.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <a 
              href={`tel:${activePatient.emergencyPhone}`} 
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-heading font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              📞 Llamar al {activePatient.emergencyPhone}
            </a>
            <button
              onClick={() => {
                setSelectedAlertForResolution(activeSosAlert);
                setResolutionReason('CONTACTO_TELEFONICO');
                setResolutionNotes('');
                setIsResolveModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-heading font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Atender Emergencia</span>
            </button>
            <button
              onClick={() => handleQuickDismiss(activeSosAlert.id)}
              className="px-3.5 py-2.5 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-heading font-semibold transition-colors"
              title="Descartar como pulsación accidental"
            >
              ✕ Falsa Alarma
            </button>
          </div>
        </div>
      )}

      {/* Banner Principal: EsSalud Azul & Blanco */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-blue-50/50 rounded-3xl p-6 sm:p-8 border border-blue-200/70 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#005CA9] text-xs font-heading font-bold border border-blue-200/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#005CA9] animate-pulse"></span>
                <span>EsSalud Contigo • Monitoreo Activo</span>
              </span>
              <span className="text-xs text-slate-400 font-light">
                IPRESS: {activePatient.ipressEssalud || 'Policlínico Chincha'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Asegurado: <span className="text-[#005CA9]">{activePatient.fullName}</span>
            </h1>

            <p className="text-sm text-slate-600 font-light max-w-2xl leading-relaxed">
              {activePatient.medicalNotes || 'Seguimiento de adherencia farmacológica en el hogar y signos vitales sincronizados.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
            <button
              onClick={() => setIsVitalsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100/80 text-rose-700 text-xs font-heading font-semibold uppercase tracking-wider px-4 py-3 rounded-2xl border border-rose-200 shadow-xs transition-all"
            >
              <Activity className="w-4 h-4 text-rose-600" />
              <span>+ Medir Presión</span>
            </button>

            <Link
              to="/medications"
              data-testid="btn-add-med-quick"
              className="inline-flex items-center gap-2 bg-[#005CA9] hover:bg-[#004884] text-white text-xs font-heading font-semibold uppercase tracking-wider px-5 py-3 rounded-2xl shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Receta</span>
            </Link>

            <Link
              to="/appointments"
              className="inline-flex items-center gap-2 bg-white hover:bg-blue-50/70 text-[#005CA9] text-xs font-heading font-semibold uppercase tracking-wider px-4 py-3 rounded-2xl border border-blue-200 shadow-xs transition-all"
            >
              <Calendar className="w-4 h-4 text-[#005CA9]" />
              <span>Ver Citas EsSalud</span>
            </Link>
          </div>

        </div>

        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-100/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid de Métricas Principales (EsSalud Blue & White) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Adherencia Farmacológica */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider">
                Adherencia de Hoy
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#005CA9] flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 tracking-tight">
                {adherencePercent}%
              </span>
              <span className="text-xs text-[#005CA9] font-bold">
                {adherencePercent >= 80 ? 'Óptima' : 'En seguimiento'}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-light mt-1">
              {takenCount} de {intakes.length} tomas registradas
            </p>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full mt-5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-[#005CA9] h-full rounded-full transition-all duration-500"
              style={{ width: `${adherencePercent}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Última Presión Arterial */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider">
                Presión Arterial
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 tracking-tight">
                {latestVitals ? `${latestVitals.systolic}/${latestVitals.diastolic}` : '--/--'}
              </span>
              <span className="text-xs font-light text-slate-400">mmHg</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#005CA9] font-heading font-bold mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#005CA9]" />
              <span>Rango Clínico Estable</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-light mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setIsVitalsModalOpen(true)}
              className="text-xs font-heading font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+ Registrar</span>
            </button>
            <Link to="/vitals" className="text-[#005CA9] font-semibold hover:underline">Historial →</Link>
          </div>
        </div>

        {/* KPI 3: Próxima Cita Oficial EsSalud */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider">
                Próxima Cita
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#005CA9] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {upcomingAppt ? (
              <>
                <div className="text-base font-heading font-bold text-slate-900 truncate">
                  {upcomingAppt.specialty}
                </div>
                <div className="text-xs text-slate-600 truncate mt-0.5">
                  {upcomingAppt.doctorName}
                </div>
                <div className="text-xs text-[#005CA9] font-semibold mt-1">
                  {new Date(upcomingAppt.dateTime).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400">Sin citas pendientes</div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-light mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>EsSalud MiConsulta</span>
            <Link to="/appointments" className="text-[#005CA9] font-semibold hover:underline">Gestionar</Link>
          </div>
        </div>

        {/* KPI 4: Conexión Móvil del Paciente */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider">
                Móvil del Asegurado
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#005CA9] flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#005CA9] animate-pulse"></span>
              <span className="text-lg font-heading font-bold text-slate-900 tracking-tight">
                Conectado
              </span>
            </div>

            <p className="text-xs text-slate-500 font-light mt-1.5">
              Código: <strong className="font-mono text-[#005CA9]">{activePatient.codigoEnlaceFamiliar || 'FAM-8492'}</strong>
            </p>
          </div>

          <div className="text-[11px] text-slate-400 font-light mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Zero-Login Activo</span>
            <a
              href="/modo-senior"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#005CA9] font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
              title="Abrir App del Adulto Mayor en nueva pestaña"
            >
              <span>Abrir App ↗</span>
            </a>
          </div>
        </div>

      </div>

      {/* Grid Central: Timeline de Tomas vs Alertas Clínicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda (2/3): Timeline de Tomas de Hoy */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                Cronograma de Tomas de Hoy
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Seguimiento en tiempo real de comprimidos y recetas pautadas
              </p>
            </div>

            <Link 
              to="/medications" 
              className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-[#005CA9] hover:text-[#004884] bg-blue-50/80 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              <span>Pastillero EsSalud</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {intakes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No hay tomas programadas para hoy en la base de datos de EsSalud.
              </div>
            ) : (
              intakes.map(intake => (
                <div 
                  key={intake.id}
                  data-testid={`card-intake-${intake.id}`}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    intake.status === 'TAKEN' 
                      ? 'bg-blue-50/30 border-blue-200/60' 
                      : 'bg-white border-slate-200/80 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <PillThumbnail name={intake.medicationName} imageUrl={intake.imageUrl} size="sm" />
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-slate-900">
                          {intake.medicationName}
                        </span>
                        <span className="text-[11px] font-heading font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {intake.dosage}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 font-light mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#005CA9]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {intake.scheduledTime}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="truncate max-w-xs">{intake.instructions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center">
                    {intake.status === 'TAKEN' ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-heading font-bold border border-emerald-300 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tomada</span>
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          await medicationService.confirmIntake(intake.id, 'MANUAL_PATIENT');
                          toast.success('Dosis Confirmada', `Se marcó ${intake.medicationName} (${intake.dosage}) como tomada.`);
                        }}
                        data-testid={`btn-mark-taken-${intake.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#005CA9] text-xs font-heading font-bold border border-blue-200 shadow-2xs transition-all active:scale-95"
                        title="Confirmar toma de este medicamento"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#005CA9]" />
                        <span>Marcar Tomada</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Columna Derecha (1/3): Alertas Clínicas */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                  Alertas y Telemetría
                </h3>
                <p className="text-xs text-slate-400 font-light mt-0.5">
                  Avisos médicos automáticos
                </p>
              </div>
              <span className="text-[10px] font-heading font-bold bg-blue-50 text-[#005CA9] px-2.5 py-1 rounded-full uppercase tracking-wider">
                En vivo
              </span>
            </div>

            {/* Pestañas Pendientes / Historial */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl mb-4 text-xs font-heading font-semibold">
              <button
                onClick={() => setAlertsTab('PENDING')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                  alertsTab === 'PENDING'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pendientes ({pendingAlerts.length})
              </button>
              <button
                onClick={() => setAlertsTab('RESOLVED')}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                  alertsTab === 'RESOLVED'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Historial ({resolvedAlerts.length})
              </button>
            </div>

            <div className="space-y-3">
              {alertsTab === 'PENDING' ? (
                pendingAlerts.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-medium">
                      No hay alertas pendientes de atención.
                    </p>
                    <p className="text-[11px] text-slate-400 font-light mt-0.5">
                      Todo el seguimiento clínico se encuentra al día.
                    </p>
                  </div>
                ) : (
                  pendingAlerts.map(alert => {
                    const isCritical = alert.severity === 'CRITICAL';
                    const isWarning = alert.severity === 'WARNING';

                    return (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-2xl border-l-4 shadow-2xs transition-all ${
                          isCritical
                            ? 'bg-rose-50/70 border-rose-600 border-t border-r border-b border-rose-200/70'
                            : isWarning
                            ? 'bg-amber-50/60 border-amber-500 border-t border-r border-b border-amber-200/60'
                            : 'bg-blue-50/60 border-[#005CA9] border-t border-r border-b border-blue-200/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-heading font-bold text-xs truncate">
                            <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-[#005CA9]'
                            }`} />
                            <span className={isCritical ? 'text-rose-950' : isWarning ? 'text-amber-950' : 'text-blue-950'}>
                              {alert.title}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            isCritical ? 'bg-rose-100 text-rose-800' : isWarning ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-light mt-1.5 leading-relaxed">
                          {alert.description}
                        </p>

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200/50">
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(alert.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} • {new Date(alert.timestamp).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAlertForResolution(alert);
                                setResolutionReason('CONTACTO_TELEFONICO');
                                setResolutionNotes('');
                                setIsResolveModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-[11px] font-heading font-semibold border border-slate-200 shadow-2xs transition-colors flex items-center gap-1"
                              title="Registrar atención clínica de esta alerta"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Atender</span>
                            </button>
                            <button
                              onClick={() => handleQuickDismiss(alert.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Descartar alerta"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                resolvedAlerts.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 font-light">
                      No hay historial de alertas atendidas aún.
                    </p>
                  </div>
                ) : (
                  resolvedAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading font-bold text-slate-800 truncate text-xs">
                          {alert.title}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-heading font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Atendida</span>
                        </span>
                      </div>
                      <p className="text-slate-600 font-light text-[11px] line-clamp-2">
                        {alert.description}
                      </p>
                      {alert.resolutionReason && (
                        <div className="text-[10px] text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200/60 font-medium">
                          Motivo: {alert.resolutionReason.replace(/_/g, ' ')}
                          {alert.resolutionNotes ? ` • "${alert.resolutionNotes}"` : ''}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-light">
                        Registrada: {new Date(alert.timestamp).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/settings"
              className="w-full py-3 px-4 bg-slate-50 hover:bg-blue-50 text-[#005CA9] text-xs font-heading font-bold tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <span>Ajustar Umbrales Clínicos</span>
              <ChevronRight className="w-4 h-4 text-[#005CA9]" />
            </Link>
          </div>

        </div>

      </div>

      {/* MODAL RÁPIDO DE REGISTRO DE PRESIÓN ARTERIAL (Zero Mocks) */}
      {isVitalsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">Registrar Presión Arterial</h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">
                    Paciente: {activePatient.fullName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsVitalsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddVitals} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sistólica (mmHg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="70"
                    max="240"
                    value={systolicInput}
                    onChange={e => setSystolicInput(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-heading font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Normal: ~120</span>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Diastólica (mmHg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="40"
                    max="150"
                    value={diastolicInput}
                    onChange={e => setDiastolicInput(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-heading font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none transition-all"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Normal: ~80</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pulso Cardíaco (bpm)
                </label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={pulseInput}
                  onChange={e => setPulseInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-heading font-bold text-slate-900 bg-white focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">En reposo: 60 - 90 bpm</span>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  value={vitalsNotes}
                  onChange={e => setVitalsNotes(e.target.value)}
                  placeholder="Ej: Medición matutina con tensiómetro de brazo"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-heading font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVitals}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-heading font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>{isSubmittingVitals ? 'Guardando...' : 'Guardar Medición'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ATENCIÓN Y RESOLUCIÓN DE ALERTAS / SOS */}
      {isResolveModalOpen && selectedAlertForResolution && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  selectedAlertForResolution.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-[#005CA9]'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Registro de Atención Médica / Familiar
                  </h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">
                    Paciente: {activePatient.fullName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setIsResolveModalOpen(false); setSelectedAlertForResolution(null); }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info de la alerta */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 mb-5">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-slate-800">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{selectedAlertForResolution.title}</span>
              </div>
              <p className="text-xs text-slate-600 font-light mt-1">
                {selectedAlertForResolution.description}
              </p>
            </div>

            <form onSubmit={handleConfirmResolution} className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Acción / Motivo de Atención Efectuada *
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'CONTACTO_TELEFONICO', title: '📞 Contacto Telefónico Exitoso', desc: 'Se habló directamente con el paciente, se encuentra lúcido y estable.' },
                    { id: 'VISITA_DOMICILIARIA', title: '🏠 Visita Presencial Domiciliaria', desc: 'Cuidador o familiar acudió al domicilio y asistió presencialmente al asegurado.' },
                    { id: 'SAMU_COORDINADO', title: '🚑 SAMU 106 / IPRESS Coordinado', desc: 'Se solicitó asistencia médica de urgencia o traslado hospitalario.' },
                    { id: 'FALSA_ALARMA', title: '⚠️ Falsa Alarma / Pulsación Accidental', desc: 'El asegurado pulsó el botón por error o no requiere intervención clínica.' }
                  ].map(option => (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        resolutionReason === option.id
                          ? 'border-[#005CA9] bg-blue-50/50 ring-1 ring-[#005CA9]/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolutionReason"
                        value={option.id}
                        checked={resolutionReason === option.id}
                        onChange={() => setResolutionReason(option.id)}
                        className="mt-1 text-[#005CA9] focus:ring-[#005CA9]"
                      />
                      <div>
                        <span className="block text-xs font-heading font-bold text-slate-900">{option.title}</span>
                        <span className="block text-[11px] text-slate-500 font-light mt-0.5">{option.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observaciones Clínicas / Notas de Seguimiento
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Detalles sobre el estado del paciente o medidas tomadas..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none transition-all placeholder:text-slate-400 font-light"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsResolveModalOpen(false); setSelectedAlertForResolution(null); }}
                  className="w-1/2 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-heading font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolution}
                  className="w-1/2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingResolution ? 'Guardando...' : 'Confirmar Atención'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
