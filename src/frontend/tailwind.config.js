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
        }
      }
    },
  },
  plugins: [],
}