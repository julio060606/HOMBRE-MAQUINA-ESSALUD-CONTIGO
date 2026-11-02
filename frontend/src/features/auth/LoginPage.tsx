import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { EsSaludLogo } from '../../components/common/EsSaludLogo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('gerson.vega@essalud-contigo.pe');
  const [password, setPassword] = useState('12345678');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('gerson.vega@essalud-contigo.pe');
    setPassword('12345678');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* Logotipo Oficial EsSalud Contigo */}
        <Link to="/landing" className="inline-flex justify-center mb-4 group" title="Ir al Portal EsSalud Contigo">
          <EsSaludLogo variant="full" className="h-14 mx-auto" />
        </Link>

        <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
          Portal del Cuidador Familiar
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-light">
          Seguimiento de recetas, citas médicas en IPRESS y teleasistencia del asegurado.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          
          {/* Banner de error si fallan credenciales */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 mb-5 flex items-start gap-2.5 text-rose-900 text-xs rounded-xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cuenta demo verificada en BD */}
          <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 mb-6 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-950">
              <ShieldCheck className="w-4 h-4 text-[#005CA9] flex-shrink-0" />
              <span>Cuenta Demo: <strong className="font-semibold text-blue-900">Gerson Vega</strong></span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-heading font-bold text-[#005CA9] hover:underline"
            >
              Autocompletar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-heading font-medium text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  data-testid="input-login-email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none text-xs text-slate-900 font-normal transition-all"
                  placeholder="gerson.vega@essalud-contigo.pe"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-heading font-medium text-slate-700 uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  data-testid="input-login-password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#005CA9]/20 focus:border-[#005CA9] focus:outline-none text-xs text-slate-900 font-mono transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-light">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#005CA9] focus:ring-[#005CA9] mr-2" />
                Recordar sesión
              </label>
              <a href="#olvide" onClick={e => { e.preventDefault(); alert('Ingrese con la contraseña: 12345678'); }} className="text-[#005CA9] hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                data-testid="btn-submit-login"
                className="w-full bg-[#005CA9] hover:bg-[#004885] text-white font-heading font-semibold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60"
              >
                <span>{isLoading ? 'Validando en EsSalud...' : 'Ingresar al Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-500 font-light">
              ¿No tienes una cuenta de cuidador?{' '}
              <Link to="/register" className="font-semibold text-[#005CA9] hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
