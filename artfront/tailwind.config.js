/** @type {import('tailwindcss').Config} */
export default {
  
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inder': ['Inder', 'sans-serif'],
        'inria': ['Inria Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}