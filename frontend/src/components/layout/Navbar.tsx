import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Smartphone, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { MobilePatientSimulatorModal } from '../simulator/MobilePatientSimulatorModal';
import { EsSaludLogo } from '../common/EsSaludLogo';

interface NavbarProps {
  onOpenLinkModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLinkModal }) => {
  const { user, logout } = useAuth();
  const { activePatient, patients, setActivePatient } = usePatient();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Oficial EsSalud Contigo */}
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-3 group" title="Ir al Panel Principal de EsSalud Contigo">
            <EsSaludLogo variant="full" className="h-10" />
          </Link>

          <span className="text-slate-200 font-light text-base hidden sm:inline select-none">|</span>

          {/* Selector de Paciente Activo */}
          {activePatient && (
            <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-200/70 rounded-xl px-3 py-1.5 text-xs shadow-xs">
              <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-[#005CA9]">
                Asegurado:
              </span>
              <select
                value={activePatient.id}
                onChange={(e) => {
                  const p = patients.find(pat => pat.id === e.target.value);
                  if (p) setActivePatient(p);
                }}
                data-testid="select-patient-active"
                className="bg-transparent font-heading font-semibold text-slate-900 focus:outline-none cursor-pointer pr-2"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.age} años)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Acciones del Usuario & Acceso Móvil */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Botón Abrir App Adulto Mayor en Nueva Pestaña */}
          <a
            href="/modo-senior"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="btn-open-mobile-simulator"
            className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#005CA9] font-heading font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-all"
            title="Abrir la App Móvil del Adulto Mayor en una nueva pestaña (sin cerrar esta ventana)"
          >
            <Smartphone className="w-4 h-4 text-[#005CA9] flex-shrink-0" />
            <span className="hidden md:inline">App Senior (Nueva Pestaña)</span>
            <span className="md:hidden">App Senior</span>
            <ExternalLink className="w-3 h-3 text-[#005CA9]" />
          </a>

          <Link
            to="/landing"
            title="Ver presentación y detalles del sistema EsSalud Contigo"
            className="hidden lg:flex items-center gap-1.5 text-xs font-heading font-medium text-slate-600 hover:text-[#005CA9] uppercase tracking-wider transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <span>Ver Landing</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <span className="text-slate-200 font-light text-base select-none hidden sm:inline">|</span>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#005CA9] font-heading font-bold text-xs shadow-xs">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-heading font-semibold text-slate-900 text-xs leading-none">
                  {user?.name || 'Gerson Ramos'}
                </div>
                <div className="text-[10px] text-slate-400 font-light mt-0.5">Cuidador Principal</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              data-testid="btn-logout"
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Modal Simulador del Móvil del Paciente */}
      <MobilePatientSimulatorModal 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
      />
    </header>
  );
};
