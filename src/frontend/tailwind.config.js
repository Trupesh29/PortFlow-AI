/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d17',
          900: '#0a192f',
          850: '#0f2442',
          800: '#142c4f',
          700: '#1e3d6b',
        },
        maritime: {
          teal: '#0d9488',
          cyan: '#06b6d4',
          accent: '#14b8a6',
          slate: '#334155'
        },
        port: {
          warmWhite: '#faf9f6',
          lavender: '#f3e8ff',
          lavenderDark: '#7e22ce',
          amber: '#f59e0b',
          amberLight: '#fef3c7',
          green: '#10b981',
          greenLight: '#d1fae5',
          red: '#ef4444',
          redLight: '#fee2e2',
          orange: '#f97316',
          orangeLight: '#ffedd5',
          softNavy: '#e2e8f0', // slate-200
        }
      }
    },
  },
  plugins: [],
}