/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Soporte para modo oscuro
  theme: {
    extend: {
      keyframes: {
        'aurora-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        }
      },
      animation: {
        'aurora-flow': 'aurora-flow 1.5s ease-in-out infinite alternate',
      }
    },
  },
  plugins: [],
}
