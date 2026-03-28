/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#f8fafc', // slate-50 (light background)
        darkCard: '#ffffff', // pure white (light panels)
        primary: {
          light: '#c084fc', // purple-400
          DEFAULT: '#a855f7', // purple-500
          dark: '#7e22ce', // purple-700
        },
        secondary: {
          light: '#f472b6', // pink-400
          DEFAULT: '#ec4899', // pink-500
          dark: '#be185d', // pink-700
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
