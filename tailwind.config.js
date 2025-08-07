// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This includes all .js, .ts, .jsx, .tsx files in the src folder and its subfolders
  ],
  darkMode: 'class', // Aggiunta questa riga per abilitare la modalità scura basata sulla classe
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Define the Inter font
      },
    },
  },
  plugins: [],
}
