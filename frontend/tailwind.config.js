/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-primary': '#2563EB',
        'brand-secondary': '#64748B',
        'brand-accent': '#3B82F6',
        'brand-success': '#10B981',
        'brand-error': '#EF4444',
        // Escala de Grises Minimalista (Slate)
        'light-bg': '#FFFFFF',
        'light-surface': '#F8FAFC',
        'light-border': '#F1F5F9',
        'light-text': '#0F172A',
        'dark-bg': '#020617',
        'dark-surface': '#0F172A',
        'dark-border': '#1E293B',
        'dark-text': '#F8FAFC',
        // Mantener compatibilidad con clases gray/slate existentes
        gray: colors.slate,
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'glass': '1.5rem',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
      }
    },
  },
  plugins: [],
}
