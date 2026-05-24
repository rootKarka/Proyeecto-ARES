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
        ares: {
          blue:    '#1F70C1',
          'blue-light': '#4A90D9',
          dark:    '#0A0A0A',
          surface: '#2C2F3B',
          light:   '#E8E8E8',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms'),
  ],
}