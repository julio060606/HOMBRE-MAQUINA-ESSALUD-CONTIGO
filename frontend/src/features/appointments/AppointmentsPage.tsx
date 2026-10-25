import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useToast } from '../../context/ToastContext';
import { appointmentService, syncEvents } from '../../services/apiClient';
import { Appointment } from '../../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Video, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Building2,
  Stethoscope
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const { activePatient } = usePatient();
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROGRAMADA' | 'EN_ESPERA'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Formulario de Nueva Cita
  const [statusToCreate, setStatusToCreate] = useState<'EN_ESPERA' | 'PROGRAMADA'>('EN_ESPERA');
  const [specialty, setSpecialty] = useState('Geriatría');
  const [doctorName, setDoctorName] = useState('Dr. Manuel Flores Barreda');
  const [office, setOffice] = useState('Consultorio 204 (2do Piso)');
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 3);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:30');
  const [type, setType] = useState<'PRESENCIAL' | 'TELEMEDICINA'>('PRESENCIAL');
  const [reason, setReason] = useState('Control mensual de hipertensión arterial');

  const loadAppointments = () => {
    if (!activePatient) return;
    setIsLoading(true);
    appointmentService.getAppointments(activePatient.id)
      .then(setAppointments)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAppointments();
    const unsub = syncEvents.subscribe(loadAppointments);
    return unsub;
  }, [activePatient]);

  if (!activePatient) return null;

  const handleCancelAppointment = async (id: string, specialtyName: string) => {
    if (!window.confirm(`¿Está seguro de cancelar la cita de ${specialtyName}?`)) return;
    try {
      await appointmentService.cancelAppointment(id);
      toast.info('Cita Cancelada', `La cita médica de ${specialtyName} ha sido cancelada en EsSalud.`);
    } catch {
      toast.error('Error al Cancelar', 'No se pudo cancelar la cita. Intente nuevamente.');
    }
  };

  const handleConfirmAvailability = async (id: string, specialtyName: string) => {
    try {
      await appointmentService.confirmDoctorAvailability(id, {
        doctorName: 'Dr. Manuel Flores Barreda (Geriatría)',
        office: 'Consultorio 204 (2do Piso)'
      });
      toast.success(
        '✅ Cita Confirmada por EsSalud',
        `Policlínico asignó cupo para ${specialtyName} con el Dr. Manuel Flores Barreda. Sincronizada con el móvil del asegurado.`
      );
      loadAppointments();
    } catch {
      toast.error('Error al Confirmar', 'No se pudo confirmar la disponibilidad de la cita.');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateTime = new Date(`${date}T${time}:00`).toISOString();
      await appointmentService.scheduleAppointment({
        patientId: activePatient.id,
        specialty,
        doctorName: statusToCreate === 'EN_ESPERA' ? 'Por Asignar (EsSalud)' : doctorName,
        ipress: activePatient.ipressEssalud || 'Policlínico Chincha - EsSalud',
        office: type === 'PRESENCIAL' ? (statusToCreate === 'EN_ESPERA' ? 'Consultorio Pendiente' : office) : 'Plataforma EsSalud Telemedicina',
        dateTime,
        type,
        status: statusToCreate,
        reason
      });

      if (statusToCreate === 'EN_ESPERA') {
        toast.info(
          '⏳ Solicitud Enviada a EsSalud',
          `Se solicitó cupo para ${specialty}. En espera de confirmación y asignación de médico.`
        );
      } else {
        toast.success(
          '📅 Cita Agendada con Éxito',
          `Cita de ${specialty} programada para el ${date} a las ${time}. Reflejada en el perfil de ${activePatient.fullName}.`
        );
      }
      setIsModalOpen(false);
      loadAppointments();
    } catch {
      toast.error('Error al Agendar', 'Hubo un error al registrar la cita en la base de datos de EsSalud.');
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (activeTab === 'PROGRAMADA') return a.status === 'PROGRAMADA';
    if (activeTab === 'EN_ESPERA') return a.status === 'EN_ESPERA';
    return true;
  });

  const scheduledCount = appointments.filter(a => a.status === 'PROGRAMADA').length;
  const waitingCount = appointments.filter(a => a.status === 'EN_ESPERA').length;

  return (
    <div className="space-y-6 font-sans antialiased pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-heading font-semibold text-blue-700 uppercase tracking-wider">
              EsSalud Mi Consulta • Citas Médicas
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Gestión de Citas Médicas e Interconsultas
          </h1>
          <p className="text-xs text-slate-500 font-light mt-1">
            Asegurado: <strong className="font-semibold text-slate-700">{activePatient.fullName}</strong> • IPRESS: <strong className="font-semibold text-slate-700">{activePatient.ipressEssalud || 'Policlínico Chincha'}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-heading font-semibold uppercase tracking-wider px-5 py-3 rounded-2xl shadow-sm hover:shadow transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Solicitar / Agendar Cita</span>
        </button>
      </div>

      {/* Pestañas de Filtrado */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
            activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas las Citas ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('PROGRAMADA')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
            activeTab === 'PROGRAMADA' ? 'bg-blue-700 text-white shadow-xs' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
          }`}
        >
          Citas Confirmadas ({scheduledCount})
        </button>
        <button
          onClick={() => setActiveTab('EN_ESPERA')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all ${
            activeTab === 'EN_ESPERA' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          En Lista de Espera ({waitingCount})
        </button>
      </div>

      {/* Grid de Citas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-slate-900 text-base">No hay citas médicas registradas</h3>
            <p className="text-xs text-slate-500 font-light mt-1">
              Presione el botón superior para agendar una cita presencial o por telemedicina para {activePatient.fullName}.
            </p>
          </div>
        ) : (
          filteredAppointments.map(appt => {
            const isPresencial = appt.type === 'PRESENCIAL';
            const isConfirmed = appt.status === 'PROGRAMADA';
            const isWaiting = appt.status === 'EN_ESPERA';
            const dateObj = new Date(appt.dateTime);
            const dateFormatted = dateObj.toLocaleDateString('es-PE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const timeFormatted = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

            return (
              <div 
                key={appt.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider ${
                        isConfirmed 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : isWaiting
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.status}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isPresencial ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {isPresencial ? <Building2 className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        {appt.type}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {appt.id.slice(0, 8)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span>{appt.specialty}</span>
                    </h3>
                    <p className="text-xs font-heading font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.doctorName}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 text-xs text-slate-700 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="capitalize font-medium text-slate-900">{dateFormatted}</span>
                      <span className="text-slate-400">•</span>
                      <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-mono font-bold text-slate-900">{timeFormatted}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{appt.ipress} {appt.office ? `(${appt.office})` : ''}</span>
                    </div>

                    {appt.reason && (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-light">
                        <strong>Motivo:</strong> {appt.reason}
                      </p>
                    )}
                  </div>

                  {isWaiting && (
                    <div className="mt-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-amber-900">
                        <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Solicitud en Lista de Espera del Policlínico</span>
                      </div>
                      <p className="text-[11px] text-amber-800 font-light leading-relaxed">
                        La solicitud fue recibida por la IPRESS. En cuanto el Policlínico responda y asigne cupo con el médico, la cita se programará automáticamente y se sincronizará en el teléfono del asegurado.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleConfirmAvailability(appt.id, appt.specialty)}
                        className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-heading font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Simular Respuesta EsSalud (Confirmar Cupo y Asignar Médico)</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isConfirmed ? 'Sincronizada con el móvil del paciente' : 'Pendiente de confirmación médica'}
                  </span>

                  {appt.status !== 'CANCELADA' && (
                    <button
                      onClick={() => handleCancelAppointment(appt.id, appt.specialty)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-heading font-semibold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Agendar Nueva Cita */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  Agendar Cita en EsSalud
                </h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Centro: {activePatient.ipressEssalud || 'Policlínico Chincha'} • Paciente: {activePatient.fullName}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Gestión de la Cita *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStatusToCreate('EN_ESPERA')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      statusToCreate === 'EN_ESPERA'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950 ring-1 ring-amber-500/40 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-heading font-bold text-amber-950">⏳ Solicitud a IPRESS</div>
                    <div className="text-[10px] font-light text-slate-500 mt-0.5">En espera de cupo y médico</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusToCreate('PROGRAMADA')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      statusToCreate === 'PROGRAMADA'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 ring-1 ring-blue-600/40 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-heading font-bold text-blue-950">📅 Cita Confirmada</div>
                    <div className="text-[10px] font-light text-slate-500 mt-0.5">Cupo y consultorio asignados</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Especialidad Médica *
                  </label>
                  <select
                    value={specialty}
                    onChange={e => {
                      setSpecialty(e.target.value);
                      if (e.target.value === 'Geriatría') setDoctorName('Dr. Manuel Flores Barreda');
                      else if (e.target.value === 'Cardiología') setDoctorName('Dra. Rosa Benavides');
                      else if (e.target.value === 'Medicina General') setDoctorName('Dr. Carlos Quispe');
                      else setDoctorName('Dr. Especialista EsSalud');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Geriatría">Geriatría</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Medicina General">Medicina General</option>
                    <option value="Medicina Interna">Medicina Interna</option>
                    <option value="Odontología">Odontología</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Modalidad *
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="PRESENCIAL">Presencial en Policlínico</option>
                    <option value="TELEMEDICINA">Telemedicina (Videoconsulta)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Médico Tratante
                </label>
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Motivo de la Consulta
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ej: Control de presión alta o renovación de recetas..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-heading font-semibold uppercase text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-heading font-semibold uppercase tracking-wider shadow-sm"
                >
                  Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
