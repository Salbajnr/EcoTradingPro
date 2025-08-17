
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff9ff',
          100: '#dff2ff',
          200: '#b9e4ff',
          300: '#85d0ff',
          400: '#4bb6ff',
          500: '#0a84ff',
          600: '#0769db',
          700: '#0953aa',
          800: '#0b427f',
          900: '#0b375f'
        },
        emerald: {
          500: '#10B981'
        }
      },
      boxShadow: {
        glow: '0 8px 40px rgba(10,132,255,.25)'
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-in': 'fadeIn .8s ease',
        'pulse-soft': 'pulse 3s ease-in-out infinite',
        'blob': 'blob 16s infinite'
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-10px, 20px) scale(0.98)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
