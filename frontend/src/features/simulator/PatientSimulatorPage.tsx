import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useToast } from '../../context/ToastContext';
import { 
  patientService, 
  medicationService, 
  alertService, 
  appointmentService, 
  vitalsService, 
  settingsService, 
  syncEvents 
} from '../../services/apiClient';
import { speechService, soundEffects } from '../../services/speechService';
import { Patient, PillIntake, Appointment, ClinicalSettings } from '../../types';
import { Link } from 'react-router-dom';
import { EsSaludLogo } from '../../components/common/EsSaludLogo';
import { PillThumbnail } from '../../components/common/PillThumbnail';
import { 
  Volume2, 
  CheckCircle, 
  PhoneCall, 
  Wifi, 
  BatteryMedium, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  KeyRound, 
  RotateCcw, 
  AlertTriangle, 
  AlertOctagon, 
  Lock, 
  X, 
  FastForward,
  Activity,
  Heart,
  Sun,
  Moon,
  Sunrise,
  ExternalLink
} from 'lucide-react';

export const PatientSimulatorPage: React.FC = () => {
  const { activePatient, setActivePatient } = usePatient();
  const toast = useToast();
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(activePatient);
  const [intakes, setIntakes] = useState<PillIntake[]>([]);
  const [upcomingAppt, setUpcomingAppt] = useState<Appointment | null>(null);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);
  const [isSosSent, setIsSosSent] = useState(false);

  // Modal de Código Familiar
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Configuración Clínica y de Accesibilidad Sincronizada con el Cuidador
  const [clinicalSettings, setClinicalSettings] = useState<ClinicalSettings | null>(null);

  // Índice de la pastilla activa dentro del turno (Paso a Paso con Foto Grande)
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Estado de Recepción Bluetooth de Tensiómetro Físico Externo
  const [bluetoothSyncNotice, setBluetoothSyncNotice] = useState<{ systolic: number; diastolic: number; pulse: number } | null>(null);
  const [isMeasuringVitals, setIsMeasuringVitals] = useState(false);

  // ============================================================================
  // SIMULADOR DE RELOJ Y CONTROL DE TIEMPO PARA PRUEBAS (TESTING FAST-FORWARD)
  // ============================================================================
  const [isSimulatedTime, setIsSimulatedTime] = useState(false);
  const [simulatedTimeStr, setSimulatedTimeStr] = useState('08:05'); // 'HH:mm'
  const [realTime, setRealTime] = useState(new Date());

  // Actualizar hora real cada segundo si no está en modo simulado
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Cargar paciente inicial mediante código guardado en localStorage o fallback
  useEffect(() => {
    const savedCode = localStorage.getItem('essalud_senior_family_code') || 'FAM-8492';
    if (!currentPatient) {
      patientService.linkPatientByFamilyCode(savedCode)
        .then(({ patient }) => {
          setCurrentPatient(patient);
          setActivePatient(patient);
        })
        .catch(() => {
          patientService.getPatients().then(pats => {
            if (pats.length > 0) {
              setCurrentPatient(pats[0]);
              setActivePatient(pats[0]);
            }
          });
        });
    } else {
      setCurrentPatient(activePatient);
    }
  }, [activePatient]);

  // 2. Función de recarga de datos médicos en vivo
  const loadData = (patientId?: string) => {
    const id = patientId || currentPatient?.id;
    if (!id) return;
    
    medicationService.getTodayIntakes(id)
      .then(setIntakes)
      .catch(err => console.error('Error al cargar tomas:', err));

    appointmentService.getAppointments(id)
      .then(appts => {
        const nextAppt = appts.find(a => a.status === 'PROGRAMADA') || appts[0] || null;
        setUpcomingAppt(nextAppt);
      })
      .catch(err => console.error('Error al cargar citas:', err));

    settingsService.getSettings(id)
      .then(setClinicalSettings)
      .catch(err => console.error('Error al cargar ajustes clínicos:', err));
  };

  // 3. Sincronización en Tiempo Real (BroadcastChannel + Heartbeat cada 3s)
  useEffect(() => {
    if (!currentPatient) return;
    loadData(currentPatient.id);

    const unsub = syncEvents.subscribe(() => {
      loadData(currentPatient.id);
    });

    const interval = setInterval(() => {
      loadData(currentPatient.id);
    }, 3500);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [currentPatient?.id]);

  // Manejador para conectar por Código
  const handleConnectByCode = async (codeToUse?: string) => {
    const code = (codeToUse || codeInputValue).trim();
    if (!code) return;
    setIsLinking(true);
    setLinkError(null);

    try {
      const { patient } = await patientService.linkPatientByFamilyCode(code);
      setCurrentPatient(patient);
      setActivePatient(patient);
      localStorage.setItem('essalud_senior_family_code', code);
      setIsCodeModalOpen(false);
      setCodeInputValue('');
      toast.success('Dispositivo Conectado', `Se vinculó con éxito a ${patient.fullName}.`);
      loadData(patient.id);
      speakText(`Bienvenido Don ${patient.fullName.split(' ')[0]}. Tu teléfono está conectado con tu familia.`);
    } catch (err: any) {
      setLinkError(err.message || 'Código familiar no encontrado.');
    } finally {
      setIsLinking(false);
    }
  };

  const speakText = (text: string, playChime = false) => {
    // Respetar ajuste remoto de Guía de Voz configurado por el cuidador en Ajustes
    const isVoiceActive = clinicalSettings?.guiaVozActiva ?? currentPatient?.voiceGuideEnabled ?? true;
    if (!isVoiceActive) {
      console.log('🔇 Guía de voz silenciada según configuración del cuidador:', text);
      return;
    }
    speechService.speak(text, { playChimeBefore: playChime });
  };

  // ============================================================================
  // CÁLCULO CLÍNICO DE TOLERANCIA DE TIEMPO (+- 20 min) Y ESTADOS CROMÁTICOS
  // ============================================================================
  // Hora efectiva que se muestra en el teléfono y con la que se calcula
  const effectiveHours = isSimulatedTime 
    ? parseInt(simulatedTimeStr.split(':')[0], 10) 
    : realTime.getHours();
  const effectiveMinutes = isSimulatedTime 
    ? parseInt(simulatedTimeStr.split(':')[1], 10) 
    : realTime.getMinutes();
  const currentTotalMinutes = effectiveHours * 60 + effectiveMinutes;
  const displayTimeFormatted = `${String(effectiveHours).padStart(2, '0')}:${String(effectiveMinutes).padStart(2, '0')}`;

  // Helper para asignar nombres de rutina según la hora del día (Heurística #2: Coincidencia con el mundo real)
  const getRoutineTimeLabel = (timeStr?: string) => {
    if (!timeStr) return 'Dosis Programada';
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour < 11) return `🌅 Desayuno / Mañana (${timeStr})`;
    if (hour < 16) return `☀️ Almuerzo / Tarde (${timeStr})`;
    return `🌙 Cena / Noche (${timeStr})`;
  };

  // 1. Filtrar tomas pendientes
  const pendingIntakes = intakes.filter(i => i.status === 'PENDING');
  const allTaken = intakes.length > 0 && pendingIntakes.length === 0;

  // Horarios únicos del día para la navegación de turnos (Desayuno, Almuerzo, Cena, etc.)
  const uniqueTimes = Array.from(new Set(intakes.map(i => i.scheduledTime))).sort();

  // 2. Horario del próximo turno pendiente (ej. 08:00)
  const nextSlotTime = pendingIntakes[0]?.scheduledTime || intakes[0]?.scheduledTime || '08:00';

  // 3. Medicamentos de ese mismo turno (soporte de polifarmacia: paso a paso guiado con foto grande)
  const currentSlotIntakes = pendingIntakes.filter(i => i.scheduledTime === nextSlotTime);
  const activeDisplayIntakes = currentSlotIntakes.length > 0 ? currentSlotIntakes : [intakes[0]];
  const leadIntake = activeDisplayIntakes[0];

  // Índice seguro de la pastilla activa en el paso a paso
  const validStepIndex = activeStepIndex < currentSlotIntakes.length ? activeStepIndex : 0;
  const currentMedicine = currentSlotIntakes[validStepIndex] || leadIntake;
  const isLastPillInSlot = currentSlotIntakes.length > 1 ? validStepIndex === currentSlotIntakes.length - 1 : true;

  // 4. Siguiente turno después del actual (para anticipar en pantalla)
  const subsequentIntake = pendingIntakes.find(i => i.scheduledTime !== nextSlotTime);

  // Calcular diferencia de minutos con el horario programado del turno actual
  let timeDifferenceMinutes = 0;
  let timeState: 'ON_TIME' | 'EARLY' | 'LATE_WARNING' | 'CRITICAL_DELAY' | 'TAKEN' = 'ON_TIME';

  if (allTaken) {
    timeState = 'TAKEN';
  } else if (leadIntake) {
    const [schedH, schedM] = (leadIntake.scheduledTime || '08:00').split(':').map(Number);
    const scheduledTotalMinutes = (schedH || 8) * 60 + (schedM || 0);
    timeDifferenceMinutes = currentTotalMinutes - scheduledTotalMinutes;

    const missedTolerance = clinicalSettings?.notifyMissedDoseMinutes || 30;

    if (timeDifferenceMinutes < -20) {
      timeState = 'EARLY';
    } else if (timeDifferenceMinutes >= -20 && timeDifferenceMinutes <= 20) {
      timeState = 'ON_TIME';
    } else if (timeDifferenceMinutes > 20 && timeDifferenceMinutes <= missedTolerance) {
      timeState = 'LATE_WARNING';
    } else {
      timeState = 'CRITICAL_DELAY';
    }
  }

  // Helper para simular minutos relativos al horario programado de la dosis activa
  const setSimulatedRelativeToActive = (offsetMinutes: number) => {
    const [schedH, schedM] = (leadIntake?.scheduledTime || '08:00').split(':').map(Number);
    let totalMin = (schedH || 8) * 60 + (schedM || 0) + offsetMinutes;
    if (totalMin < 0) totalMin += 24 * 60;
    if (totalMin >= 24 * 60) totalMin -= 24 * 60;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setIsSimulatedTime(true);
    setSimulatedTimeStr(timeStr);
  };

  // Estilos visuales según el estado de tiempo del pastillero
  const boxStyles = {
    TAKEN: {
      border: 'border-emerald-300 bg-emerald-50/70',
      badgeBg: 'bg-emerald-100 text-[#007A2E]',
      badgeText: '✓ Dosis Tomada',
      msgColor: 'text-[#007A2E]',
      bannerText: '¡Completada a tiempo!',
      buttonEnabled: false,
    },
    ON_TIME: {
      border: 'border-[#009B3A] bg-emerald-50/40 shadow-sm',
      badgeBg: 'bg-emerald-100 text-[#007A2E] border border-emerald-300',
      badgeText: '● En Horario Ideal (±20 min)',
      msgColor: 'text-emerald-800',
      bannerText: `Es tu momento de tomar. Confirma tu pastilla de ${getRoutineTimeLabel(leadIntake?.scheduledTime).split('(')[0].trim()}.`,
      buttonEnabled: true,
    },
    EARLY: {
      border: 'border-amber-300 bg-amber-50/50',
      badgeBg: 'bg-amber-100 text-amber-900 border border-amber-300',
      badgeText: `⏰ Faltan ${Math.abs(timeDifferenceMinutes)} minutos`,
      msgColor: 'text-amber-900',
      bannerText: `Aún no es hora. Te toca en el ${getRoutineTimeLabel(leadIntake?.scheduledTime)}. Espera unos minutos.`,
      buttonEnabled: false,
    },
    LATE_WARNING: {
      border: 'border-orange-400 bg-orange-50/50',
      badgeBg: 'bg-orange-100 text-orange-950 border border-orange-300 font-bold',
      badgeText: `⚠️ Retraso de ${timeDifferenceMinutes} min`,
      msgColor: 'text-orange-900',
      bannerText: `Llevas ${timeDifferenceMinutes} min de retraso. Tómala de inmediato para no perder la dosis.`,
      buttonEnabled: true,
    },
    CRITICAL_DELAY: {
      border: 'border-rose-500 bg-rose-50/60 shadow-md',
      badgeBg: 'bg-rose-100 text-rose-950 border border-rose-300 font-bold animate-pulse',
      badgeText: `🚨 Retraso Crítico (> ${clinicalSettings?.notifyMissedDoseMinutes || 30} min)`,
      msgColor: 'text-rose-900',
      bannerText: `Retraso de más de ${clinicalSettings?.notifyMissedDoseMinutes || 30} min. Se generó reporte automático al teléfono de tu cuidador.`,
      buttonEnabled: true,
    }
  }[timeState];

  // Acción al confirmar la toma de la pastilla activa (Paso a Paso con Foto Grande)
  const handleTakeStepMedicine = async () => {
    if (!currentPatient || !currentMedicine) return;

    if (timeState === 'EARLY') {
      soundEffects.playConfirmationChime();
      speakText(
        `Aún es temprano, Don ${currentPatient.fullName.split(' ')[0]}. Tu pastilla te toca en el ${getRoutineTimeLabel(leadIntake?.scheduledTime)}. Por favor espera y no te adelantes.`
      );
      toast.warning(
        'Bloqueo de Seguridad',
        `No se puede marcar la dosis aún. Faltan ${Math.abs(timeDifferenceMinutes)} min para la hora programada (${leadIntake?.scheduledTime}).`
      );
      return;
    }

    setIsSuccessAnimated(true);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(120); } catch (e) {}
    }

    if (timeState === 'CRITICAL_DELAY' || timeState === 'LATE_WARNING') {
      await alertService.createClinicalAlert({
        patientId: currentPatient.id,
        title: `Toma con retraso: ${currentMedicine.medicationName}`,
        description: `${currentPatient.fullName} confirmó su dosis (${currentMedicine.medicationName}) con retraso de ${timeDifferenceMinutes} minutos (Hora programada: ${leadIntake?.scheduledTime}).`,
        severity: timeState === 'CRITICAL_DELAY' ? 'CRITICAL' : 'WARNING',
        type: 'MISSED_MEDICATION'
      });
      speakText(
        `Dosis registrada, Don ${currentPatient.fullName.split(' ')[0]}. Se avisó a tu familiar sobre el retraso.`,
        true
      );
    } else {
      if (currentSlotIntakes.length > 1 && !isLastPillInSlot) {
        const nextPill = currentSlotIntakes[validStepIndex + 1];
        speakText(
          `¡Muy bien, Don ${currentPatient.fullName.split(' ')[0]}! Has tomado ${currentMedicine.medicationName}. Ahora toca la pastilla ${validStepIndex + 2} de ${currentSlotIntakes.length}: ${nextPill?.medicationName} de ${nextPill?.dosage}.`,
          true
        );
      } else {
        speakText(
          `¡Muy bien, Don ${currentPatient.fullName.split(' ')[0]}! Tu toma de ${currentMedicine.medicationName} ha sido confirmada a tu familiar.`,
          true
        );
      }
    }

    // Confirmar en la base de datos la toma actual
    await medicationService.confirmIntake(currentMedicine.id, 'MANUAL_PATIENT');

    toast.success(
      '📱 Pastilla Confirmada',
      currentSlotIntakes.length > 1
        ? `${currentPatient.fullName} confirmó pastilla ${validStepIndex + 1} de ${currentSlotIntakes.length} (${currentMedicine.medicationName}).`
        : `${currentPatient.fullName} confirmó la toma de ${currentMedicine.medicationName}.`
    );

    // Si aún quedan más pastillas en este mismo horario, avanzar al siguiente paso
    if (!isLastPillInSlot) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      setActiveStepIndex(0);
    }

    await loadData(currentPatient.id);

    setTimeout(() => {
      setIsSuccessAnimated(false);
    }, 2000);
  };

  // Omitir pastilla por falta de medicamento en casa (Botón "No tengo esta pastilla")
  const handleSkipMedicine = async () => {
    if (!currentPatient || !currentMedicine) return;

    try {
      await medicationService.omitIntake(currentMedicine.id, 'Asegurado reportó no tener el medicamento en casa');
      soundEffects.playConfirmationChime();

      speakText(
        `Entendido, Don ${currentPatient.fullName.split(' ')[0]}. Avisando a tu familiar que te falta ${currentMedicine.medicationName} para que te consiga más.`,
        true
      );

      toast.warning(
        'Aviso de Falta de Medicamento',
        `Se notificó a tu familiar que no tienes ${currentMedicine.medicationName} (${currentMedicine.dosage}).`
      );

      if (!isLastPillInSlot) {
        setActiveStepIndex(prev => prev + 1);
      } else {
        setActiveStepIndex(0);
      }

      await loadData(currentPatient.id);
    } catch (err: any) {
      toast.error('Error al omitir pastilla', err.message);
    }
  };

  // Restablecer tomas a pendiente (para probar el testeo tantas veces como se quiera en base de datos real)
  const handleResetIntakesForTesting = async () => {
    if (!currentPatient) return;
    try {
      toast.info('Restableciendo Tomas', 'Actualizando base de datos para volver tomas a estado pendiente...');
      setActiveStepIndex(0);
      await medicationService.resetTodayIntakes(currentPatient.id);
      await loadData(currentPatient.id);
      toast.success('Tomas Restablecidas', 'Las pastillas de hoy han vuelto a estado pendiente en PostgreSQL.');
    } catch (err: any) {
      toast.error('Error al restablecer tomas', err.message || 'No se pudo conectar a la base de datos.');
    }
  };

  // Recepción de Lectura por Bluetooth BLE desde Tensiómetro Físico de Brazo (Omron / EsSalud)
  const handleRecordVitalsFromMobile = async (systolic = 120, diastolic = 80, pulse = 72, notes = 'Tensiómetro Digital EsSalud sincronizado vía Bluetooth') => {
    if (!currentPatient) return;
    setIsMeasuringVitals(true);
    try {
      await vitalsService.addBloodPressureLog({
        patientId: currentPatient.id,
        systolic,
        diastolic,
        pulse,
        recordedAt: new Date().toISOString(),
        recordedVia: 'APP_PACIENTE',
        notes
      });
      soundEffects.playConfirmationChime();
      setBluetoothSyncNotice({ systolic, diastolic, pulse });
      speakText(`Tensiómetro sincronizado. Presión de ${systolic} sobre ${diastolic} enviada a tu familiar.`);
      toast.success(
        '📡 Tensiómetro Bluetooth Sincronizado',
        `Lectura de ${systolic}/${diastolic} mmHg (Pulso: ${pulse} bpm) recibida y transmitida a tu cuidador.`
      );
      setTimeout(() => {
        setBluetoothSyncNotice(null);
        setIsMeasuringVitals(false);
      }, 4500);
    } catch (err: any) {
      toast.error('Error al sincronizar tensiómetro', err.message);
      setIsMeasuringVitals(false);
    }
  };

  const handleSos = async () => {
    if (!currentPatient) return;
    setIsSosSent(true);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate([250, 100, 250, 100, 400]); } catch (e) {}
    }
    soundEffects.playSosAlertSound();

    setTimeout(() => {
      speakText(`Alerta de auxilio activada. Avisando de inmediato a tu familiar.`);
    }, 600);
    
    await alertService.triggerSosAlert(currentPatient.id, 'Alerta disparada desde el botón de pánico SOS del móvil.');
    
    toast.error(
      '🚨 ALERTA SOS RECIBIDA',
      `${currentPatient.fullName} ha presionado el botón de auxilio inmediato SOS.`
    );

    setTimeout(() => {
      setIsSosSent(false);
    }, 4000);
  };

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white font-sans">
        <EsSaludLogo variant="full" className="h-12 mb-6" />
        <div className="bg-slate-800 p-6 rounded-3xl max-w-sm w-full border border-slate-700 text-center">
          <KeyRound className="w-12 h-12 text-[#005CA9] mx-auto mb-3" />
          <h2 className="text-lg font-heading font-bold mb-1">Conectar Modo Senior</h2>
          <p className="text-xs text-slate-400 mb-4 font-light">
            Ingresa el código familiar del cuidador para acceder sin contraseñas:
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={codeInputValue}
              onChange={e => setCodeInputValue(e.target.value)}
              placeholder="Ej: FAM-8492"
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-center text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-[#005CA9]"
            />
            <button
              onClick={() => handleConnectByCode()}
              disabled={isLinking}
              className="bg-[#005CA9] hover:bg-[#004885] px-4 py-2 rounded-xl text-xs font-heading font-bold"
            >
              {isLinking ? '...' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row items-center lg:items-center justify-center gap-6 p-3 sm:p-6 font-sans antialiased select-none">
      
      {/* ==================================================================== */}
      {/* PANEL DE CONTROL CLÍNICO Y TIEMPO (LATERAL IZQUIERDA EN DESKTOP)     */}
      {/* ==================================================================== */}
      <div className="w-full max-w-[390px] lg:max-w-[430px] bg-white border border-slate-200/90 rounded-[32px] p-4 sm:p-5 shadow-lg flex flex-col gap-3.5 flex-shrink-0">
        
        {/* Cabecera del Panel */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005CA9] flex items-center justify-center">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-heading font-black text-slate-800 uppercase tracking-wide">
                Control de Tiempo y Dosis
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="text-[10px] font-heading font-bold text-[#005CA9] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <KeyRound className="w-3 h-3" />
            <span>{currentPatient.codigoEnlaceFamiliar || 'FAM-8492'}</span>
          </button>
        </div>

        {/* Reloj Central del Simulador */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-heading font-bold text-slate-500 uppercase tracking-wider block">
              Hora en el Teléfono
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <strong className="text-2xl font-mono font-black text-[#005CA9]">
                {displayTimeFormatted}
              </strong>
              {isSimulatedTime ? (
                <span className="text-[9px] bg-blue-100 text-[#003876] font-heading font-black px-1.5 py-0.5 rounded tracking-wide">
                  SIMULADA
                </span>
              ) : (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-heading font-black px-1.5 py-0.5 rounded tracking-wide">
                  HORA REAL PC
                </span>
              )}
            </div>
          </div>

          {isSimulatedTime && (
            <button
              onClick={() => setIsSimulatedTime(false)}
              className="text-xs font-heading font-bold text-[#005CA9] hover:underline flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
              title="Volver a la hora de tu PC"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hora Real</span>
            </button>
          )}
        </div>

        {/* 1. SELECCIÓN DE HORARIOS DEL DÍA (Diferentes medicamentos a diferentes horas) */}
        <div>
          <span className="text-[11px] font-heading font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-[#005CA9]" />
            1. Horarios de Hoy ({intakes.length} pastillas programadas)
          </span>

          <div className="grid grid-cols-1 gap-1.5">
            {uniqueTimes.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No hay pastillas activas para hoy.
              </div>
            ) : (
              uniqueTimes.map(slotTime => {
                const hour = parseInt(slotTime.split(':')[0], 10);
                const isMorning = hour < 11;
                const isAfternoon = hour >= 11 && hour < 17;
                const slotMeds = intakes.filter(i => i.scheduledTime === slotTime);
                const allSlotTaken = slotMeds.every(m => m.status === 'TAKEN');
                const isSelected = isSimulatedTime && simulatedTimeStr.startsWith(slotTime.slice(0, 2));

                return (
                  <button
                    key={slotTime}
                    onClick={() => {
                      setIsSimulatedTime(true);
                      setSimulatedTimeStr(slotTime);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#005CA9] ring-2 ring-blue-300'
                        : allSlotTaken
                        ? 'bg-slate-50 border-slate-200 opacity-70'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isMorning 
                          ? 'bg-amber-50 text-amber-700' 
                          : isAfternoon 
                          ? 'bg-orange-50 text-orange-700' 
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {isMorning ? <Sunrise className="w-4 h-4" /> : isAfternoon ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-heading font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{slotTime} · {isMorning ? 'Desayuno (Mañana)' : isAfternoon ? 'Almuerzo (Tarde)' : 'Cena (Noche)'}</span>
                          {allSlotTaken && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">
                              ✓ Tomadas
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">
                          {slotMeds.map(m => m.medicationName).join(' + ')} ({slotMeds.length} {slotMeds.length === 1 ? 'pastilla' : 'pastillas'})
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#005CA9] bg-white border border-slate-200 px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
                      Probar
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 2. PRUEBA DE TOLERANCIA DINÁMICA DE LA DOSIS ACTIVA (4 ESTADOS CROMÁTICOS) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-heading font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#005CA9]" />
              2. Simulación de Estados de Tiempo (±20 min)
            </span>
            {leadIntake && (
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                Dosis: {leadIntake.scheduledTime}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-heading font-bold">
            {/* Verde: En Hora */}
            <button
              onClick={() => setSimulatedRelativeToActive(5)}
              className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-all flex items-center gap-2 shadow-2xs"
              title="Simula 5 minutos después de la hora programada (Dentro de los +-20 min)"
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 animate-ping"></div>
              <div className="text-left">
                <div className="leading-none">🟢 En Hora</div>
                <span className="text-[10px] font-normal text-emerald-800 font-sans">
                  Habilitado para tomar
                </span>
              </div>
            </button>

            {/* Amarillo: Temprano (Bloqueado) */}
            <button
              onClick={() => setSimulatedRelativeToActive(-45)}
              className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 transition-all flex items-center gap-2 shadow-2xs"
              title="Simula 45 min antes -> Bloquea el botón por seguridad geriátrica"
            >
              <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0"></div>
              <div className="text-left">
                <div className="leading-none">🟡 Temprano</div>
                <span className="text-[10px] font-normal text-amber-900 font-sans">
                  Botón BLOQUEADO
                </span>
              </div>
            </button>

            {/* Naranja: Retraso Leve */}
            <button
              onClick={() => setSimulatedRelativeToActive(35)}
              className="p-2.5 rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-950 transition-all flex items-center gap-2 shadow-2xs"
              title="Simula +35 min de retraso"
            >
              <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
              <div className="text-left">
                <div className="leading-none">🟠 Retraso Leve</div>
                <span className="text-[10px] font-normal text-orange-900 font-sans">
                  Aviso +35 min
                </span>
              </div>
            </button>

            {/* Rojo: Retraso Crítico */}
            <button
              onClick={() => setSimulatedRelativeToActive(75)}
              className="p-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-950 transition-all flex items-center gap-2 shadow-2xs"
              title="Simula >1 hora de retraso -> Genera reporte automático de alerta al cuidador"
            >
              <div className="w-3 h-3 rounded-full bg-rose-600 flex-shrink-0"></div>
              <div className="text-left">
                <div className="leading-none">🔴 Crítico</div>
                <span className="text-[10px] font-normal text-rose-900 font-sans">
                  Alerta a Cuidador
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 3. HERRAMIENTAS DE TESTING Y DISPOSITIVOS */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {/* Botón Grande de Reinicio de Todas las Tomas */}
          <button
            onClick={handleResetIntakesForTesting}
            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-200/90 shadow-2xs active:scale-98"
            title="Vuelve las 5 tomas de hoy a PENDIENTE en la base de datos real"
          >
            <RotateCcw className="w-4 h-4 text-[#005CA9]" />
            <span>Reiniciar Todas las Tomas (5 Pendientes)</span>
          </button>

          {/* Tensiómetro Bluetooth BLE */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleRecordVitalsFromMobile(120, 80, 72, 'Tensiómetro Digital EsSalud sincronizado vía Bluetooth')}
              disabled={isMeasuringVitals}
              className="h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              title="Simula recepción BLE de 120/80 mmHg"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>BLE 120/80 (Normal)</span>
            </button>

            <button
              onClick={() => handleRecordVitalsFromMobile(148, 96, 88, 'Tensiómetro Digital EsSalud: Hipertensión detectada')}
              disabled={isMeasuringVitals}
              className="h-10 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              title="Simula recepción BLE de 148/96 mmHg (alerta al cuidador)"
            >
              <Activity className="w-4 h-4 text-rose-600" />
              <span>BLE 148/96 (Alerta)</span>
            </button>
          </div>

          {/* Botón para abrir el Portal del Cuidador */}
          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-9 bg-blue-50 hover:bg-blue-100 text-[#003876] border border-blue-200 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#005CA9]" />
            <span>Abrir Portal Cuidador en Nueva Pestaña</span>
          </a>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* CHASIS DEL CELULAR SENIOR - RESPONSIVO Y ZERO SCROLL                 */}
      {/* ==================================================================== */}
      <div className="w-full max-w-[380px] sm:max-w-[400px] bg-slate-900 rounded-[44px] p-2.5 sm:p-3 shadow-2xl border-2 sm:border-4 border-slate-800 relative flex-shrink-0">
        
        {/* Pantalla del Teléfono (Zero-Scroll: 1.Toca tomar, 2.Cita, 3.SOS) */}
        <div className="bg-[#FAFBFD] rounded-[36px] overflow-hidden flex flex-col justify-between h-[640px] sm:h-[660px] max-h-[92vh] border border-slate-700/40 relative font-sans">
          
          {/* Barra de Estado del Móvil */}
          <div className="bg-white px-5 pt-2.5 pb-1.5 flex items-center justify-between text-[11px] font-mono text-slate-700 border-b border-slate-100">
            <span className="font-bold text-xs text-[#005CA9]">{displayTimeFormatted}</span>
            <div className="w-14 h-3 bg-slate-900 rounded-full mx-auto -mt-0.5"></div>
            <div className="flex items-center space-x-1.5">
              <Wifi className="w-3.5 h-3.5 text-slate-600" />
              <BatteryMedium className="w-4 h-4 text-slate-700" />
            </div>
          </div>

          {/* Banner Pasivo de Sincronización Bluetooth con Tensiómetro Externo */}
          {bluetoothSyncNotice && (
            <div className="bg-emerald-600 text-white px-3 py-1.5 flex items-center justify-between text-[11px] animate-in slide-in-from-top duration-200 shadow-sm z-20">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-100 animate-pulse" />
                <span>
                  Tensiómetro Bluetooth: <strong>{bluetoothSyncNotice.systolic}/{bluetoothSyncNotice.diastolic} mmHg</strong>
                </span>
              </div>
              <span className="text-[9px] bg-emerald-700 px-1.5 py-0.2 rounded font-mono font-bold">
                ENVIADO
              </span>
            </div>
          )}

          {/* Encabezado Senior Limpio: Saludo + Dosis de Hoy */}
          <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EsSaludLogo variant="icon" className="h-8 w-8 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest block leading-none">
                  EsSalud Contigo
                </span>
                <span className="text-base font-heading font-black text-[#005CA9] block leading-tight">
                  Don {currentPatient.fullName.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Badge claro de Dosis de Hoy */}
            <div className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-right">
              <span className="text-[10px] font-heading font-bold text-slate-500 uppercase tracking-wider block leading-none">
                Dosis de Hoy
              </span>
              <span className="text-sm font-heading font-black text-[#005CA9] block mt-0.5 leading-none">
                {intakes.filter(i => i.status === 'TAKEN').length} de {intakes.length} tomadas
              </span>
            </div>
          </div>

          {/* CUERPO CENTRAL (3 BLOQUES ESTRICTOS SIN SCROLL CON BOTONES GIGANTES) */}
          <div className="p-3 flex-1 flex flex-col justify-between gap-2.5 overflow-hidden">
            
            {/* ============================================================== */}
            {/* BLOQUE 1: CARD HERO DE LA PASTILLA (TEXTO ARRIBA A LA IZQ.)   */}
            {/* ============================================================== */}
            {!allTaken && currentMedicine ? (
              <div className={`rounded-3xl p-3 sm:p-3.5 border-2 transition-all flex flex-col justify-between flex-1 min-h-0 ${boxStyles.border}`}>
                
                {/* 1. TEXTO ENCIMA DE LA IMAGEN Y EN LA ESQUINA IZQUIERDA */}
                <div className="flex items-start justify-between gap-2">
                  <div className="text-left flex-1 min-w-0">
                    {/* Badge de Horario y Turno */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-heading font-black ${boxStyles.badgeBg}`}>
                        {boxStyles.badgeText}
                      </span>
                      {currentSlotIntakes.length > 1 && (
                        <span className="text-[11px] font-heading font-black bg-[#005CA9] text-white px-2 py-0.5 rounded-full shadow-2xs">
                          {validStepIndex + 1} de {currentSlotIntakes.length}
                        </span>
                      )}
                    </div>

                    {/* Nombre del Medicamento en la esquina izquierda (Letra Grande) */}
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-slate-900 tracking-tight leading-tight uppercase truncate">
                      {currentMedicine.medicationName}
                    </h3>

                    {/* Dosis y Momento a la izquierda */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs sm:text-sm font-heading font-black text-[#005CA9] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                        {currentMedicine.dosage}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {getRoutineTimeLabel(leadIntake.scheduledTime).split('(')[0].trim()} ({currentMedicine.scheduledTime.slice(0, 5)})
                      </span>
                    </div>
                  </div>

                  {/* Altavoz Grande de Audio a la derecha */}
                  <button
                    onClick={() => {
                      speakText(
                        `Don ${currentPatient.fullName.split(' ')[0]}, ${
                          currentSlotIntakes.length > 1 ? `en el paso ${validStepIndex + 1} de ${currentSlotIntakes.length}` : ''
                        } te toca tomar ${currentMedicine.medicationName} de ${currentMedicine.dosage}.`
                      );
                    }}
                    title="Escuchar en voz alta"
                    className="w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 text-[#005CA9] border-2 border-blue-200 flex items-center justify-center transition-colors shadow-xs active:scale-95 flex-shrink-0"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* 2. IMAGEN HERO DEBAJO DEL TEXTO (CENTRO LIMPIO Y GRANDE) */}
                <div className="my-2 flex-1 min-h-[95px] max-h-[145px] w-full flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-2xl p-2 shadow-xs border border-slate-200/90 flex items-center justify-center overflow-hidden">
                    <PillThumbnail
                      name={currentMedicine.medicationName}
                      imageUrl={currentMedicine.imageUrl}
                      size="hero"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* 3. BOTÓN PRINCIPAL: YA LA TOMÉ (64PX) + ENLACE DISCRETO DE OMITIR */}
                <div className="space-y-1 mt-auto">
                  {timeState === 'TAKEN' ? (
                    <div className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-heading font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-md">
                      <CheckCircle className="w-7 h-7" />
                      <span>¡DOSIS REGISTRADA CON ÉXITO!</span>
                    </div>
                  ) : timeState === 'EARLY' ? (
                    <button
                      onClick={handleTakeStepMedicine}
                      className="w-full h-16 bg-slate-200 hover:bg-amber-100 text-slate-600 hover:text-amber-950 border-2 border-slate-300 rounded-2xl font-heading font-black text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all cursor-not-allowed shadow-xs"
                      title="Bloqueado por seguridad: Aún no es la hora de tomar"
                    >
                      <Lock className="w-6 h-6 text-amber-700" />
                      <span>BLOQUEADO · ESPERA TU HORA</span>
                    </button>
                  ) : (
                    <>
                      {/* BOTÓN PRINCIPAL GIGANTE DE 64PX (VERDE) */}
                      <button
                        onClick={handleTakeStepMedicine}
                        disabled={isSuccessAnimated}
                        className={`w-full h-16 active:scale-98 text-white rounded-2xl font-heading font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-lg transition-all ${
                          timeState === 'CRITICAL_DELAY'
                            ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-400'
                            : timeState === 'LATE_WARNING'
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-[#009B3A] hover:bg-[#007A2E]'
                        }`}
                      >
                        <CheckCircle className="w-7 h-7 text-emerald-100" />
                        <span>
                          {currentSlotIntakes.length > 1
                            ? `YA LA TOMÉ (${validStepIndex + 1} de ${currentSlotIntakes.length})`
                            : 'YA LA TOMÉ'}
                        </span>
                      </button>

                      {/* Enlace Discreto para Omitir si Falta la Pastilla */}
                      <button
                        onClick={handleSkipMedicine}
                        className="w-full py-1 text-center text-xs font-heading font-bold text-slate-400 hover:text-rose-600 transition-colors"
                        title="Avisa a tu cuidador que no tienes esta pastilla"
                      >
                        ¿No tienes esta pastilla? <span className="underline">Toca aquí para avisar</span>
                      </button>
                    </>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-emerald-50/70 rounded-3xl p-6 border-2 border-emerald-300 text-center shadow-xs flex flex-col items-center justify-center flex-1">
                <CheckCircle2 className="w-16 h-16 text-[#009B3A] mb-2" />
                <h3 className="font-heading font-black text-xl text-slate-900">
                  ¡Al día con tus pastillas!
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-1">
                  Todas las dosis programadas de hoy fueron confirmadas a tu familiar.
                </p>
              </div>
            )}

            {/* ============================================================== */}
            {/* BLOQUE 2: PRÓXIMA CITA MÉDICA (1 SOLA FILA LIMPIA)              */}
            {/* ============================================================== */}
            <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#005CA9] text-white flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-wider block leading-none">
                    Próxima Cita Médica
                  </span>
                  <h4 className="font-heading font-black text-slate-900 text-xs sm:text-sm truncate mt-0.5">
                    {upcomingAppt ? `${upcomingAppt.specialty} · ${upcomingAppt.doctorName}` : 'Sin citas programadas'}
                  </h4>
                </div>
              </div>

              {upcomingAppt && (
                <button
                  onClick={() => speakText(`Don ${currentPatient.fullName.split(' ')[0]}, tienes cita médica de ${upcomingAppt.specialty} con el doctor ${upcomingAppt.doctorName} en el policlínico.`)}
                  className="w-9 h-9 rounded-full bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center transition-colors shadow-2xs flex-shrink-0 active:scale-95 ml-2"
                  title="Escuchar cita médica"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ============================================================== */}
            {/* BLOQUE 3: BOTÓN DE AUXILIO SOS (GEMELO IDÉNTICO DE 64PX EN ROJO)*/}
            {/* ============================================================== */}
            <div>
              <button
                onClick={handleSos}
                className={`w-full h-16 active:scale-98 text-white rounded-2xl font-heading font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-lg transition-all ${
                  isSosSent 
                    ? 'bg-rose-900 text-white animate-pulse' 
                    : 'bg-[#D92D20] hover:bg-[#B42318]'
                }`}
              >
                <PhoneCall className="w-7 h-7 animate-bounce" />
                <span>{isSosSent ? '¡AVISANDO A TU FAMILIA...!' : '🚨 3. PEDIR AUXILIO A MI FAMILIA'}</span>
              </button>
            </div>

          </div>

          {/* Barra Virtual de Inicio Inferior */}
          <div className="pb-2 pt-1 flex justify-center bg-white border-t border-slate-100">
            <div className="w-20 h-1 bg-slate-300 rounded-full"></div>
          </div>

        </div>

      </div>

      {/* ==================================================================== */}
      {/* MODAL PARA CAMBIAR CÓDIGO FAMILIAR O DE CUIDADOR                     */}
      {/* ==================================================================== */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setIsCodeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#005CA9] flex items-center justify-center mx-auto mb-1.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Código Familiar / Cuidador
              </h3>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">
                Ingresa el código para enlazar el teléfono del asegurado:
              </p>
            </div>

            {linkError && (
              <div className="bg-rose-50 border border-rose-200 p-2 rounded-xl text-xs text-rose-800 mb-2.5 text-center">
                {linkError}
              </div>
            )}

            <div className="space-y-2.5">
              <input
                type="text"
                value={codeInputValue}
                onChange={e => setCodeInputValue(e.target.value)}
                placeholder="Ej: FAM-8492 o CUID-1001"
                className="w-full text-center font-mono font-bold text-base uppercase tracking-widest px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none"
              />

              <button
                onClick={() => handleConnectByCode()}
                disabled={isLinking || !codeInputValue.trim()}
                className="w-full bg-[#005CA9] hover:bg-[#004885] disabled:opacity-50 text-white font-heading font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-xs"
              >
                {isLinking ? 'Conectando...' : 'Vincular y Cargar'}
              </button>

              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
                  Cuentas Registradas en BD:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleConnectByCode('FAM-8492')}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-colors"
                  >
                    <strong className="block text-slate-800 text-[10px]">Dacio Ramos</strong>
                    <span className="text-[10px] text-[#005CA9] font-mono font-bold">FAM-8492</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConnectByCode('FAM-9123')}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-colors"
                  >
                    <strong className="block text-slate-800 text-[10px]">Elena Morales</strong>
                    <span className="text-[10px] text-[#005CA9] font-mono font-bold">FAM-9123</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
