import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useToast } from '../../context/ToastContext';
import { medicationService, alertService, appointmentService, syncEvents } from '../../services/apiClient';
import { speechService, soundEffects } from '../../services/speechService';
import { PillIntake, Appointment } from '../../types';
import { EsSaludLogo } from '../common/EsSaludLogo';
import { PillThumbnail } from '../common/PillThumbnail';
import { Link } from 'react-router-dom';
import { 
  X, 
  Wifi, 
  BatteryMedium, 
  Volume2, 
  CheckCircle, 
  PhoneCall, 
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobilePatientSimulatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activePatient } = usePatient();
  const toast = useToast();
  const [intakes, setIntakes] = useState<PillIntake[]>([]);
  const [upcomingAppt, setUpcomingAppt] = useState<Appointment | null>(null);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);
  const [isSosSent, setIsSosSent] = useState(false);

  const loadData = () => {
    if (!activePatient) return;
    medicationService.getTodayIntakes(activePatient.id).then(setIntakes);
    appointmentService.getAppointments(activePatient.id).then(appts => {
      const nextAppt = appts.find(a => a.status === 'PROGRAMADA') || appts[0] || null;
      setUpcomingAppt(nextAppt);
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activePatient]);

  useEffect(() => {
    const unsub = syncEvents.subscribe(loadData);
    return unsub;
  }, [activePatient]);

  if (!isOpen || !activePatient) return null;

  const pendingIntake = intakes.find(i => i.status === 'PENDING') || intakes[0];
  const allTaken = intakes.length > 0 && intakes.every(i => i.status === 'TAKEN');

  const speakText = (text: string, playChime = false) => {
    speechService.speak(text, { playChimeBefore: playChime });
  };

  const handleTakePill = async (target?: PillIntake) => {
    const intake = target || pendingIntake;
    if (!intake) return;
    
    setIsSuccessAnimated(true);
    speakText(
      `¡Muy bien, Don ${activePatient.fullName.split(' ')[0]}! Tu toma de ${intake.medicationName} ha sido confirmada y enviada a tu familiar.`,
      true
    );
    
    await medicationService.confirmIntake(intake.id, 'MANUAL_PATIENT');
    
    toast.success(
      '📱 Sincronización Móvil en Vivo',
      `${activePatient.fullName} confirmó la toma de ${intake.medicationName} (${intake.dosage}). Adherencia actualizada.`
    );

    setTimeout(() => {
      setIsSuccessAnimated(false);
    }, 2500);
  };

  const handleSos = async () => {
    setIsSosSent(true);
    soundEffects.playSosAlertSound();
    
    setTimeout(() => {
      speakText(`Alerta de auxilio activada. Avisando a tu familiar.`);
    }, 600);
    
    await alertService.triggerSosAlert(activePatient.id, 'Alerta disparada desde el botón SOS del móvil.');
    
    toast.error(
      '🚨 ALERTA SOS RECIBIDA',
      `${activePatient.fullName} ha presionado el botón de auxilio inmediato SOS.`
    );

    setTimeout(() => {
      setIsSosSent(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Contenedor Flotante */}
      <div className="bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 relative w-full max-w-sm flex flex-col justify-between">
        
        {/* Botón Flotante para Cerrar el Modal */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-600 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 z-30"
          title="Cerrar simulador"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pantalla Interna del Smartphone */}
        <div className="w-full bg-[#FAFBFD] rounded-[36px] overflow-hidden flex flex-col justify-between text-slate-900 min-h-[600px] max-h-[760px] relative font-sans">
          
          {/* Barra de Estado */}
          <div className="pt-3 px-5 pb-2 flex items-center justify-between text-[11px] font-mono text-slate-600 bg-white border-b border-slate-100">
            <span className="font-bold">{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="w-16 h-3.5 bg-slate-900 rounded-full mx-auto -mt-1"></div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-slate-600" />
              <BatteryMedium className="w-4 h-4 text-slate-700" />
            </div>
          </div>

          {/* Encabezado EsSalud Senior */}
          <div className="bg-white px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <EsSaludLogo variant="full" className="h-7" />
            <span className="text-[10px] font-heading font-bold text-[#005CA9] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase">
              Modo Senior
            </span>
          </div>

          {/* Contenido Principal */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
            
            {/* Saludo Personalizado */}
            <div className="bg-white border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] uppercase font-heading font-bold text-slate-400 tracking-wider">
                  Asegurado EsSalud
                </span>
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Don {activePatient.fullName.split(' ')[0]}
                </h3>
              </div>
              <button 
                onClick={() => speakText(`Hola Don ${activePatient.fullName.split(' ')[0]}. Tienes ${intakes.filter(i => i.status === 'PENDING').length} dosis pendientes hoy.`)}
                title="Escuchar saludo"
                className="w-8 h-8 rounded-full bg-blue-50 text-[#005CA9] border border-blue-200 flex items-center justify-center hover:bg-blue-100 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Tarjeta de la Toma del Momento */}
            {!allTaken && pendingIntake ? (
              <div className="bg-white rounded-3xl p-4 border-2 border-blue-200 shadow-sm">
                
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <span className="inline-flex items-center gap-1 text-[11px] font-heading font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003876]">
                    <Clock className="w-3.5 h-3.5" />
                    {pendingIntake.scheduledTime}
                  </span>
                  <span className="text-xs font-heading font-bold text-[#005CA9]">
                    Toca tomar ahora
                  </span>
                </div>

                <div className="flex items-center gap-3.5 my-3">
                  <PillThumbnail name={pendingIntake.medicationName} imageUrl={pendingIntake.imageUrl} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-base text-slate-900 leading-tight">
                      {pendingIntake.medicationName}
                    </h4>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-50 text-[#005CA9] font-heading font-bold text-xs">
                      {pendingIntake.dosage}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3.5">
                  💡 {pendingIntake.instructions || 'Tomar con un vaso de agua después de comer.'}
                </p>

                {/* BOTÓN 64PX YA LA TOMÉ */}
                {pendingIntake.status === 'TAKEN' ? (
                  <div className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>¡Dosis Registrada!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleTakePill(pendingIntake)}
                    disabled={isSuccessAnimated}
                    className="w-full h-14 bg-[#009B3A] hover:bg-[#007A2E] active:scale-98 text-white rounded-2xl font-heading font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-md transition-all"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-200" />
                    <span>YA LA TOMÉ</span>
                  </button>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 border border-emerald-200 text-center shadow-xs">
                <CheckCircle2 className="w-12 h-12 text-[#009B3A] mx-auto mb-2" />
                <h4 className="font-heading font-bold text-sm text-slate-900">
                  ¡Al día con las pastillas!
                </h4>
                <p className="text-xs text-slate-500 font-light mt-1">
                  Todas las tomas de hoy han sido confirmadas.
                </p>
              </div>
            )}

            {/* Próxima Cita Médica */}
            {upcomingAppt && (
              <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-heading font-bold text-[#003876] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#005CA9]" /> Próxima Cita Médica
                  </span>
                  <button
                    onClick={() => speakText(`Cita médica de ${upcomingAppt.specialty} con ${upcomingAppt.doctorName}.`)}
                    className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors shadow-2xs"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
                <h5 className="font-heading font-bold text-slate-900 text-xs">
                  {upcomingAppt.specialty} · {upcomingAppt.doctorName}
                </h5>
                <p className="text-[11px] text-[#005CA9] font-bold mt-0.5">
                  📍 {upcomingAppt.office || 'Consultorio 204'} • {new Date(upcomingAppt.dateTime).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </div>
            )}

            {/* Botón de Auxilio SOS */}
            <button
              onClick={handleSos}
              className={`w-full py-3.5 rounded-2xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                isSosSent ? 'bg-rose-900 text-white animate-pulse' : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-98'
              }`}
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>{isSosSent ? '¡ALERTA SOS ENVIADA!' : '🚨 PEDIR AUXILIO (SOS)'}</span>
            </button>

            {/* Enlace para abrir en pantalla completa */}
            <div className="text-center pt-1">
              <Link
                to="/modo-senior"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-[11px] font-heading font-semibold text-[#005CA9] hover:underline"
              >
                <span>Abrir en Pantalla Completa</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

          </div>

          {/* Barra Virtual */}
          <div className="pb-2.5 pt-1.5 flex justify-center bg-white border-t border-slate-100">
            <div className="w-20 h-1 bg-slate-300 rounded-full"></div>
          </div>

        </div>

      </div>

    </div>
  );
};
