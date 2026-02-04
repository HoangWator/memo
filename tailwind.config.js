/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'red', // blue-500
        'secondary': '#64748b', // slate-500
        'success': '#22c55e', // green-500
        'warning': '#eab308', // yellow-500
        'danger': '#ef4444', // red-500
        'surface': '#272c2f',
        // Word types colors
        'noun': '#3b82f6',
        'verb': '#22c55e',
        'adjective': '#eab308',
        'adverb': '#8b5cf6',
        'other': '#64748b',
      }
    },
  },
  plugins: [],
}
