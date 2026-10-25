import React from 'react';
import { Link } from 'react-router-dom';
import { EsSaludLogo } from '../../components/common/EsSaludLogo';
import { 
  Users, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  HeartHandshake,
  Pill,
  CalendarCheck
} from 'lucide-react';

export const ContigoLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-950">
      
      {/* 1. Header Institucional Oficial */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group" title="EsSalud Contigo">
            <EsSaludLogo variant="full" className="h-12" />
          </Link>

          <div className="flex items-center space-x-3">
            <a
              href="/modo-senior"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-heading font-semibold text-slate-700 hover:text-[#005CA9] px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              title="Abrir App Móvil del Adulto Mayor en una nueva pestaña"
            >
              <Smartphone className="w-4 h-4 text-[#005CA9]" />
              <span className="hidden sm:inline">Modo Senior (Nueva Pestaña ↗)</span>
              <span className="sm:hidden">Senior ↗</span>
            </a>

            <Link
              to="/login"
              className="bg-[#005CA9] hover:bg-[#004885] text-white text-xs font-heading font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Acceso Cuidador</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Banner Principal Oficial (Hero Compacto) */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-4xl w-full">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Acento azul superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#005CA9]" />

            {/* Chip de Identidad Institucional */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#003876] text-xs font-heading font-semibold mb-6">
              <ShieldCheck className="w-4 h-4 text-[#005CA9]" />
              <span>Seguro Social de Salud · Red Asistencial EsSalud</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 tracking-tight leading-tight">
              Ecosistema Integral <span className="text-[#005CA9]">EsSalud Contigo</span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              Plataforma de teleasistencia geriátrica que conecta las recetas y citas de la IPRESS con el cuidado activo en el hogar del asegurado crónico.
            </p>

            {/* Dos Puertas de Entrada Claras */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 text-left max-w-2xl mx-auto">
              
              {/* Opción 1: Portal Cuidador */}
              <Link 
                to="/login"
                className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-[#005CA9] bg-white hover:bg-blue-50/40 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-[#005CA9] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-[#005CA9] transition-colors">
                    Portal del Cuidador
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-1.5 leading-normal">
                    Supervisa dosis diarias, stock en farmacia EsSalud, historial de presión arterial y agenda citas médicas.
                  </p>
                </div>
                
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-heading font-bold text-[#005CA9]">
                  <span>Ingresar con Cuenta</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Opción 2: App Móvil Senior */}
              <a 
                href="/modo-senior"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-[#009B3A] bg-white hover:bg-emerald-50/40 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-100/70 text-[#009B3A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors">
                    App Adulto Mayor (Modo Senior)
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-1.5 leading-normal">
                    Diseño accesible sin contraseña: botón gigante de 64px "YA LA TOMÉ", lectura por voz y botón de auxilio SOS.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-heading font-bold text-[#009B3A]">
                  <span>Abrir en Nueva Pestaña</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

            </div>

            {/* Badges de soporte clínico */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-[#005CA9]" />
                Integrado con Red IPRESS EsSalud
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Pill className="w-4 h-4 text-[#005CA9]" />
                Trazabilidad de Recetas Oficiales
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <HeartHandshake className="w-4 h-4 text-[#005CA9]" />
                Accesibilidad Universal WCAG AAA
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* 3. Footer Oficial EsSalud */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 EsSalud - Seguro Social de Salud del Perú. Todos los derechos reservados.</p>
          <div className="flex items-center space-x-4 text-slate-500 font-medium text-[11px]">
            <span>Línea Telefónica Gratuita: 107</span>
            <span>·</span>
            <span>Centro Médico de Ayuda Geriátrica</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
