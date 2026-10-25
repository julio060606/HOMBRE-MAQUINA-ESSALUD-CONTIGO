/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Paleta Institucional Oficial de EsSalud (Azul, Blanco y Verde)
        essalud: {
          blue: '#005CA9',         // Azul Principal EsSalud (Pantone 300 C)
          'blue-dark': '#003876',   // Azul Oscuro EsSalud
          'blue-deep': '#002042',   // Azul Noche para máxima legibilidad
          'blue-light': '#EBF4FD',  // Fondo celeste limpio institucional
          'blue-hover': '#004B8A',
          green: '#009B3A',        // Verde Salud EsSalud (Pantone 355 C)
          'green-dark': '#007A2E',
          'green-light': '#E8F8EE', // Verde pastel suave
          white: '#FFFFFF',
          gray: '#F8FAFC',
        },
        // Mapeo retrocompatible para componentes del sistema
        forest: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#BAE0FD',
          300: '#7CC0FD',
          400: '#369EFA',
          500: '#0066CA',
          600: '#005CA9', // Azul EsSalud
          700: '#005CA9', // Azul Principal EsSalud
          800: '#003876', // Azul Oscuro EsSalud
          900: '#002042',
        },
        // Verde médico para confirmación de tomas y citas
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#009B3A',
          600: '#009B3A',
          700: '#007A2E',
          800: '#065F46',
        },
        warmbg: '#F8FAFC',
        surface: '#FFFFFF',
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 92, 169, 0.05)',
        'soft-md': '0 2px 4px 0 rgba(0, 92, 169, 0.08)',
        'soft-lg': '0 4px 12px -2px rgba(0, 92, 169, 0.1)',
      },
    },
  },
  plugins: [],
}
