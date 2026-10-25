import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Pill, 
  Calendar,
  Activity, 
  FileText, 
  Sliders, 
  Smartphone,
  Sparkles
} from 'lucide-react';
import { MobilePatientSimulatorModal } from '../simulator/MobilePatientSimulatorModal';

export const Sidebar: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Panel del Cuidador', icon: LayoutDashboard, testId: 'nav-dashboard' },
    { to: '/appointments', label: 'Citas Médicas EsSalud', icon: Calendar, testId: 'nav-appointments' },
    { to: '/medications', label: 'Medicamentos & Recetas', icon: Pill, testId: 'nav-medications' },
    { to: '/vitals', label: 'Presión & Biometría', icon: Activity, testId: 'nav-vitals' },
    { to: '/reports', label: 'Reporte Médico PDF', icon: FileText, testId: 'nav-reports' },
    { to: '/settings', label: 'Ajustes & Umbrales', icon: Sliders, testId: 'nav-settings' },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200/70 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 select-none font-sans">
        <div>
          {/* Módulos de Gestión del Cuidador */}
          <div className="text-[10px] font-heading font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2.5">
            Módulos del Cuidador
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  data-testid={item.testId}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 text-xs font-heading uppercase tracking-wider rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-[#005CA9] text-white font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-blue-50/60 hover:text-[#005CA9] font-medium'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Separador e Ítem Especial de la App del Adulto Mayor */}
          <div className="pt-5 mt-4 border-t border-slate-100">
            <div className="text-[10px] font-heading font-bold text-[#005CA9] uppercase tracking-widest px-3 mb-2.5 flex items-center justify-between">
              <span>Experiencia Paciente</span>
              <span className="w-2 h-2 rounded-full bg-[#005CA9] animate-pulse"></span>
            </div>

            <a
              href="/modo-senior"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="nav-patient-sim"
              className="flex items-center justify-between px-3.5 py-2.5 text-xs font-heading uppercase tracking-wider rounded-xl transition-all duration-150 border bg-blue-50/70 hover:bg-blue-100/80 text-[#003876] border-blue-200/80 font-bold group"
              title="Abrir App Móvil del Asegurado en una nueva pestaña (sin cerrar el portal)"
            >
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-4 h-4 flex-shrink-0 text-[#005CA9]" />
                <span>App Adulto Mayor</span>
              </div>
              <span className="text-[9px] bg-white text-[#005CA9] px-1.5 py-0.5 rounded font-bold shadow-2xs group-hover:scale-105 transition-transform flex items-center gap-0.5">
                <span>Móvil</span>
                <span>↗</span>
              </span>
            </a>
          </div>
        </div>

        {/* Tarjeta de Sincronización Móvil en Tiempo Real */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/60 border border-blue-200/70 rounded-2xl p-4 mt-6">
          <div className="flex items-center justify-between text-slate-900 font-heading font-semibold text-xs mb-1.5 uppercase tracking-wider">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#005CA9]" />
              <span className="text-[#003876] font-bold">Sync Bidireccional</span>
            </div>
            <span className="text-[9px] bg-blue-100 text-[#005CA9] px-1.5 py-0.5 rounded font-mono font-bold">
              EN VIVO
            </span>
          </div>
          
          <p className="text-[11px] text-slate-500 font-light leading-relaxed mb-3">
            Las tomas y alertas del teléfono se sincronizan de inmediato con este portal.
          </p>

          <a
            href="/modo-senior"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="btn-sidebar-quick-simulator"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-blue-50 text-[#005CA9] border border-blue-200 rounded-xl text-[11px] font-heading font-semibold uppercase tracking-wider transition-all shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#005CA9]" />
            <span>Abrir en Nueva Pestaña ↗</span>
          </a>
        </div>
      </aside>

      {/* Modal flotante invocado desde el Sidebar */}
      <MobilePatientSimulatorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
