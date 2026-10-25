import React, { useState } from 'react';
import { Pill } from 'lucide-react';

interface PillThumbnailProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
}

export const PillThumbnail: React.FC<PillThumbnailProps> = ({
  name,
  imageUrl,
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  // Dimensiones estrictas en Tailwind estándar
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
    hero: 'w-full h-full min-h-[90px] max-h-[140px]',
  }[size];

  const lowerName = name.toLowerCase();

  // Gráfico vectorial farmacéutico según el tipo de medicamento
  const renderVectorPill = () => {
    // 1. Losartán (Comprimido redondo ranurado con tono rosado/blanco)
    if (lowerName.includes('losart')) {
      return (
        <svg viewBox="0 0 64 64" className="w-3/4 h-3/4 drop-shadow-sm" fill="none">
          <circle cx="32" cy="32" r="26" fill="#FCE7F3" stroke="#F472B6" strokeWidth="2.5" />
          <path d="M32 10 L32 54" stroke="#F472B6" strokeWidth="2" strokeDasharray="2 1" />
          <text x="32" y="36" textAnchor="middle" fill="#BE185D" fontSize="10" fontWeight="bold" fontFamily="monospace">
            50
          </text>
        </svg>
      );
    }

    // 2. Metformina (Comprimido alargado blanco ranurado)
    if (lowerName.includes('metformin')) {
      return (
        <svg viewBox="0 0 64 64" className="w-3/4 h-3/4 drop-shadow-sm" fill="none">
          <rect x="12" y="20" width="40" height="24" rx="12" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
          <path d="M32 20 L32 44" stroke="#CBD5E1" strokeWidth="2" />
          <text x="32" y="35" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="bold" fontFamily="monospace">
            850
          </text>
        </svg>
      );
    }

    // 3. Atorvastatina (Comprimido ovalado azul claro / blanco)
    if (lowerName.includes('atorvastat')) {
      return (
        <svg viewBox="0 0 64 64" className="w-3/4 h-3/4 drop-shadow-sm" fill="none">
          <ellipse cx="32" cy="32" rx="24" ry="16" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2.5" />
          <path d="M32 16 L32 48" stroke="#38BDF8" strokeWidth="1.5" />
          <text x="32" y="35" textAnchor="middle" fill="#0369A1" fontSize="9" fontWeight="bold" fontFamily="monospace">
            20
          </text>
        </svg>
      );
    }

    // 4. Vitamina D3 (Cápsula blanda dorada)
    if (lowerName.includes('vitamina') || lowerName.includes('d3')) {
      return (
        <svg viewBox="0 0 64 64" className="w-3/4 h-3/4 drop-shadow-sm" fill="none">
          <ellipse cx="32" cy="32" rx="22" ry="14" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
          <ellipse cx="28" cy="28" rx="14" ry="6" fill="#FDE68A" />
        </svg>
      );
    }

    // Default: Cápsula bicolor institucional EsSalud (Azul #005CA9 / Blanco)
    return (
      <svg viewBox="0 0 64 64" className="w-3/4 h-3/4 drop-shadow-sm" fill="none">
        {/* Mitad superior azul */}
        <path d="M22 28 C22 20, 26 14, 32 14 C38 14, 42 20, 42 28 L42 32 L22 32 Z" fill="#005CA9" stroke="#003876" strokeWidth="2" />
        {/* Mitad inferior blanca */}
        <path d="M22 32 L42 32 L42 36 C42 44, 38 50, 32 50 C26 50, 22 44, 22 36 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
        {/* Anillo de unión */}
        <line x1="22" y1="32" x2="42" y2="32" stroke="#003876" strokeWidth="2.5" />
      </svg>
    );
  };

  return (
    <div
      className={`${sizeClasses} rounded-2xl bg-slate-50 border border-slate-200/90 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all shadow-2xs ${className}`}
    >
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        renderVectorPill()
      )}
    </div>
  );
};
