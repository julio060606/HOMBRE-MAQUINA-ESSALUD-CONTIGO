import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useToast } from '../../context/ToastContext';
import { alertService, syncEvents } from '../../services/apiClient';
import { AlertEvent } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const GlobalEmergencyBanner: React.FC = () => {
  const { activePatient } = usePatient();
  const toast = useToast();
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionReason, setResolutionReason] = useState('CONTACTO_TELEFONICO');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAlerts = () => {
    if (!activePatient) return;
    alertService.getRecentAlerts(activePatient.id)
      .then(setAlerts)
      .catch(console.error);
  };

  useEffect(() => {
    loadAlerts();
    const unsub = syncEvents.subscribe(loadAlerts);
    const interval = setInterval(loadAlerts, 3500);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [activePatient]);

  if (!activePatient) return null;

  // Filtrar si hay alertas SOS pendientes no atendidas
  const unhandledSosAlerts = alerts.filter(
    a => !a.isResolved && a.severity === 'CRITICAL' && (a.type === 'PANIC_BUTTON' || a.title.includes('SOS'))
  );

  if (unhandledSosAlerts.length === 0) return null;

  const latestSos = unhandledSosAlerts[0];

  const handleResolveAllSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const reasonLabel = 
        resolutionReason === 'CONTACTO_TELEFONICO' ? 'Contacto Telefónico Exitoso' :
        resolutionReason === 'VISITA_DOMICILIARIA' ? 'Visita Presencial Domiciliaria' :
        resolutionReason === 'SAMU_COORDINADO' ? 'SAMU 106 / IPRESS Coordinado' : 'Falsa Alarma / Pulsación Accidental';

      await alertService.resolveAllSosAlerts(activePatient.id, {
        motivo: resolutionReason,
        resueltaPor: 'Cuidador Familiar',
        notas: resolutionNotes || `Atención confirmada: ${reasonLabel}`
      });

      toast.success(
        '✅ Emergencia de Auxilio Atendida',
        `Se atendieron y cerraron las alertas de emergencia (${reasonLabel}) en todas las pantallas.`
      );
      setIsResolveModalOpen(false);
      setResolutionNotes('');
      loadAlerts();
    } catch (err: any) {
      toast.error('Error al atender emergencia', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDismissAll = async () => {
    if (!window.confirm('¿Descartar esta emergencia de auxilio como falsa alarma?')) return;
    try {
      await alertService.resolveAllSosAlerts(activePatient.id, {
        motivo: 'FALSA_ALARMA',
        resueltaPor: 'Cuidador Familiar',
        notas: 'Descartada por el cuidador como pulsación accidental'
      });
      toast.info('Emergencia Descartada', 'La alarma SOS ha sido desactivada en todo el sistema.');
      loadAlerts();
    } catch (err: any) {
      toast.error('Error al descartar', err.message);
    }
  };

  return (
    <>
      {/* Banner Global Flotante / Encabezado Permanente */}
      <aside aria-label="Alerta de emergencia SOS activa" className="w-full bg-rose-600 text-white shadow-xl animate-pulse sticky top-0 z-40 border-b-2 border-rose-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-heading font-black uppercase tracking-wider">
                  ¡EMERGENCIA SOS ACTIVA!
                </span>
                <span className="text-xs text-rose-100 font-light">
                  {new Date(latestSos.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-white mt-0.5">
                {activePatient.fullName.toUpperCase()} activó el botón de auxilio inmediato
              </h4>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a 
              href={`tel:${activePatient.emergencyPhone}`} 
              className="px-3.5 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-heading font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              📞 Llamar al {activePatient.emergencyPhone}
            </a>

            <button
              onClick={() => {
                setResolutionReason('CONTACTO_TELEFONICO');
                setResolutionNotes('');
                setIsResolveModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-heading font-bold shadow-xs transition-colors flex items-center gap-1.5 border border-emerald-500"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Atender Emergencia</span>
            </button>

            <button
              onClick={handleQuickDismissAll}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-heading font-semibold border border-white/30 transition-colors"
              title="Descartar como pulsación accidental"
            >
              ✕ Falsa Alarma
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Clínico de Resolución de Emergencia */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Atención de Alerta de Auxilio SOS
                  </h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">
                    Paciente: {activePatient.fullName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsResolveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveAllSos} className="space-y-4">
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
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="globalResolutionReason"
                        value={option.id}
                        checked={resolutionReason === option.id}
                        onChange={() => setResolutionReason(option.id)}
                        className="mt-1 text-emerald-600 focus:ring-emerald-600"
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
                  Observaciones Clínicas / Medidas Tomadas
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Detalles sobre el estado del paciente..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400 font-light"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="w-1/2 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-heading font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : 'Confirmar y Desactivar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
