import React, { useState } from 'react';

interface EsSaludLogoProps {
  className?: string;
  variant?: 'full' | 'simple' | 'icon';
  showSubtitle?: boolean;
}

export const EsSaludLogo: React.FC<EsSaludLogoProps> = ({
  className = 'h-10',
  variant = 'full',
  showSubtitle = true
}) => {
  const [imgError, setImgError] = useState(false);

  // Si el usuario coloca su propia imagen oficial en /public/images/essalud-logo.png o .svg,
  // la cargamos prioritariamente. Si aún no existe, el componente usa el vector oficial inline.
  if (!imgError) {
    const src = variant === 'full' 
      ? '/images/essalud-contigo-logo.svg' 
      : '/images/essalud-logo.svg';

    return (
      <img
        src={src}
        alt="Logo Oficial EsSalud Contigo"
        className={`${className} object-contain`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback Vectorial Oficial de EsSalud (Azul #005CA9, Verde #009B3A y Blanco)
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Isotipo Oficial EsSalud: Figura Humana Asistencial + Hoja de Salud */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Cabeza / Sol Asistencial */}
          <circle cx="32" cy="14" r="8" fill="#005CA9" />
          
          {/* Cuerpo Protector Azul EsSalud */}
          <path d="M12 36 C12 24, 52 24, 52 36 C52 48, 42 56, 32 60 C22 56, 12 48, 12 36 Z" fill="#005CA9" />
          
          {/* Hoja Verde EsSalud */}
          <path d="M38 10 C46 6, 54 12, 52 22 C44 24, 36 18, 38 10 Z" fill="#009B3A" />
          
          {/* Cruz Blanca Interior */}
          <path d="M29 32 L35 32 L35 48 L29 48 Z" fill="#FFFFFF" />
          <path d="M24 37 L40 37 L40 43 L24 43 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1 font-heading font-extrabold text-xl tracking-tight">
            <span className="text-[#005CA9]">EsSalud</span>
            {variant === 'full' && (
              <span className="text-[#009B3A] font-bold">CONTIGO</span>
            )}
          </div>
          {showSubtitle && (
            <span className="text-[9px] font-heading font-bold text-[#003876] tracking-wider uppercase mt-0.5">
              Seguro Social de Salud
            </span>
          )}
        </div>
      )}
    </div>
  );
};
