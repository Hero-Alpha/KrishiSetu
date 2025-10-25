/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf2dc', 
          500: '#4a7c3a',
          600: '#3a6a2a',
          700: '#2d5016',
        }
      }
    },
  },
}