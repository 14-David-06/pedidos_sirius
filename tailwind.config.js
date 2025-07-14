/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores Sirius Regenerative - Professional Branding
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1e3a8a', // Azul Sirius profesional
          600: '#1e40af',
          700: '#1d4ed8',
          800: '#2563eb',
          900: '#3b82f6',
          950: '#60a5fa',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a', // Verde Sirius profesional
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
          950: '#021810',
        },
        sirius: {
          blue: '#1e3a8a',
          green: '#16a34a', 
          orange: '#f59e0b',
          dark: '#1f2937',
          light: '#f9fafb',
          gray: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'medical': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medical-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
