import React, { useEffect, useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useToast } from '../../context/ToastContext';
import { medicationService, syncEvents } from '../../services/apiClient';
import { Medication } from '../../types';
import { PillThumbnail } from '../../components/common/PillThumbnail';
import { 
  Pill, 
  Plus, 
  Clock, 
  Building2, 
  Image as ImageIcon, 
  Power, 
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  RefreshCw
} from 'lucide-react';

export const MedicationsPage: React.FC = () => {
  const { activePatient } = usePatient();
  const toast = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_PICKUP'>('ALL');
  const [formError, setFormError] = useState<string | null>(null);

  // Simulación de Recetas desde Policlínico
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState('08:00');
  const [frequencyHours, setFrequencyHours] = useState<number>(24);
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60');

  const loadMedications = () => {
    if (!activePatient) return;
    medicationService.getMedications(activePatient.id).then(setMedications);
  };

  useEffect(() => {
    loadMedications();
    const unsub = syncEvents.subscribe(loadMedications);
    return unsub;
  }, [activePatient]);

  if (!activePatient) return null;

  const handleToggle = async (id: string, currentStatus: boolean, medName: string) => {
    await medicationService.toggleMedicationStatus(id);
    toast.info(
      currentStatus ? 'Tratamiento Pausado' : 'Tratamiento Reactivado',
      `Se ${currentStatus ? 'pausó' : 'reactivó'} ${medName} para el paciente.`
    );
  };

  const handleConfirmPickup = async (recetaId: string, medName: string) => {
    await medicationService.confirmPickup(recetaId);
    toast.success(
      '🏥 Medicamento Recogido de Farmacia',
      `Se confirmó el recojo de ${medName} en Farmacia EsSalud. Stock cargado al pastillero del hogar.`
    );
    loadMedications();
  };

  const handleMarkHomeAvailable = async (recetaId: string, medName: string) => {
    try {
      await medicationService.markHomeAvailable(recetaId, 30);
      toast.success(
        '🏠 Medicamento Disponible en el Hogar',
        `Se confirmó que ${medName} se encuentra en casa. Stock cargado e integrado al pastillero del asegurado.`
      );
      loadMedications();
    } catch {
      toast.error('Error', 'No se pudo actualizar el estado del medicamento.');
    }
  };

  const handleReportStockout = async (recetaId: string, medName: string) => {
    if (!window.confirm(`¿Reportar desabastecimiento de ${medName} en la farmacia del Policlínico?`)) return;
    try {
      await medicationService.reportStockout(recetaId, 'Falta de existencias en farmacia de la IPRESS');
      toast.warning(
        '⚠️ Desabastecimiento Reportado',
        `Se registró la falta de ${medName} en Farmacia EsSalud. Notificación emitida al sistema clínico.`
      );
      loadMedications();
    } catch {
      toast.error('Error', 'No se pudo reportar el desabastecimiento.');
    }
  };

  const handleSimulatePrescription = async (preset: {
    name: string;
    dosage: string;
    instructions: string;
    imageUrl: string;
    frequencyHours: number;
  }) => {
    try {
      setIsSimulating(true);
      await medicationService.simulatePrescriptionIssued(activePatient.id, {
        name: preset.name,
        dosage: preset.dosage,
        instructions: preset.instructions,
        imageUrl: preset.imageUrl,
        frequencyHours: preset.frequencyHours,
        doctor: 'Dr. Manuel Flores Barreda (Geriatría)',
        pharmacy: activePatient.ipressEssalud ? `${activePatient.ipressEssalud} - Farmacia` : 'Policlínico Chincha - Farmacia'
      });
      toast.success(
        '💊 Receta Electrónica Emitida',
        `EsSalud emitió prescripción para ${preset.name}. Disponible para recojo en farmacia.`
      );
      setIsSimulateModalOpen(false);
      loadMedications();
    } catch {
      toast.error('Error al emitir receta', 'No se pudo registrar la receta en la base de datos.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRestock = async (recetaId: string, medName: string) => {
    await medicationService.restock(recetaId, 30);
    toast.success(
      '📦 Stock Repuesto',
      `Se añadieron +30 comprimidos a ${medName} en el pastillero del paciente.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Por favor ingrese el nombre del medicamento.');
      return;
    }
    if (!dosage.trim()) {
      setFormError('Por favor especifique la dosis (ej: 50 mg, 1 tableta).');
      return;
    }

    try {
      await medicationService.saveMedication({
        patientId: activePatient.id,
        name: name.trim(),
        dosage: dosage.trim(),
        frequencyHours,
        imageUrl,
        times: [times],
        instructions: instructions.trim() || 'Tomar según indicación médica con un vaso con agua.',
        isActive: true,
      });

      toast.success(
        'Receta Sincronizada con EsSalud',
        `${name} (${dosage}) fue programado y enviado en tiempo real al móvil de ${activePatient.fullName}.`
      );

      setIsModalOpen(false);
      setName('');
      setDosage('');
      setInstructions('');
      setFormError(null);
    } catch {
      toast.error('Error al Guardar', 'No se pudo registrar la prescripción en la base de datos.');
    }
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (med.numeroRecetaEssalud || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ACTIVE') return matchesSearch && med.estadoDispensacion === 'EN_USO_DOMICILIO';
    if (statusFilter === 'PENDING_PICKUP') return matchesSearch && med.estadoDispensacion === 'PENDIENTE_RECOJO';
    return matchesSearch;
  });

  const pendingPickupCount = medications.filter(m => m.estadoDispensacion === 'PENDIENTE_RECOJO').length;

  return (
    <div className="space-y-6 font-sans antialiased pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005CA9] animate-pulse"></span>
            <span className="text-xs font-heading font-bold text-[#005CA9] uppercase tracking-wider">
              EsSalud Farmacia & Control de Recetas
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Pastillero y Recetas Médicas Oficiales
          </h1>
          <p className="text-xs text-slate-500 font-light mt-1">
            Medicamentos activos para <strong className="font-semibold text-slate-700">{activePatient.fullName}</strong>. Sincronización bidireccional con Supabase Cloud.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-heading font-semibold uppercase tracking-wider px-4 py-3 rounded-2xl shadow-2xs transition-all flex-shrink-0"
            title="Simular prescripción emitida por el médico de turno de EsSalud"
          >
            <Pill className="w-4 h-4 text-amber-700" />
            <span>Simular Emisión EsSalud</span>
          </button>

          <button
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            data-testid="btn-add-medication-modal"
            className="inline-flex items-center justify-center gap-2 bg-[#005CA9] hover:bg-[#004884] text-white text-xs font-heading font-semibold uppercase tracking-wider px-5 py-3 rounded-2xl shadow-sm hover:shadow transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Receta Médica</span>
          </button>
        </div>
      </div>

      {/* Alerta de Recojo en Farmacia si aplica */}
      {pendingPickupCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-heading font-bold uppercase tracking-wider">
                Receta Lista para Recojo en Farmacia EsSalud ({pendingPickupCount})
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Hay medicamentos aprobados por el médico en la farmacia de la IPRESS. Confirma el recojo para habilitar la toma en el móvil.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('PENDING_PICKUP')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-heading font-semibold uppercase rounded-xl tracking-wider transition-all"
          >
            Ver Pendientes
          </button>
        </div>
      )}

      {/* Barra de Búsqueda y Pestañas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por fármaco, dosis o código de receta..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all ${
              statusFilter === 'ALL' ? 'bg-[#003876] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({medications.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all ${
              statusFilter === 'ACTIVE' ? 'bg-[#005CA9] text-white shadow-xs' : 'bg-blue-50 text-[#005CA9] hover:bg-blue-100'
            }`}
          >
            En Uso Domicilio
          </button>
          <button
            onClick={() => setStatusFilter('PENDING_PICKUP')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold transition-all ${
              statusFilter === 'PENDING_PICKUP' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pendiente Recojo ({pendingPickupCount})
          </button>
        </div>
      </div>

      {/* Grid de Recetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-slate-900 text-base">No hay recetas registradas</h3>
            <p className="text-xs text-slate-500 font-light mt-1">
              Presione el botón "Nueva Receta Médica" para agregar un tratamiento para {activePatient.fullName}.
            </p>
          </div>
        ) : (
          filteredMedications.map(med => {
            const isPickupPending = med.estadoDispensacion === 'PENDIENTE_RECOJO';
            const currentStockVal = med.currentStock ?? 30;
            const isLowStock = currentStockVal <= 5 && !isPickupPending;

            return (
              <div 
                key={med.id} 
                className={`bg-white rounded-3xl p-6 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isPickupPending 
                    ? 'border-amber-300 bg-amber-50/20' 
                    : med.isActive ? 'border-slate-200/80' : 'border-slate-200/60 opacity-75 bg-slate-50/40'
                }`}
              >
                <div>
                  {/* Encabezado con Código Oficial EsSalud */}
                  <div className="flex items-center justify-between text-[11px] font-heading font-semibold mb-3 border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-mono">
                      {med.numeroRecetaEssalud || 'REC-ESSALUD'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPickupPending 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : med.estadoDispensacion === 'AGOTADA'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-50 text-[#005CA9] border border-blue-200'
                    }`}>
                      {isPickupPending ? 'POR RECOGER' : med.estadoDispensacion === 'AGOTADA' ? 'AGOTADA' : 'EN HOGAR'}
                    </span>
                  </div>

                  {/* Foto de la Pastilla + Nombre */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <PillThumbnail name={med.name} imageUrl={med.imageUrl} size="lg" />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-base text-slate-900 truncate" title={med.name}>
                        {med.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 mt-1 bg-blue-50 text-[#005CA9] font-heading font-bold text-xs rounded-md">
                        {med.dosage}
                      </span>
                      <p className="text-xs text-slate-500 font-light mt-1.5 line-clamp-2 leading-relaxed">
                        {med.instructions || 'Tomar según prescripción médica.'}
                      </p>
                    </div>
                  </div>

                  {/* Datos de Dispensación y Farmacia */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 text-xs text-slate-700 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-[#005CA9]" /> Farmacia:
                      </span>
                      <span className="font-medium text-slate-800 truncate max-w-[160px]">
                        {med.ipressFarmacia || 'Policlínico Chincha'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-[#005CA9]" /> Horario:
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-right">
                        {(med.times || ['08:00']).join(', ')}
                        <span className="block text-[10px] font-heading font-semibold text-[#005CA9]">
                          {med.frequencyHours ? `Cada ${med.frequencyHours} horas (${med.times?.length || 1} tomas/día)` : '1 toma/día'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Stock Actual en Hogar:</span>
                      <span className={`font-bold font-mono ${
                        isLowStock ? 'text-rose-600' : 'text-slate-900'
                      }`}>
                        {currentStockVal} comprimidos
                        {isLowStock && ' (¡Bajo!)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones de Farmacia y Cuidador */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                  {isPickupPending ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleConfirmPickup(med.id, med.name)}
                        className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-heading font-bold uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Confirmar Recojo en Farmacia</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleMarkHomeAvailable(med.id, med.name)}
                          className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-[#005CA9] text-[11px] font-heading font-bold rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-1"
                          title="Indicar que ya se tiene este medicamento en el domicilio"
                        >
                          <span>🏠 Ya tengo en casa</span>
                        </button>

                        <button
                          onClick={() => handleReportStockout(med.id, med.name)}
                          className="py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-heading font-bold rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1"
                          title="Reportar falta de stock en la farmacia de EsSalud"
                        >
                          <span>⚠️ Desabastecido</span>
                        </button>
                      </div>
                    </div>
                  ) : med.estadoDispensacion === 'DESABASTECIDO' ? (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs font-heading font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>Falta de stock en farmacia reportada</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleConfirmPickup(med.id, med.name)}
                          className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-heading font-bold rounded-xl transition-colors"
                        >
                          🏥 Ya llegó stock
                        </button>
                        <button
                          onClick={() => handleMarkHomeAvailable(med.id, med.name)}
                          className="py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-heading font-bold rounded-xl transition-colors"
                        >
                          🏠 Conseguí en casa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleRestock(med.id, med.name)}
                        title="Reponer +30 pastillas en el pastillero"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-[#005CA9] text-xs font-heading font-bold rounded-xl flex items-center gap-1 transition-colors border border-slate-200"
                      >
                        <RefreshCw className="w-3 h-3 text-[#005CA9]" />
                        <span>+30 Stock</span>
                      </button>

                      <button
                        onClick={() => handleToggle(med.id, med.isActive, med.name)}
                        className={`inline-flex items-center gap-1.5 text-xs font-heading font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                          med.isActive 
                            ? 'border-amber-200 text-amber-700 hover:bg-amber-50' 
                            : 'border-blue-200 text-[#005CA9] hover:bg-blue-50'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{med.isActive ? 'Pausar' : 'Reanudar'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Recetar Nuevo Medicamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  Nueva Receta EsSalud Digital
                </h3>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                  Paciente: {activePatient.fullName} • IPRESS: {activePatient.ipressEssalud || 'Policlínico Chincha'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Medicamento *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Metformina 850mg, Amlodipino 5mg"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dosis *
                  </label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="Ej: 1 tableta, 50 mg"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Frecuencia de Toma *
                  </label>
                  <select
                    value={frequencyHours}
                    onChange={e => setFrequencyHours(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none bg-white font-medium text-slate-800"
                  >
                    <option value={24}>1 vez al día (Cada 24 horas)</option>
                    <option value={12}>2 veces al día (Cada 12 horas - 08:00 y 20:00)</option>
                    <option value={8}>3 veces al día (Cada 8 horas - 08:00, 14:00, 20:00)</option>
                    <option value={6}>4 veces al día (Cada 6 horas - 06:00, 12:00, 18:00, 23:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hora de Referencia Inicial
                </label>
                <input
                  type="time"
                  value={times}
                  onChange={e => setTimes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-light mt-1 block">
                  Para dosis múltiples, el sistema distribuirá los turnos de desayuno, almuerzo y cena automáticamente.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Instrucciones Médicas
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="Ej: Tomar 30 minutos antes del desayuno con agua tibia."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none"
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
                  className="px-5 py-2.5 rounded-xl bg-[#005CA9] hover:bg-[#004884] text-white text-xs font-heading font-semibold uppercase tracking-wider shadow-sm"
                >
                  Guardar y Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Simular Emisión de Receta desde Policlínico EsSalud */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    Simular Emisión de Receta Oficial
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Médico Tratante: Dr. Manuel Flores Barreda • EsSalud Digital
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-light mb-4 leading-relaxed">
              Seleccione un medicamento para que el sistema de EsSalud emita una receta electrónica en estado <strong className="font-semibold text-amber-800">PENDIENTE DE RECOJO</strong> en la farmacia del policlínico:
            </p>

            <div className="space-y-3">
              {[
                {
                  name: 'Atorvastatina 20mg',
                  dosage: '1 tableta',
                  desc: '1 toma diaria (20:00 Cena) • Perfil lipídico y colesterol',
                  instructions: 'Tomar 1 comprimido por la noche con medio vaso con agua.',
                  imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=60',
                  frequencyHours: 24
                },
                {
                  name: 'Paracetamol 500mg',
                  dosage: '1 tableta',
                  desc: '3 tomas diarias (08:00, 14:00, 20:00 - Cada 8h) • Dolor y malestar',
                  instructions: 'Tomar 1 tableta después de cada comida con agua.',
                  imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60',
                  frequencyHours: 8
                },
                {
                  name: 'Metformina 850mg',
                  dosage: '1 tableta',
                  desc: '2 tomas diarias (08:00 y 20:00 - Cada 12h) • Control glucémico',
                  instructions: 'Tomar 1 tableta inmediatamente con el desayuno y con la cena.',
                  imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&auto=format&fit=crop&q=60',
                  frequencyHours: 12
                },
                {
                  name: 'Enalapril 10mg',
                  dosage: '1 comprimido',
                  desc: '1 toma diaria (08:00 Desayuno) • Control de hipertensión',
                  instructions: 'Tomar 1 comprimido al despertar a las 08:00 AM.',
                  imageUrl: 'https://images.unsplash.com/photo-1550572017-edb79984244b?w=300&auto=format&fit=crop&q=60',
                  frequencyHours: 24
                }
              ].map(preset => (
                <div
                  key={preset.name}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-amber-400 bg-white hover:bg-amber-50/20 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={preset.imageUrl} 
                      alt={preset.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-heading font-bold text-xs text-slate-900 truncate">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-light truncate">
                        {preset.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isSimulating}
                    onClick={() => handleSimulatePrescription(preset)}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-heading font-bold shadow-2xs transition-all flex-shrink-0 disabled:opacity-50"
                  >
                    {isSimulating ? 'Emitiendo...' : 'Emitir Receta'}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-5 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSimulateModalOpen(false)}
                className="px-4 py-2 text-xs font-heading font-semibold text-slate-500 hover:text-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
